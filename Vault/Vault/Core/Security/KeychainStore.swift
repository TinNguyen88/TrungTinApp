//
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
            throw VaultCryptoError.keychainOperationFailed(status: status, operation: "SecItemAdd (\(account))")
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
            throw VaultCryptoError.keychainOperationFailed(status: status, operation: "SecItemCopyMatching (\(account))")
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
            throw VaultCryptoError.keychainOperationFailed(status: status, operation: "SecItemDelete (\(account))")
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
}
