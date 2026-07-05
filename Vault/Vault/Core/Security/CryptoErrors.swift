//
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
            return "Failed to allocate secure memory buffer of size \(count) bytes."
        case .bufferAlreadyZeroed:
            return "Attempted to access a memory buffer that has already been zeroed and purged."
        case .invalidPinFormat(let reason):
            return "Invalid PIN format: \(reason)"
        case .keyDerivationFailed(let reason):
            return "Cryptographic key derivation failed: \(reason)"
        case .keychainItemNotFound(let key):
            return "Keychain item not found for identifier: \(key)"
        case .keychainOperationFailed(let status, let operation):
            return "Keychain \(operation) failed with OSStatus code: \(status)"
        case .workspaceAlreadyMounted(let current):
            return "Cannot mount workspace; workspace '\(current.rawValue)' is currently active. Must purge first."
        case .noWorkspaceMounted:
            return "No workspace is currently mounted."
        case .bruteForceLockoutActive(let seconds):
            return "Security rate limit enforced. Try again in \(seconds) seconds."
        case .authenticationFailed:
            return "Authentication failed. Invalid PIN or credentials."
        case .encryptionFailed(let reason):
            return "AES-GCM encryption failed: \(reason)"
        case .decryptionFailed(let reason):
            return "AES-GCM decryption failed: \(reason)"
        case .randomEntropyGenerationFailed:
            return "Failed to generate cryptographically secure random bytes from SecRandomCopyBytes."
        }
    }
}
