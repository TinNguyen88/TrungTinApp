//
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
}
