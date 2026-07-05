import React, { useState, useEffect } from 'react';
import { VaultMode, AppTab, VaultItem, VaultSettings, MemoryStatus, CryptoLog } from './types';
import { INITIAL_REAL_ITEMS, INITIAL_FAKE_ITEMS, DEFAULT_SETTINGS } from './data/initialVaultData';
import { simulateKeyDerivation, performEmergencyRamWipe } from './utils/cryptoSim';
import { AppLockScreen } from './components/AppLockScreen';
import { VaultHeader } from './components/VaultHeader';
import { VaultTabBar } from './components/VaultTabBar';
import { VaultItemsView } from './components/VaultItemsView';
import { PasswordGeneratorView } from './components/PasswordGeneratorView';
import { StorageEngineView } from './components/StorageEngineView';
import { SettingsView } from './components/SettingsView';
import { EmergencyCountdownModal } from './components/EmergencyCountdownModal';

export default function App() {
  const [mode, setMode] = useState<VaultMode>('locked');
  const [activeTab, setActiveTab] = useState<AppTab>('vault');
  const [settings, setSettings] = useState<VaultSettings>(() => {
    try {
      const saved = localStorage.getItem('vault_settings_v1');
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [realItems, setRealItems] = useState<VaultItem[]>(() => {
    try {
      const saved = localStorage.getItem('vault_real_items_v1');
      return saved ? JSON.parse(saved) : INITIAL_REAL_ITEMS;
    } catch {
      return INITIAL_REAL_ITEMS;
    }
  });

  const [fakeItems, setFakeItems] = useState<VaultItem[]>(() => {
    try {
      const saved = localStorage.getItem('vault_fake_items_v1');
      return saved ? JSON.parse(saved) : INITIAL_FAKE_ITEMS;
    } catch {
      return INITIAL_FAKE_ITEMS;
    }
  });

  const [memoryStatus, setMemoryStatus] = useState<MemoryStatus>({
    realKeyInMemory: false,
    fakeKeyInMemory: false,
    activeContainer: 'none',
    memoryWipeStatus: 'intact',
    lastAction: 'Cold Boot / Locked'
  });

  const [cryptoLogs, setCryptoLogs] = useState<CryptoLog[]>([
    {
      id: 'log-1',
      timestamp: new Date().toLocaleTimeString(),
      level: 'info',
      message: 'iOS App Sandbox initialized. Secure Enclave hardware entropy active.'
    },
    {
      id: 'log-2',
      timestamp: new Date().toLocaleTimeString(),
      level: 'info',
      message: 'Encrypted SQLite containers (real.sqlite.enc & fake.sqlite.enc) mounted in standby.'
    }
  ]);

  const [showEmergencyModal, setShowEmergencyModal] = useState<boolean>(false);

  // Save changes to localStorage simulation
  useEffect(() => {
    localStorage.setItem('vault_settings_v1', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('vault_real_items_v1', JSON.stringify(realItems));
  }, [realItems]);

  useEffect(() => {
    localStorage.setItem('vault_fake_items_v1', JSON.stringify(fakeItems));
  }, [fakeItems]);

  const addLog = (level: CryptoLog['level'], message: string) => {
    const newLog: CryptoLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleTimeString(),
      level,
      message
    };
    setCryptoLogs((prev) => [newLog, ...prev.slice(0, 30)]);
  };

  // Unlock Real Workspace
  const handleUnlockReal = async () => {
    addLog('info', 'Verifying Real PIN via Secure Enclave PBKDF2...');
    await simulateKeyDerivation(settings.realPin, 'real');
    
    setMode('real');
    setActiveTab('vault');
    setMemoryStatus({
      realKeyInMemory: true,
      fakeKeyInMemory: false,
      activeContainer: 'real.sqlite.enc',
      memoryWipeStatus: 'intact',
      lastAction: 'Unlocked Real Workspace ($K_{real}$ loaded into volatile RAM)'
    });
    addLog('success', 'PBKDF2 derivation complete. $K_{real}$ (256-bit AES-GCM) loaded into RAM.');
    addLog('success', 'Mounted real.sqlite.enc container.');
  };

  // Unlock Fake Workspace (via Duress PIN or Emergency Handover)
  const handleUnlockFake = async (isDuress: boolean) => {
    if (isDuress) {
      addLog('threat', 'DURESS PIN OR PANIC TRIGGER DETECTED! Initiating emergency handover sequence...');
    } else {
      addLog('info', 'Unlocking secondary organizer workspace mode...');
    }

    const wipeResult = performEmergencyRamWipe();
    await simulateKeyDerivation(settings.duressPin, 'fake');

    setMode('fake');
    setActiveTab('vault');
    setShowEmergencyModal(false);
    setMemoryStatus({
      realKeyInMemory: false,
      fakeKeyInMemory: true,
      activeContainer: 'fake.sqlite.enc',
      memoryWipeStatus: 'wiped',
      lastAction: 'Emergency Handover executed ($K_{real}$ zeroed via memset_s)',
      lastWipedAt: wipeResult.timestamp
    });

    if (isDuress) {
      addLog('threat', `Volatile RAM wiped! memset_s(K_real, 0) executed at ${wipeResult.timestamp}.`);
      addLog('info', 'Mounted decoy container: fake.sqlite.enc. Zero trace of primary vault exists.');
    } else {
      addLog('success', 'Mounted decoy container: fake.sqlite.enc.');
    }
  };

  // Lock App
  const handleLock = () => {
    const wipeResult = performEmergencyRamWipe();
    setMode('locked');
    setShowEmergencyModal(false);
    setMemoryStatus({
      realKeyInMemory: false,
      fakeKeyInMemory: false,
      activeContainer: 'none',
      memoryWipeStatus: 'wiped',
      lastAction: 'Vault locked manually ($K_{real}$ & $K_{fake}$ zeroed from RAM)',
      lastWipedAt: wipeResult.timestamp
    });
    addLog('info', 'App locked. All cryptographic memory buffers zeroed out.');
  };

  // Emergency Panic Button or Swipe Handler
  const handleTriggerEmergency = () => {
    if (settings.emergencyMode === 'instant') {
      handleUnlockFake(true);
    } else {
      setShowEmergencyModal(true);
    }
  };

  // Force RAM zeroing button in storage view
  const handleForceWipeRam = () => {
    const wipeResult = performEmergencyRamWipe();
    setMemoryStatus((prev) => ({
      ...prev,
      realKeyInMemory: false,
      memoryWipeStatus: 'wiped',
      lastAction: 'Manual RAM zeroize executed via memset_s',
      lastWipedAt: wipeResult.timestamp
    }));
    addLog('threat', `Manual volatile RAM wipe executed at ${wipeResult.timestamp}.`);
  };

  // Self-Destruct / Wipe All Data
  const handleSelfDestruct = () => {
    localStorage.removeItem('vault_settings_v1');
    localStorage.removeItem('vault_real_items_v1');
    localStorage.removeItem('vault_fake_items_v1');
    setRealItems([]);
    setFakeItems([]);
    setSettings(DEFAULT_SETTINGS);
    handleLock();
    addLog('threat', 'SELF-DESTRUCT EXECUTED: All containers and memory keys permanently wiped!');
    alert("Vault destroyed. All local containers have been zeroized.");
  };

  // Item CRUD handlers
  const currentItems = mode === 'real' ? realItems : fakeItems;
  const setCurrentItems = mode === 'real' ? setRealItems : setFakeItems;

  const handleAddItem = (newItem: Omit<VaultItem, 'id' | 'updatedAt'>) => {
    const item: VaultItem = {
      ...newItem,
      id: `${mode === 'real' ? 'r' : 'f'}-${Date.now()}`,
      updatedAt: 'Just now'
    };
    setCurrentItems([item, ...currentItems]);
    addLog('info', `Added new item "${item.title}" to ${mode === 'real' ? 'real.sqlite.enc' : 'fake.sqlite.enc'}.`);
  };

  const handleUpdateItem = (updatedItem: VaultItem) => {
    setCurrentItems(
      currentItems.map((it) => (it.id === updatedItem.id ? { ...updatedItem, updatedAt: 'Just now' } : it))
    );
    addLog('info', `Updated item "${updatedItem.title}" in container.`);
  };

  const handleDeleteItem = (id: string) => {
    const target = currentItems.find((it) => it.id === id);
    setCurrentItems(currentItems.filter((it) => it.id !== id));
    if (target) {
      addLog('warn', `Deleted item "${target.title}" from storage container.`);
    }
  };

  // Render Lock Screen if locked
  if (mode === 'locked') {
    return (
      <AppLockScreen
        settings={settings}
        onUnlockReal={handleUnlockReal}
        onUnlockFake={handleUnlockFake}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950 pb-20">
      {/* Top Header */}
      <VaultHeader
        mode={mode}
        settings={settings}
        memoryStatus={memoryStatus}
        onLock={handleLock}
        onTriggerEmergency={handleTriggerEmergency}
      />

      {/* Main Content Workspace */}
      <main className="flex-1">
        {activeTab === 'vault' && (
          <VaultItemsView
            items={currentItems}
            mode={mode}
            onAddItem={handleAddItem}
            onUpdateItem={handleUpdateItem}
            onDeleteItem={handleDeleteItem}
          />
        )}

        {activeTab === 'generator' && (
          <PasswordGeneratorView
            onSaveToVault={mode === 'real' ? (item) => handleAddItem({ ...item, isSensitive: true }) : undefined}
          />
        )}

        {activeTab === 'storage' && (
          <StorageEngineView
            mode={mode}
            memoryStatus={memoryStatus}
            logs={cryptoLogs}
            onForceWipeRam={handleForceWipeRam}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            mode={mode}
            settings={settings}
            onUpdateSettings={(newSet) => {
              setSettings(newSet);
              addLog('info', 'Updated Vault security policies and PIN configuration.');
            }}
            onSelfDestruct={handleSelfDestruct}
            onLockNow={handleLock}
          />
        )}
      </main>

      {/* 10-Second Emergency Handover Modal */}
      {showEmergencyModal && (
        <EmergencyCountdownModal
          onExecuteHandover={() => handleUnlockFake(true)}
          onCancel={() => {
            setShowEmergencyModal(false);
            addLog('info', 'Emergency countdown cancelled by user (false alarm).');
          }}
        />
      )}

      {/* Bottom Navigation Tab Bar */}
      <VaultTabBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mode={mode}
      />
    </div>
  );
}
