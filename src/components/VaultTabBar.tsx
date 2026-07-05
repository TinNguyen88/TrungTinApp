import React from 'react';
import { Shield, Key, HardDrive, Settings, FileText, Zap, Folder, CheckSquare } from 'lucide-react';
import { AppTab, VaultMode } from '../types';

interface VaultTabBarProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  mode: VaultMode;
}

export const VaultTabBar: React.FC<VaultTabBarProps> = ({
  activeTab,
  setActiveTab,
  mode
}) => {
  const isFake = mode === 'fake';

  const tabs: { id: AppTab; label: string; fakeLabel: string; icon: React.FC<{ className?: string }> }[] = [
    {
      id: 'vault',
      label: 'Vault Items',
      fakeLabel: 'My Notes',
      icon: isFake ? FileText : Shield
    },
    {
      id: 'generator',
      label: 'Password Gen',
      fakeLabel: 'Quick Tools',
      icon: isFake ? CheckSquare : Key
    },
    {
      id: 'storage',
      label: 'Storage & RAM',
      fakeLabel: 'Local Backups',
      icon: isFake ? Folder : HardDrive
    },
    {
      id: 'settings',
      label: 'Settings',
      fakeLabel: 'Settings',
      icon: Settings
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 border-t border-slate-800 backdrop-blur-md z-30 shadow-2xl">
      <div className="max-w-md mx-auto px-4 py-2 flex items-center justify-around">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab.id;
          const displayLabel = isFake ? tab.fakeLabel : tab.label;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
                isActive
                  ? isFake
                    ? 'text-emerald-400 font-semibold'
                    : 'text-emerald-400 font-semibold bg-emerald-950/40 border border-emerald-500/20 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <IconComponent
                className={`h-5 w-5 mb-0.5 transition-transform ${
                  isActive ? 'scale-110 text-emerald-400' : 'text-slate-400'
                }`}
              />
              <span className="text-[11px] tracking-tight">{displayLabel}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
