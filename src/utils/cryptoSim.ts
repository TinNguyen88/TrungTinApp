import { CryptoLog } from '../types';

/**
 * Simulates volatile memory allocation for cryptographic keys.
 * In a real iOS build, this uses Swift `withUnsafeMutableBytes` and C `memset_s`.
 */
class VolatileMemoryBuffer {
  private buffer: Uint8Array | null = null;
  private isLoaded: boolean = false;

  public allocateKey(seed: string): void {
    // Allocate a 32-byte (256-bit) buffer in memory
    this.buffer = new Uint8Array(32);
    for (let i = 0; i < 32; i++) {
      this.buffer[i] = (seed.charCodeAt(i % seed.length) * 31 + i * 17) & 0xff;
    }
    this.isLoaded = true;
  }

  public zeroize(): boolean {
    if (this.buffer) {
      // Secure C memset_s equivalent: forcefully overwrite all bits with 0x00
      for (let i = 0; i < this.buffer.length; i++) {
        this.buffer[i] = 0;
      }
      this.buffer = null;
    }
    const wasLoaded = this.isLoaded;
    this.isLoaded = false;
    return wasLoaded;
  }

  public status(): boolean {
    return this.isLoaded;
  }
}

export const realKeyBuffer = new VolatileMemoryBuffer();
export const fakeKeyBuffer = new VolatileMemoryBuffer();

export function simulateKeyDerivation(pin: string, mode: 'real' | 'fake'): Promise<string> {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (mode === 'real') {
        realKeyBuffer.allocateKey(`REAL_PBKDF2_SALT_${pin}`);
        fakeKeyBuffer.zeroize();
        resolve('K_real_256bit_active');
      } else {
        // Zero out real key immediately upon deriving fake key!
        realKeyBuffer.zeroize();
        fakeKeyBuffer.allocateKey(`FAKE_PBKDF2_SALT_${pin}`);
        resolve('K_fake_256bit_active');
      }
    }, 180); // Simulate realistic ~180ms PBKDF2 / Argon2id calculation delay
  });
}

export function performEmergencyRamWipe(): { wipedReal: boolean; timestamp: string } {
  const wipedReal = realKeyBuffer.zeroize();
  fakeKeyBuffer.allocateKey('EMERGENCY_HANDOVER_FAKE_SEED');
  return {
    wipedReal,
    timestamp: new Date().toLocaleTimeString()
  };
}

const DICEWARE_WORDS = [
  'alpha', 'beacon', 'canyon', 'delta', 'eagle', 'falcon', 'glacier', 'harbor',
  'impact', 'jaguar', 'kestrel', 'lunar', 'matrix', 'nebula', 'orbit', 'pulsar',
  'quantum', 'radar', 'safari', 'titan', 'ultra', 'vector', 'vortex', 'wisher',
  'xenon', 'yellow', 'zenith', 'shadow', 'frost', 'vertex', 'timber', 'cobalt'
];

export function generateSecurePassword(options: {
  length: number;
  useNumbers: boolean;
  useSymbols: boolean;
  usePassphrase: boolean;
}): string {
  if (options.usePassphrase) {
    const wordCount = Math.max(3, Math.min(6, Math.floor(options.length / 4)));
    const words: string[] = [];
    for (let i = 0; i < wordCount; i++) {
      const idx = Math.floor(Math.random() * DICEWARE_WORDS.length);
      words.push(DICEWARE_WORDS[idx]);
    }
    const sep = options.useSymbols ? '-' : options.useNumbers ? `${Math.floor(Math.random() * 99)}` : ' ';
    return words.join(sep);
  }

  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const nums = '0123456789';
  const syms = '!@#$%^&*()-_=+[]{}|;:,.<>?';
  
  let pool = chars;
  if (options.useNumbers) pool += nums;
  if (options.useSymbols) pool += syms;

  let result = '';
  const array = new Uint32Array(options.length);
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    window.crypto.getRandomValues(array);
    for (let i = 0; i < options.length; i++) {
      result += pool[array[i] % pool.length];
    }
  } else {
    for (let i = 0; i < options.length; i++) {
      result += pool[Math.floor(Math.random() * pool.length)];
    }
  }
  return result;
}
