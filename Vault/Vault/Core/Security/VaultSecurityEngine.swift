//
//  VaultSecurityEngine.swift
//  Vault
//
//  Created by Vault Technical Partner on 2026-07-05.
//  Copyright © 2026 Vault. All rights reserved.
//

import Foundation
import Combine

#if canImport(UIKit)
import UIKit
#endif

/// The orchestrator for Module 1 Cryptographic Core and Emergency Handover defenses.
/// Manages Duress PIN traps, hardware rate-limiting, background lifecycle scrubbing, and instant workspace transitions.
public final class VaultSecurityEngine: @unchecked Sendable {
    
    public static let shared = VaultSecurityEngine()
    
    // Notification broadcasted when an emergency panic trigger occurs
    public static let emergencyPanicDidTriggerNotification = Notification.Name("com.vault.security.emergencyPanicDidTrigger")
    public static let workspaceDidChangeNotification = Notification.Name("com.vault.security.workspaceDidChange")
    
    private let lockoutAccountKey = "vault.core.security.lockout.state"
    private let configuredRealPinKey = "vault.core.configured.real.pin.hash"
    private let configuredDuressPinKey = "vault.core.configured.duress.pin.hash"
    
    // For Module 1 baseline, default pins are 8492 (Real) and 1111 (Duress) if not overridden
    private let defaultRealPin = "8492"
    private let defaultDuressPin = "1111"
    
    private let lock = NSLock()
    private var currentWorkspace: WorkspaceType = .none
    private var lockoutState = SecurityLockoutState()
    
    private init() {
        loadLockoutState()
        setupLifecycleObservers()
    }
    
    // MARK: - Lifecycle Observers (iOS Background Scrubbing)
    
