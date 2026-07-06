import React, { useState, useEffect } from 'react';
import { VaultMode, AppTab, VaultItem, VaultSettings } from './types';
import { INITIAL_REAL_ITEMS, INITIAL_FAKE_ITEMS, DEFAULT_SETTINGS } from './data/initialVaultData';
import { AppLockScreen } from './components/AppLockScreen';
import { VaultHeader } from './components/VaultHeader';
import { VaultTabBar } from './components/VaultTabBar';
import { VaultItemsView } from './components/VaultItemsView';
import { SettingsView } from './components/SettingsView';

export default function App() {
  const [mode, setMode] = useState<VaultMode>('locked');
  const [activeTab, setActiveTab] = useState<AppTab>('vault');
  
  const [settings, setSettings] = useState<VaultSettings>(() => {
    try {
      const saved = localStorage.getItem('sos_settings_v1');
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [realItems, setRealItems] = useState<VaultItem[]>(() => {
    try {
      const saved = localStorage.getItem('sos_real_items_v1');
      return saved ? JSON.parse(saved) : INITIAL_REAL_ITEMS;
    } catch {
      return INITIAL_REAL_ITEMS;
    }
  });

  const [fakeItems, setFakeItems] = useState<VaultItem[]>(() => {
    try {
      const saved = localStorage.getItem('sos_fake_items_v1');
      return saved ? JSON.parse(saved) : INITIAL_FAKE_ITEMS;
    } catch {
      return INITIAL_FAKE_ITEMS;
    }
  });

  // Tự động lưu trữ vào localStorage khi có thay đổi
  useEffect(() => {
    localStorage.setItem('sos_settings_v1', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('sos_real_items_v1', JSON.stringify(realItems));
  }, [realItems]);

  useEffect(() => {
    localStorage.setItem('sos_fake_items_v1', JSON.stringify(fakeItems));
  }, [fakeItems]);

  // Tự động khóa theo thời gian không tương tác (Auto-Lock)
  useEffect(() => {
    if (mode === 'locked' || settings.autoLockMinutes === 0) return;
    
    let timer: NodeJS.Timeout;
    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        handleLock();
      }, settings.autoLockMinutes * 60 * 1000);
    };

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('touchstart', resetTimer);
    resetTimer();

    return () => {
      clearTimeout(timer);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('touchstart', resetTimer);
    };
  }, [mode, settings.autoLockMinutes]);

  // Mở Không gian Thật
  const handleUnlockReal = () => {
    setMode('real');
    setActiveTab('vault');
  };

  // Mở Không gian Giả
  const handleUnlockFake = () => {
    setMode('fake');
    setActiveTab('vault');
  };

  // Khóa ứng dụng
  const handleLock = () => {
    setMode('locked');
  };

  // Cập nhật CRUD cho dữ liệu
  const currentItems = mode === 'real' ? realItems : fakeItems;
  const setCurrentItems = mode === 'real' ? setRealItems : setFakeItems;

  const handleAddItem = (newItem: Omit<VaultItem, 'id' | 'updatedAt'>) => {
    const item: VaultItem = {
      ...newItem,
      id: `${mode === 'real' ? 'real' : 'fake'}-${Date.now()}`,
      updatedAt: 'Vừa xong'
    };
    setCurrentItems([item, ...currentItems]);
  };

  const handleUpdateItem = (updatedItem: VaultItem) => {
    setCurrentItems(
      currentItems.map((it) => (it.id === updatedItem.id ? { ...updatedItem, updatedAt: 'Vừa xong' } : it))
    );
  };

  const handleDeleteItem = (id: string) => {
    setCurrentItems(currentItems.filter((it) => it.id !== id));
  };

  // Khôi phục dữ liệu từ tệp sao lưu
  const handleRestoreData = (restoredReal: VaultItem[], restoredFake: VaultItem[]) => {
    setRealItems(restoredReal);
    setFakeItems(restoredFake);
  };

  // Màn hình Khóa
  if (mode === 'locked') {
    return (
      <AppLockScreen
        settings={settings}
        onUnlockReal={handleUnlockReal}
        onUnlockFake={handleUnlockFake}
      />
    );
  }

  // Màn hình làm việc chính (Không gian Thật hoặc Giả)
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Header */}
      <VaultHeader
        mode={mode}
        settings={settings}
        onLock={handleLock}
      />

      {/* Nội dung chính */}
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

        {activeTab === 'settings' && (
          <SettingsView
            mode={mode}
            settings={settings}
            onUpdateSettings={setSettings}
            onLockNow={handleLock}
            realItems={realItems}
            fakeItems={fakeItems}
            onRestoreData={handleRestoreData}
          />
        )}
      </main>

      {/* Thanh điều hướng dưới cùng (Tab Bar) */}
      <VaultTabBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mode={mode}
      />
    </div>
  );
}
