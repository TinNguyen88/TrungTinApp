//
//  WorkspaceType.swift
//  Vault
//
//  Created by Vault Technical Partner on 2026-07-05.
//  Copyright © 2026 Vault. All rights reserved.
//

import Foundation

/// Defines the cryptographic and logical workspace currently mounted by Vault.
public enum WorkspaceType: String, CaseIterable, Codable, Sendable {
    /// No workspace mounted; all encryption keys zeroed from RAM.
    case none = "none"
    
    /// The primary, sensitive workspace protected by K_real.
    case real = "real"
    
    /// The secondary, plausible deniability workspace protected by K_fake.
    case fake = "fake"
    
    /// Returns true if an active database container is currently mounted.
    public var isMounted: Bool {
        self != .none
    }
}

/// Represents high-priority security audit events in the Vault lifecycle.
public enum VaultSecurityEvent: String, Sendable {
    case coldLaunch = "COLD_LAUNCH"
    case realWorkspaceUnlocked = "REAL_WORKSPACE_UNLOCKED"
    case fakeWorkspaceUnlocked = "FAKE_WORKSPACE_UNLOCKED"
    case duressPinTriggered = "DURESS_PIN_TRIGGERED"
    case hardwareActionTriggered = "HARDWARE_ACTION_TRIGGERED"
    case gesturePanicTriggered = "GESTURE_PANIC_TRIGGERED"
    case backgroundScrubExecuted = "BACKGROUND_SCRUB_EXECUTED"
    case invalidPinAttempt = "INVALID_PIN_ATTEMPT"
    case securityLockoutEnforced = "SECURITY_LOCKOUT_ENFORCED"
}

/// Represents the brute-force protection state of the application.
public struct SecurityLockoutState: Codable, Sendable, Equatable {
    public var failedAttempts: Int
    public var lockoutUntilTimestamp: TimeInterval?
    
    public init(failedAttempts: Int = 0, lockoutUntilTimestamp: TimeInterval? = nil) {
        self.failedAttempts = failedAttempts
        self.lockoutUntilTimestamp = lockoutUntilTimestamp
    }
    
    public var isCurrentlyLockedOut: Bool {
        guard let lockoutTime = lockoutUntilTimestamp else { return false }
        return Date().timeIntervalSince1970 < lockoutTime
    }
    
    public var remainingLockoutSeconds: Int {
        guard let lockoutTime = lockoutUntilTimestamp else { return 0 }
        let diff = Int(lockoutTime - Date().timeIntervalSince1970)
        return max(0, diff)
    }
}