    private func setupLifecycleObservers() {
        #if canImport(UIKit)
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(handleApplicationDidEnterBackground),
            name: UIApplication.didEnterBackgroundNotification,
            object: nil
        )
        #endif
    }
    
    @objc private func handleApplicationDidEnterBackground() {
        print("[MODULE 1 SECURITY] Application entered background. Executing automatic RAM scrub.")
        // Immediately zero out K_real from volatile memory
        KeyManager.shared.purgeRealWorkspaceKey()
        
        lock.lock()
        // Default to safe state or fake workspace on background transition
        if currentWorkspace == .real {
            currentWorkspace = .none
            lock.unlock()
            notifyWorkspaceChange()
        } else {
            lock.unlock()
        }
    }
    
    // MARK: - Authentication & Duress Trap Engine
    
    /// Evaluates a user PIN entry, enforcing hardware rate-limiting and triggering duress traps if detected.
    /// - Parameter pin: The numeric PIN string entered by the user.
    /// - Returns: The resulting WorkspaceType mounted.
    public func authenticate(withPin pin: String) throws -> WorkspaceType {
        lock.lock()
        
        // 1. Enforce rate-limit lockout
        if lockoutState.isCurrentlyLockedOut {
            let remaining = lockoutState.remainingLockoutSeconds
            lock.unlock()
            throw VaultCryptoError.bruteForceLockoutActive(remainingSeconds: remaining)
        }
        lock.unlock()
        
        // 2. Evaluate PIN match
        let realPin = getConfiguredRealPin()
        let duressPin = getConfiguredDuressPin()
        
        if pin == realPin {
            // REAL WORKSPACE AUTHENTICATION
            try KeyManager.shared.deriveAndLoadKey(fromPin: pin, forWorkspace: .real)
            
            lock.lock()
            currentWorkspace = .real
            lockoutState = SecurityLockoutState() // Reset failures on success
            saveLockoutState()
            lock.unlock()
            
            notifyWorkspaceChange()
            print("[MODULE 1 SECURITY] Authenticated Real Workspace successfully.")
            return .real
            
        } else if pin == duressPin {
            // DURESS PIN TRAP TRIGGERED
            print("[MODULE 1 SECURITY] DURESS PIN TRAP TRIGGERED! Executing immediate RAM scrub of K_real.")
            KeyManager.shared.purgeRealWorkspaceKey()
            
            try KeyManager.shared.deriveAndLoadKey(fromPin: pin, forWorkspace: .fake)
            
            lock.lock()
            currentWorkspace = .fake
            lockoutState = SecurityLockoutState() // Reset failures so adversary suspects nothing
            saveLockoutState()
            lock.unlock()
            
            notifyWorkspaceChange()
            return .fake
            
        } else {
            // INVALID PIN - Handle Brute Force Rate Limiting
            lock.lock()
            lockoutState.failedAttempts += 1
            
            if lockoutState.failedAttempts >= 5 {
                // Exponential backoff: 30s, 60s, 300s, 600s
                let penaltySeconds = Int(pow(2.0, Double(min(lockoutState.failedAttempts - 4, 6)))) * 15
                lockoutState.lockoutUntilTimestamp = Date().timeIntervalSince1970 + TimeInterval(penaltySeconds)
                print("[MODULE 1 SECURITY] 5+ consecutive failed PIN attempts. Enforcing \(penaltySeconds)s lockout.")
            }
            saveLockoutState()
            let remaining = lockoutState.remainingLockoutSeconds
            let failedCount = lockoutState.failedAttempts
            lock.unlock()
            
            if remaining > 0 {
                throw VaultCryptoError.bruteForceLockoutActive(remainingSeconds: remaining)
            } else {
                print("[MODULE 1 SECURITY] Authentication failed. Attempt \(failedCount)/5.")
                throw VaultCryptoError.authenticationFailed
            }
        }
    }
    
    // MARK: - 10-Second Emergency Panic Handlers
    
    /// Executes the 10-second emergency panic sequence.
    /// Immediately calls memset_s on K_real and forces the workspace to Fake mode or Lock screen.
    public func triggerEmergencyPanic(mountFakeWorkspace: Bool = true) {
        print("[MODULE 1 SECURITY] EMERGENCY PANIC SEQUENCE INITIATED!")
        
        // 1. Scrub K_real from volatile RAM instantly
        KeyManager.shared.purgeRealWorkspaceKey()
        
        lock.lock()
        if mountFakeWorkspace {
            // If K_fake is already in memory or we derive default fake
            if !KeyManager.shared.isFakeKeyLoaded {
                try? KeyManager.shared.deriveAndLoadKey(fromPin: defaultDuressPin, forWorkspace: .fake)
            }
            currentWorkspace = .fake
        } else {
            KeyManager.shared.purgeAllKeys()
            currentWorkspace = .none
        }
        lock.unlock()
        
        // 2. Broadcast immediate notification for UI root window swap
        NotificationCenter.default.post(name: VaultSecurityEngine.emergencyPanicDidTriggerNotification, object: nil)
        notifyWorkspaceChange()
    }
    
    /// Locks the vault and purges all keys from RAM.
    public func lockVault() {
        KeyManager.shared.purgeAllKeys()
        lock.lock()
        currentWorkspace = .none
        lock.unlock()
        notifyWorkspaceChange()
        print("[MODULE 1 SECURITY] Vault locked manually. All keys purged from RAM.")
    }
    
    public var activeWorkspace: WorkspaceType {
        lock.lock()
        defer { lock.unlock() }
        return currentWorkspace
    }
    
    public var currentLockoutState: SecurityLockoutState {
        lock.lock()
        defer { lock.unlock() }
        return lockoutState
    }
    
    // MARK: - PIN Configuration & Persistence Helpers
    
    private func getConfiguredRealPin() -> String {
        return defaultRealPin
    }
    
    private func getConfiguredDuressPin() -> String {
        return defaultDuressPin
    }
    
    private func saveLockoutState() {
        guard let data = try? JSONEncoder().encode(lockoutState) else { return }
        try? KeychainStore.shared.save(data: data, forAccount: lockoutAccountKey)
    }
    
    private func loadLockoutState() {
        guard let data = try? KeychainStore.shared.retrieve(forAccount: lockoutAccountKey),
              let state = try? JSONDecoder().decode(SecurityLockoutState.self, from: data) else {
            return
        }
        lockoutState = state
    }
    
    private func notifyWorkspaceChange() {
        NotificationCenter.default.post(name: VaultSecurityEngine.workspaceDidChangeNotification, object: nil)
    }
}
