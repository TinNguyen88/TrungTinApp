import { SwiftSourceFile } from '../types';

export const MODULE_1_SWIFT_FILES: SwiftSourceFile[] = [
  {
    path: '/Vault/Package.swift',
    filename: 'Package.swift',
    category: 'Manifest',
    linesOfCode: 32,
    description: 'Swift Package Manager manifest defining iOS 17+ targets and zero external dependencies.',
    code: `// swift-tools-version: 5.9
// The swift-tools-version declares the minimum version of Swift required to build this package.

import PackageDescription

let package = Package(
    name: "Vault",
    platforms: [
        .iOS(.v17),
        .macOS(.v14) // Included for headless unit testing of cryptographic core
    ],
    products: [
        .library(
            name: "VaultCore",
            targets: ["VaultCore"]
        ),
    ],
    dependencies: [
        // No third-party dependencies! Apple Native CryptoKit & Security only.
    ],
    targets: [
        .target(
            name: "VaultCore",
            dependencies: [],
            path: "Vault/Core"
        ),
        .testTarget(
            name: "VaultTests",
            dependencies: ["VaultCore"],
            path: "Vault/Tests"
        ),
    ]
)`
  },
  {
    path: '/Vault/Vault/Core/Models/WorkspaceType.swift',
    filename: 'WorkspaceType.swift',
    category: 'Models',
    linesOfCode: 64,
    description: 'Defines the logical workspace enum (none, real, fake), security audit events, and brute-force lockout states.',
    code: `//
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
}`
  },
  {
    path: '/Vault/Vault/Core/Security/CryptoErrors.swift',
    filename: 'CryptoErrors.swift',
    category: 'Security',
    linesOfCode: 72,
    description: 'Comprehensive error types for key derivation, memory allocation, keychain operations, and rate-limiting.',
    code: `//
//  CryptoErrors.swift
//  Vault
//
//  Created by Vault Technical Partner on 2026-07-05.
//  Copyright © 2026 Vault. All rights reserved.
//

import Foundation

/// Comprehensive error types for the Vault Cryptographic Core and Security Engine.
public enum VaultCryptoError: Error, LocalizedError, Equatable {
    case memoryAllocationFailed(byteCount: Int)
    case bufferAlreadyZeroed
    case invalidPinFormat(reason: String)
    case keyDerivationFailed(reason: String)
    case keychainItemNotFound(key: String)
    case keychainOperationFailed(status: OSStatus, operation: String)
    case workspaceAlreadyMounted(current: WorkspaceType)
    case noWorkspaceMounted
    case bruteForceLockoutActive(remainingSeconds: Int)
    case authenticationFailed
    case encryptionFailed(reason: String)
    case decryptionFailed(reason: String)
    case randomEntropyGenerationFailed
    
    public var errorDescription: String? {
        switch self {
        case .memoryAllocationFailed(let count):
            return "Failed to allocate secure memory buffer of size \\(count) bytes."
        case .bufferAlreadyZeroed:
            return "Attempted to access a memory buffer that has already been zeroed and purged."
        case .invalidPinFormat(let reason):
            return "Invalid PIN format: \\(reason)"
        case .keyDerivationFailed(let reason):
            return "Cryptographic key derivation failed: \\(reason)"
        case .keychainItemNotFound(let key):
            return "Keychain item not found for identifier: \\(key)"
        case .keychainOperationFailed(let status, let operation):
            return "Keychain \\(operation) failed with OSStatus code: \\(status)"
        case .workspaceAlreadyMounted(let current):
            return "Cannot mount workspace; workspace '\\(current.rawValue)' is currently active. Must purge first."
        case .noWorkspaceMounted:
            return "No workspace is currently mounted."
        case .bruteForceLockoutActive(let seconds):
            return "Security rate limit enforced. Try again in \\(seconds) seconds."
        case .authenticationFailed:
            return "Authentication failed. Invalid PIN or credentials."
        case .encryptionFailed(let reason):
            return "AES-GCM encryption failed: \\(reason)"
        case .decryptionFailed(let reason):
            return "AES-GCM decryption failed: \\(reason)"
        case .randomEntropyGenerationFailed:
            return "Failed to generate cryptographically secure random bytes from SecRandomCopyBytes."
        }
    }
}`
  },
  {
    path: '/Vault/Vault/Core/Security/SecureMemoryBuffer.swift',
    filename: 'SecureMemoryBuffer.swift',
    category: 'Security',
    linesOfCode: 104,
    description: 'Thread-safe raw heap buffer wrapping sensitive key bytes with deterministic C-runtime memset_s zeroing.',
    code: `//
//  SecureMemoryBuffer.swift
//  Vault
//
//  Created by Vault Technical Partner on 2026-07-05.
//  Copyright © 2026 Vault. All rights reserved.
//

import Foundation
import CryptoKit

/// A thread-safe, volatile memory buffer that holds sensitive cryptographic key bytes.
/// Prevents Copy-On-Write (COW) memory leakage and enforces deterministic memory zeroing via memset_s upon disposal or panic.
public final class SecureMemoryBuffer: @unchecked Sendable {
    
    private let pointer: UnsafeMutableRawPointer
    private let byteCount: Int
    private let lock = NSLock()
    private var isZeroed = false
    
    /// Initializes a secure memory buffer by copying raw bytes from a data buffer.
    /// - Parameter data: The raw key or secret data to copy into isolated heap storage.
    public init(data: Data) throws {
        guard !data.isEmpty else {
            throw VaultCryptoError.memoryAllocationFailed(byteCount: 0)
        }
        self.byteCount = data.count
        self.pointer = UnsafeMutableRawPointer.allocate(byteCount: byteCount, alignment: MemoryLayout<UInt8>.alignment)
        
        // Copy bytes securely
        data.withUnsafeBytes { rawBuffer in
            guard let baseAddress = rawBuffer.baseAddress else { return }
            self.pointer.copyMemory(from: baseAddress, byteCount: self.byteCount)
        }
    }
    
    /// Initializes from a CryptoKit SymmetricKey.
    public convenience init(symmetricKey: SymmetricKey) throws {
        let rawData = symmetricKey.withUnsafeBytes { buffer in
            return Data(buffer)
        }
        try self.init(data: rawData)
    }
    
    deinit {
        lock.lock()
        defer { lock.unlock() }
        if !isZeroed {
            performMemsetZero()
        }
        pointer.deallocate()
    }
    
    /// Executes deterministic zeroing of the memory buffer using memset_s.
    /// Once called, the buffer can no longer be read.
    public func zeroOut() {
        lock.lock()
        defer { lock.unlock() }
        guard !isZeroed else { return }
        performMemsetZero()
        isZeroed = true
    }
    
    private func performMemsetZero() {
        // Secure C runtime memset_s guaranteed not to be optimized out by compiler
        memset_s(pointer, byteCount, 0, byteCount)
    }
    
    /// Safely accesses the raw key bytes if the buffer has not been scrubbed.
    /// - Parameter block: A closure taking a raw buffer pointer.
    /// - Returns: The result of the closure.
    public func withUnsafeBytes<R>(_ block: (UnsafeRawBufferPointer) throws -> R) throws -> R {
        lock.lock()
        defer { lock.unlock() }
        
        guard !isZeroed else {
            throw VaultCryptoError.bufferAlreadyZeroed
        }
        
        let bufferPointer = UnsafeRawBufferPointer(start: pointer, count: byteCount)
        return try block(bufferPointer)
    }
    
    /// Returns a CryptoKit SymmetricKey for immediate encryption/decryption operations.
    /// The SymmetricKey should not be stored persistently.
    public func toSymmetricKey() throws -> SymmetricKey {
        return try withUnsafeBytes { buffer in
            return SymmetricKey(data: buffer)
        }
    }
    
    /// Returns true if the buffer has been zeroed out.
    public var hasBeenScrubbed: Bool {
        lock.lock()
        defer { lock.unlock() }
        return isZeroed
    }
    
    /// Returns the size of the allocated memory buffer in bytes.
    public var count: Int {
        return byteCount
    }
}`
  },
  {
    path: '/Vault/Vault/Core/Security/KeychainStore.swift',
    filename: 'KeychainStore.swift',
    category: 'Security',
    linesOfCode: 114,
    description: 'Production Keychain wrapper using kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly and kSecAttrSynchronizable: false.',
    code: `//
//  KeychainStore.swift
//  Vault
//
//  Created by Vault Technical Partner on 2026-07-05.
//  Copyright © 2026 Vault. All rights reserved.
//

import Foundation
import Security

/// Production wrapper around Apple's iOS Security framework (Keychain Services).
/// Enforces device-only accessibility and disables cloud synchronization.
public final class KeychainStore: Sendable {
    
    public static let shared = KeychainStore()
    
    private let serviceName = "com.vault.emergency.core.keychain"
    
    private init() {}
    
    /// Stores data in the iOS Keychain with strict hardware-backed attributes.
    /// - Parameters:
    ///   - data: The raw data to store (e.g., PBKDF2 device salt or wrapped master keys).
    ///   - account: The unique identifier key.
    public func save(data: Data, forAccount account: String) throws {
        // First delete any existing item to prevent duplicate insertion errors
        try? delete(forAccount: account)
        
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: serviceName,
            kSecAttrAccount as String: account,
            kSecValueData as String: data,
            // Accessible only after first device unlock, locked strictly to this physical hardware UID
            kSecAttrAccessible as String: kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly,
            // Explicitly prevent iCloud Keychain synchronization
            kSecAttrSynchronizable as String: kCFBooleanFalse!
        ]
        
        let status = SecItemAdd(query as CFDictionary, nil)
        guard status == errSecSuccess else {
            throw VaultCryptoError.keychainOperationFailed(status: status, operation: "SecItemAdd (\\(account))")
        }
    }
    
    /// Retrieves stored data from the iOS Keychain.
    /// - Parameter account: The unique identifier key.
    /// - Returns: The stored Data buffer.
    public func retrieve(forAccount account: String) throws -> Data {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: serviceName,
            kSecAttrAccount as String: account,
            kSecReturnData as String: kCFBooleanTrue!,
            kSecMatchLimit as String: kSecMatchLimitOne,
            kSecAttrSynchronizable as String: kCFBooleanFalse!
        ]
        
        var dataTypeRef: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &dataTypeRef)
        
        guard status == errSecSuccess else {
            if status == errSecItemNotFound {
                throw VaultCryptoError.keychainItemNotFound(key: account)
            }
            throw VaultCryptoError.keychainOperationFailed(status: status, operation: "SecItemCopyMatching (\\(account))")
        }
        
        guard let data = dataTypeRef as? Data else {
            throw VaultCryptoError.keychainOperationFailed(status: errSecDecode, operation: "Data cast failed")
        }
        
        return data
    }
    
    /// Deletes an item from the iOS Keychain.
    /// - Parameter account: The unique identifier key.
    public func delete(forAccount account: String) throws {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: serviceName,
            kSecAttrAccount as String: account,
            kSecAttrSynchronizable as String: kCFBooleanFalse!
        ]
        
        let status = SecItemDelete(query as CFDictionary)
        guard status == errSecSuccess || status == errSecItemNotFound else {
            throw VaultCryptoError.keychainOperationFailed(status: status, operation: "SecItemDelete (\\(account))")
        }
    }
    
    /// Checks if a key exists in the Keychain without loading its payload into RAM.
    public func exists(forAccount account: String) -> Bool {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: serviceName,
            kSecAttrAccount as String: account,
            kSecMatchLimit as String: kSecMatchLimitOne,
            kSecAttrSynchronizable as String: kCFBooleanFalse!
        ]
        let status = SecItemCopyMatching(query as CFDictionary, nil)
        return status == errSecSuccess
    }
    
    /// Purges all Vault items from the Keychain (used only during full factory reset / self-destruct).
    public func purgeAllVaultItems() throws {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: serviceName,
            kSecAttrSynchronizable as String: kCFBooleanFalse!
        ]
        let status = SecItemDelete(query as CFDictionary)
        guard status == errSecSuccess || status == errSecItemNotFound else {
            throw VaultCryptoError.keychainOperationFailed(status: status, operation: "PurgeAll")
        }
    }
}`
  },
  {
    path: '/Vault/Vault/Core/Security/KeyManager.swift',
    filename: 'KeyManager.swift',
    category: 'Security',
    linesOfCode: 156,
    description: 'Orchestrates PBKDF2 SHA-256 derivation with 100,000 iterations, hardware entropy salt, and AES-GCM 256 encryption.',
    code: `//
//  KeyManager.swift
//  Vault
//
//  Created by Vault Technical Partner on 2026-07-05.
//  Copyright © 2026 Vault. All rights reserved.
//

import Foundation
import CryptoKit
import Security

/// Manages cryptographic key derivation, hardware salt storage, AES-GCM primitives, and volatile RAM lifecycle.
public final class KeyManager: @unchecked Sendable {
    
    public static let shared = KeyManager()
    
    private let saltAccountKey = "vault.core.pbkdf2.device.salt"
    private let pbkdf2Iterations = 100_000
    private let derivedKeyLength = 32 // 256-bit AES key
    
    private let lock = NSLock()
    private var realKeyBuffer: SecureMemoryBuffer?
    private var fakeKeyBuffer: SecureMemoryBuffer?
    
    private init() {}
    
    // MARK: - Hardware Entropy Salt Management
    
    /// Retrieves or initializes a 32-byte cryptographically random device salt stored in Keychain.
    public func getOrInitializeDeviceSalt() throws -> Data {
        if let existingSalt = try? KeychainStore.shared.retrieve(forAccount: saltAccountKey) {
            return existingSalt
        }
        
        // Generate 32 bytes of secure hardware random entropy using SecRandomCopyBytes
        var saltBytes = [UInt8](repeating: 0, count: 32)
        let status = SecRandomCopyBytes(kSecRandomDefault, saltBytes.count, &saltBytes)
        guard status == errSecSuccess else {
            throw VaultCryptoError.randomEntropyGenerationFailed
        }
        
        let saltData = Data(saltBytes)
        try KeychainStore.shared.save(data: saltData, forAccount: saltAccountKey)
        return saltData
    }
    
    // MARK: - Key Derivation (PBKDF2 SHA256)
    
    /// Derives a 256-bit master encryption key from a user PIN and hardware device salt.
    @discardableResult
    public func deriveAndLoadKey(fromPin pin: String, forWorkspace workspace: WorkspaceType) throws -> SecureMemoryBuffer {
        guard workspace == .real || workspace == .fake else {
            throw VaultCryptoError.keyDerivationFailed(reason: "Invalid target workspace for derivation.")
        }
        guard !pin.isEmpty && pin.allSatisfy({ $0.isNumber }) else {
            throw VaultCryptoError.invalidPinFormat(reason: "PIN must be numeric.")
        }
        
        let salt = try getOrInitializeDeviceSalt()
        
        // Append domain separator to salt to guarantee K_real != K_fake even if identical PIN were ever used
        let domainSeparator = workspace.rawValue.data(using: .utf8)!
        var combinedSalt = salt
        combinedSalt.append(domainSeparator)
        
        guard let pinData = pin.data(using: .utf8) else {
            throw VaultCryptoError.keyDerivationFailed(reason: "UTF8 string encoding failed.")
        }
        
        // Perform PBKDF2 <SHA256> iteration
        let derivedSymmetricKey = try CryptoKit.PBKDF2<SHA256>.deriveKey(
            fromKey: SymmetricKey(data: pinData),
            salt: combinedSalt,
            using: SHA256.self,
            outputByteCount: derivedKeyLength,
            rounds: pbkdf2Iterations
        )
        
        let secureBuffer = try SecureMemoryBuffer(symmetricKey: derivedSymmetricKey)
        
        lock.lock()
        defer { lock.unlock() }
        
        if workspace == .real {
            realKeyBuffer?.zeroOut()
            realKeyBuffer = secureBuffer
        } else {
            fakeKeyBuffer?.zeroOut()
            fakeKeyBuffer = secureBuffer
        }
        
        return secureBuffer
    }
    
    // MARK: - Volatile RAM Purge Engine
    
    /// Instantly zeroes out K_real from RAM using memset_s.
    public func purgeRealWorkspaceKey() {
        lock.lock()
        defer { lock.unlock() }
        realKeyBuffer?.zeroOut()
        realKeyBuffer = nil
        print("[MODULE 1 SECURITY] Real workspace AES key scrubbed from volatile RAM.")
    }
    
    /// Instantly zeroes out both K_real and K_fake from RAM.
    public func purgeAllKeys() {
        lock.lock()
        defer { lock.unlock() }
        realKeyBuffer?.zeroOut()
        realKeyBuffer = nil
        fakeKeyBuffer?.zeroOut()
        fakeKeyBuffer = nil
        print("[MODULE 1 SECURITY] All master encryption keys scrubbed from volatile RAM.")
    }
    
    public var isRealKeyLoaded: Bool {
        lock.lock()
        defer { lock.unlock() }
        guard let buf = realKeyBuffer else { return false }
        return !buf.hasBeenScrubbed
    }
    
    public var isFakeKeyLoaded: Bool {
        lock.lock()
        defer { lock.unlock() }
        guard let buf = fakeKeyBuffer else { return false }
        return !buf.hasBeenScrubbed
    }
    
    // MARK: - AES-GCM 256 Primitives
    
    public func encrypt(data: Data, forWorkspace workspace: WorkspaceType) throws -> Data {
        let keyBuffer = try getActiveBuffer(for: workspace)
        return try keyBuffer.withUnsafeBytes { rawBuffer in
            let symmetricKey = SymmetricKey(data: rawBuffer)
            let sealedBox = try AES.GCM.seal(data, using: symmetricKey)
            guard let combined = sealedBox.combined else {
                throw VaultCryptoError.encryptionFailed(reason: "Failed to construct combined SealedBox.")
            }
            return combined
        }
    }
    
    public func decrypt(combinedData: Data, forWorkspace workspace: WorkspaceType) throws -> Data {
        let keyBuffer = try getActiveBuffer(for: workspace)
        return try keyBuffer.withUnsafeBytes { rawBuffer in
            let symmetricKey = SymmetricKey(data: rawBuffer)
            let sealedBox = try AES.GCM.SealedBox(combined: combinedData)
            let plaintext = try AES.GCM.open(sealedBox, using: symmetricKey)
            return plaintext
        }
    }
    
    private func getActiveBuffer(for workspace: WorkspaceType) throws -> SecureMemoryBuffer {
        lock.lock()
        defer { lock.unlock() }
        
        let buffer = (workspace == .real) ? realKeyBuffer : fakeKeyBuffer
        guard let validBuffer = buffer, !validBuffer.hasBeenScrubbed else {
            throw VaultCryptoError.noWorkspaceMounted
        }
        return validBuffer
    }
}`
  },
  {
    path: '/Vault/Vault/Core/Security/VaultSecurityEngine.swift',
    filename: 'VaultSecurityEngine.swift',
    category: 'Security',
    linesOfCode: 208,
    description: 'Security orchestrator coordinating PIN authentication, Duress traps, rate-limiting lockout, and automatic background scrubbing.',
    code: `//
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
public final class VaultSecurityEngine: @unchecked Sendable {
    
    public static let shared = VaultSecurityEngine()
    
    public static let emergencyPanicDidTriggerNotification = Notification.Name("com.vault.security.emergencyPanicDidTrigger")
    public static let workspaceDidChangeNotification = Notification.Name("com.vault.security.workspaceDidChange")
    
    private let lockoutAccountKey = "vault.core.security.lockout.state"
    private let defaultRealPin = "8492"
    private let defaultDuressPin = "1111"
    
    private let lock = NSLock()
    private var currentWorkspace: WorkspaceType = .none
    private var lockoutState = SecurityLockoutState()
    
    private init() {
        loadLockoutState()
        setupLifecycleObservers()
    }
    
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
        KeyManager.shared.purgeRealWorkspaceKey()
        
        lock.lock()
        if currentWorkspace == .real {
            currentWorkspace = .none
            lock.unlock()
            notifyWorkspaceChange()
        } else {
            lock.unlock()
        }
    }
    
    public func authenticate(withPin pin: String) throws -> WorkspaceType {
        lock.lock()
        if lockoutState.isCurrentlyLockedOut {
            let remaining = lockoutState.remainingLockoutSeconds
            lock.unlock()
            throw VaultCryptoError.bruteForceLockoutActive(remainingSeconds: remaining)
        }
        lock.unlock()
        
        let realPin = defaultRealPin
        let duressPin = defaultDuressPin
        
        if pin == realPin {
            try KeyManager.shared.deriveAndLoadKey(fromPin: pin, forWorkspace: .real)
            lock.lock()
            currentWorkspace = .real
            lockoutState = SecurityLockoutState()
            saveLockoutState()
            lock.unlock()
            notifyWorkspaceChange()
            return .real
            
        } else if pin == duressPin {
            print("[MODULE 1 SECURITY] DURESS PIN TRAP TRIGGERED! Executing immediate RAM scrub of K_real.")
            KeyManager.shared.purgeRealWorkspaceKey()
            try KeyManager.shared.deriveAndLoadKey(fromPin: pin, forWorkspace: .fake)
            lock.lock()
            currentWorkspace = .fake
            lockoutState = SecurityLockoutState()
            saveLockoutState()
            lock.unlock()
            notifyWorkspaceChange()
            return .fake
            
        } else {
            lock.lock()
            lockoutState.failedAttempts += 1
            if lockoutState.failedAttempts >= 5 {
                let penaltySeconds = Int(pow(2.0, Double(min(lockoutState.failedAttempts - 4, 6)))) * 15
                lockoutState.lockoutUntilTimestamp = Date().timeIntervalSince1970 + TimeInterval(penaltySeconds)
            }
            saveLockoutState()
            let remaining = lockoutState.remainingLockoutSeconds
            let failedCount = lockoutState.failedAttempts
            lock.unlock()
            
            if remaining > 0 {
                throw VaultCryptoError.bruteForceLockoutActive(remainingSeconds: remaining)
            } else {
                throw VaultCryptoError.authenticationFailed
            }
        }
    }
    
    public func triggerEmergencyPanic(mountFakeWorkspace: Bool = true) {
        print("[MODULE 1 SECURITY] EMERGENCY PANIC SEQUENCE INITIATED!")
        KeyManager.shared.purgeRealWorkspaceKey()
        
        lock.lock()
        if mountFakeWorkspace {
            if !KeyManager.shared.isFakeKeyLoaded {
                try? KeyManager.shared.deriveAndLoadKey(fromPin: defaultDuressPin, forWorkspace: .fake)
            }
            currentWorkspace = .fake
        } else {
            KeyManager.shared.purgeAllKeys()
            currentWorkspace = .none
        }
        lock.unlock()
        
        NotificationCenter.default.post(name: VaultSecurityEngine.emergencyPanicDidTriggerNotification, object: nil)
        notifyWorkspaceChange()
    }
    
    public func lockVault() {
        KeyManager.shared.purgeAllKeys()
        lock.lock()
        currentWorkspace = .none
        lock.unlock()
        notifyWorkspaceChange()
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
}`
  },
  {
    path: '/Vault/Vault/App/VaultApp.swift',
    filename: 'VaultApp.swift',
    category: 'App',
    linesOfCode: 32,
    description: 'SwiftUI App lifecycle entry point responding to ScenePhase background transitions.',
    code: `//
//  VaultApp.swift
//  Vault
//
//  Created by Vault Technical Partner on 2026-07-05.
//  Copyright © 2026 Vault. All rights reserved.
//

import SwiftUI

@main
struct VaultApp: App {
    @Environment(\\ .scenePhase) private var scenePhase
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .onReceive(NotificationCenter.default.publisher(for: VaultSecurityEngine.workspaceDidChangeNotification)) { _ in
                    // UI automatically re-evaluates mounted workspace root
                }
        }
        .onChange(of: scenePhase) { newPhase in
            if newPhase == .background {
                // Enforce lifecycle hygiene: instantly scrub Real keys from RAM when entering background
                VaultSecurityEngine.shared.triggerEmergencyPanic(mountFakeWorkspace: true)
            }
        }
    }
}`
  },
  {
    path: '/Vault/Vault/App/ContentView.swift',
    filename: 'ContentView.swift',
    category: 'App',
    linesOfCode: 180,
    description: 'Production SwiftUI lock screen keypad, Duress PIN detection, and workspace view switcher.',
    code: `//
//  ContentView.swift
//  Vault
//
//  Created by Vault Technical Partner on 2026-07-05.
//  Copyright © 2026 Vault. All rights reserved.
//

import SwiftUI

struct ContentView: View {
    @State private var activeWorkspace: WorkspaceType = VaultSecurityEngine.shared.activeWorkspace
    @State private var pinInput: String = ""
    @State private var errorMessage: String? = nil
    
    let notificationPublisher = NotificationCenter.default.publisher(for: VaultSecurityEngine.workspaceDidChangeNotification)
    
    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()
            
            switch activeWorkspace {
            case .none:
                lockScreenView
            case .real:
                realWorkspaceView
            case .fake:
                fakeWorkspaceView
            }
        }
        .onReceive(notificationPublisher) { _ in
            withAnimation(.easeInOut(duration: 0.2)) {
                self.activeWorkspace = VaultSecurityEngine.shared.activeWorkspace
            }
        }
    }
    
    private var lockScreenView: View {
        VStack(spacing: 24) {
            Spacer()
            Image(systemName: "lock.shield.fill")
                .font(.system(size: 56))
                .foregroundColor(.emerald)
            Text("Vault")
                .font(.largeTitle.bold())
                .foregroundColor(.white)
            Text("Enter Master PIN or Duress PIN")
                .font(.subheadline)
                .foregroundColor(.gray)
            
            HStack(spacing: 16) {
                ForEach(0..<4, id: \\.self) { index in
                    Circle()
                        .fill(pinInput.count > index ? Color.emerald : Color.gray.opacity(0.3))
                        .frame(width: 14, height: 14)
                }
            }
            .padding(.vertical, 12)
            
            if let err = errorMessage {
                Text(err)
                    .font(.footnote)
                    .foregroundColor(.red)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal)
            }
            Spacer()
            
            LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 3), spacing: 20) {
                ForEach(1...9, id: \\.self) { num in
                    keypadButton("\\(num)")
                }
                keypadButton("C")
                keypadButton("0")
                keypadButton("⌫")
            }
            .padding(.horizontal, 36)
            .padding(.bottom, 32)
        }
    }
    
    private var realWorkspaceView: View {
        VStack(spacing: 20) {
            HStack {
                Text("My Organizer (Real)")
                    .font(.title2.bold())
                    .foregroundColor(.white)
                Spacer()
                Button("Lock") { VaultSecurityEngine.shared.lockVault() }
                    .foregroundColor(.red)
            }
            .padding()
            Spacer()
            Text("Sensitive Primary Workspace Mounted")
                .foregroundColor(.gray)
            Spacer()
            
            Button(action: {
                VaultSecurityEngine.shared.triggerEmergencyPanic(mountFakeWorkspace: true)
            }) {
                HStack {
                    Image(systemName: "exclamationmark.triangle.fill")
                    Text("SIMULATE 10s PANIC SWIPE")
                }
                .font(.headline)
                .foregroundColor(.black)
                .padding()
                .frame(maxWidth: .infinity)
                .background(Color.amber)
                .cornerRadius(12)
            }
            .padding()
        }
    }
    
    private var fakeWorkspaceView: View {
        VStack(spacing: 20) {
            HStack {
                Text("My Organizer")
                    .font(.title2.bold())
                    .foregroundColor(.white)
                Spacer()
                Button("Lock") { VaultSecurityEngine.shared.lockVault() }
                    .foregroundColor(.gray)
            }
            .padding()
            Spacer()
            Text("Plausible Deniability Secondary Workspace")
                .foregroundColor(.gray)
            Spacer()
        }
    }
    
    private func keypadButton(_ title: String) -> View {
        Button(action: { handleKeypadPress(title) }) {
            Text(title)
                .font(.title2.bold())
                .foregroundColor(.white)
                .frame(width: 72, height: 72)
                .background(Color.gray.opacity(0.2))
                .clipShape(Circle())
        }
    }
    
    private func handleKeypadPress(_ title: String) {
        errorMessage = nil
        if title == "C" {
            pinInput = ""
        } else if title == "⌫" {
            if !pinInput.isEmpty { pinInput.removeLast() }
        } else {
            if pinInput.count < 4 {
                pinInput.append(title)
                if pinInput.count == 4 { authenticatePin() }
            }
        }
    }
    
    private func authenticatePin() {
        do {
            _ = try VaultSecurityEngine.shared.authenticate(withPin: pinInput)
            pinInput = ""
        } catch {
            errorMessage = error.localizedDescription
            pinInput = ""
        }
    }
}

extension Color {
    static let emerald = Color(red: 0.06, green: 0.72, blue: 0.50)
    static let amber = Color(red: 0.96, green: 0.65, blue: 0.14)
}`
  },
  {
    path: '/Vault/Vault/Tests/VaultSecurityTests.swift',
    filename: 'VaultSecurityTests.swift',
    category: 'Tests',
    linesOfCode: 104,
    description: 'XCTest suite verifying key derivation independence, memset_s zeroing, duress traps, and rate-limiting.',
    code: `//
//  VaultSecurityTests.swift
//  VaultTests
//
//  Created by Vault Technical Partner on 2026-07-05.
//  Copyright © 2026 Vault. All rights reserved.
//

import XCTest
@testable import Vault

final class VaultSecurityTests: XCTestCase {
    
    override func setUpWithError() throws {
        KeyManager.shared.purgeAllKeys()
        try? KeychainStore.shared.purgeAllVaultItems()
    }
    
    override func tearDownWithError() throws {
        KeyManager.shared.purgeAllKeys()
    }
    
    func testPBKDF2KeyDerivationConsistency() throws {
        let pin = "8492"
        let buffer1 = try KeyManager.shared.deriveAndLoadKey(fromPin: pin, forWorkspace: .real)
        let key1Bytes = try buffer1.withUnsafeBytes { Data($0) }
        
        let buffer2 = try KeyManager.shared.deriveAndLoadKey(fromPin: pin, forWorkspace: .real)
        let key2Bytes = try buffer2.withUnsafeBytes { Data($0) }
        
        XCTAssertEqual(key1Bytes, key2Bytes, "PBKDF2 derivation with identical device salt and PIN must produce identical 256-bit AES keys.")
    }
    
    func testRealAndFakeKeysAreCryptographicallyIndependent() throws {
        let pin = "8492"
        let realBuffer = try KeyManager.shared.deriveAndLoadKey(fromPin: pin, forWorkspace: .real)
        let realBytes = try realBuffer.withUnsafeBytes { Data($0) }
        
        let fakeBuffer = try KeyManager.shared.deriveAndLoadKey(fromPin: pin, forWorkspace: .fake)
        let fakeBytes = try fakeBuffer.withUnsafeBytes { Data($0) }
        
        XCTAssertNotEqual(realBytes, fakeBytes, "K_real and K_fake must be cryptographically independent.")
    }
    
    func testMemsetZeroingUponPurge() throws {
        let pin = "8492"
        let buffer = try KeyManager.shared.deriveAndLoadKey(fromPin: pin, forWorkspace: .real)
        XCTAssertFalse(buffer.hasBeenScrubbed)
        XCTAssertTrue(KeyManager.shared.isRealKeyLoaded)
        
        KeyManager.shared.purgeRealWorkspaceKey()
        XCTAssertTrue(buffer.hasBeenScrubbed)
        XCTAssertFalse(KeyManager.shared.isRealKeyLoaded)
        
        XCTAssertThrowsError(try buffer.withUnsafeBytes { _ in }) { error in
            guard let cryptoError = error as? VaultCryptoError, cryptoError == .bufferAlreadyZeroed else {
                XCTFail("Expected bufferAlreadyZeroed error, got \\(error)")
                return
            }
        }
    }
    
    func testDuressPinTrapInstantlyPurgesRealKey() throws {
        _ = try VaultSecurityEngine.shared.authenticate(withPin: "8492")
        XCTAssertTrue(KeyManager.shared.isRealKeyLoaded)
        
        _ = try VaultSecurityEngine.shared.authenticate(withPin: "1111")
        XCTAssertFalse(KeyManager.shared.isRealKeyLoaded, "Duress PIN trap must execute immediate memset_s on K_real.")
        XCTAssertTrue(KeyManager.shared.isFakeKeyLoaded)
        XCTAssertEqual(VaultSecurityEngine.shared.activeWorkspace, .fake)
    }
    
    func testBruteForceRateLimitEnforcement() throws {
        for _ in 1...4 {
            XCTAssertThrowsError(try VaultSecurityEngine.shared.authenticate(withPin: "0000"))
        }
        XCTAssertThrowsError(try VaultSecurityEngine.shared.authenticate(withPin: "0000")) { error in
            guard let cryptoErr = error as? VaultCryptoError else {
                XCTFail("Expected VaultCryptoError, got \\(error)")
                return
            }
            if case .bruteForceLockoutActive(let seconds) = cryptoErr {
                XCTAssertGreaterThan(seconds, 0)
            } else {
                XCTFail("Expected bruteForceLockoutActive error, got \\(cryptoErr)")
            }
        }
    }
}`
  }
];
