//
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
        // Ensure clean state before each test
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
        
        // Re-derive with same pin and workspace
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
        
        XCTAssertNotEqual(realBytes, fakeBytes, "K_real and K_fake must be cryptographically independent even if identical PIN strings were ever evaluated.")
    }
    
    func testMemsetZeroingUponPurge() throws {
        let pin = "8492"
        let buffer = try KeyManager.shared.deriveAndLoadKey(fromPin: pin, forWorkspace: .real)
        
        XCTAssertFalse(buffer.hasBeenScrubbed)
        XCTAssertTrue(KeyManager.shared.isRealKeyLoaded)
        
        // Execute scrub
        KeyManager.shared.purgeRealWorkspaceKey()
        
        XCTAssertTrue(buffer.hasBeenScrubbed, "SecureMemoryBuffer must mark itself as scrubbed.")
        XCTAssertFalse(KeyManager.shared.isRealKeyLoaded, "KeyManager must report real key as purged.")
        
        // Verify accessing scrubbed buffer throws bufferAlreadyZeroed
        XCTAssertThrowsError(try buffer.withUnsafeBytes { _ in }) { error in
            guard let cryptoError = error as? VaultCryptoError, cryptoError == .bufferAlreadyZeroed else {
                XCTFail("Expected bufferAlreadyZeroed error, got \(error)")
                return
            }
        }
    }
    
    func testDuressPinTrapInstantlyPurgesRealKey() throws {
        // 1. Authenticate real workspace first
        _ = try VaultSecurityEngine.shared.authenticate(withPin: "8492")
        XCTAssertTrue(KeyManager.shared.isRealKeyLoaded)
        XCTAssertEqual(VaultSecurityEngine.shared.activeWorkspace, .real)
        
        // 2. Enter Duress PIN (1111)
        _ = try VaultSecurityEngine.shared.authenticate(withPin: "1111")
        
        // 3. Verify K_real was instantly scrubbed and workspace swapped to .fake
        XCTAssertFalse(KeyManager.shared.isRealKeyLoaded, "Duress PIN trap must execute immediate memset_s on K_real.")
        XCTAssertTrue(KeyManager.shared.isFakeKeyLoaded, "Duress PIN trap must mount secondary fake key.")
        XCTAssertEqual(VaultSecurityEngine.shared.activeWorkspace, .fake)
    }
    
    func testBruteForceRateLimitEnforcement() throws {
        // 5 consecutive failed attempts
        for _ in 1...4 {
            XCTAssertThrowsError(try VaultSecurityEngine.shared.authenticate(withPin: "0000"))
        }
        
        // 5th attempt triggers lockout
        XCTAssertThrowsError(try VaultSecurityEngine.shared.authenticate(withPin: "0000")) { error in
            guard let cryptoErr = error as? VaultCryptoError else {
                XCTFail("Expected VaultCryptoError, got \(error)")
                return
            }
            if case .bruteForceLockoutActive(let seconds) = cryptoErr {
                XCTAssertGreaterThan(seconds, 0)
            } else {
                XCTFail("Expected bruteForceLockoutActive error on 5th attempt, got \(cryptoErr)")
            }
        }
    }
}
