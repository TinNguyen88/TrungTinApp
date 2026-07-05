//
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
    /// - Parameters:
    ///   - pin: The 4-to-8 digit numeric PIN string.
    ///   - workspace: The target workspace (.real or .fake) to mount into RAM.
    /// - Returns: The derived SecureMemoryBuffer.
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
            // If real key already exists, zero it out before replacing
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
    /// Called during emergency panic triggers, backgrounding, or Duress PIN entry.
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
    
    /// Returns true if K_real is currently loaded in volatile memory.
    public var isRealKeyLoaded: Bool {
        lock.lock()
        defer { lock.unlock() }
        guard let buf = realKeyBuffer else { return false }
        return !buf.hasBeenScrubbed
    }
    
    /// Returns true if K_fake is currently loaded in volatile memory.
    public var isFakeKeyLoaded: Bool {
        lock.lock()
        defer { lock.unlock() }
        guard let buf = fakeKeyBuffer else { return false }
        return !buf.hasBeenScrubbed
    }
    
    // MARK: - AES-GCM 256 Primitives
    
    /// Encrypts raw data using AES-GCM 256 with an ephemeral 96-bit nonce and 128-bit authentication tag.
    /// - Parameters:
    ///   - data: The plaintext Data to encrypt.
    ///   - workspace: The workspace whose active key should be used.
    /// - Returns: A combined CryptoKit AES.GCM.SealedBox representation (Nonce + Ciphertext + Tag).
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
    
    /// Decrypts a combined AES-GCM 256 payload.
    /// - Parameters:
    ///   - combinedData: The combined Nonce + Ciphertext + Tag payload.
    ///   - workspace: The workspace whose active key should be used.
    /// - Returns: The decrypted plaintext Data.
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
}
