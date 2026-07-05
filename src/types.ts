export type VaultMode = 'locked' | 'real' | 'fake';

export type VaultItemCategory = 'credential' | 'note' | 'contact' | 'document';

export interface VaultItem {
  id: string;
  title: string;
  category: VaultItemCategory;
  preview?: string;
  content: string;
  username?: string;
  password?: string;
  url?: string;
  updatedAt: string;
  isSensitive: boolean;
  favorite?: boolean;
}

export interface VaultSettings {
  realPin: string;
  duressPin: string;
  enableFaceId: boolean;
  emergencyMode: 'countdown-10s' | 'instant';
  autoLockTimeoutMinutes: number;
  enablePanicSwipe: boolean;
  stealthTitle: string; // The app name displayed when in Fake Mode
}

export interface MemoryStatus {
  realKeyInMemory: boolean;
  fakeKeyInMemory: boolean;
  activeContainer: 'none' | 'real.sqlite.enc' | 'fake.sqlite.enc';
  memoryWipeStatus: 'intact' | 'zeroing' | 'wiped';
  lastAction: string;
  lastWipedAt?: string;
}

export interface CryptoLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'threat' | 'success';
  message: string;
}

export type AppTab = 'vault' | 'generator' | 'storage' | 'settings';
