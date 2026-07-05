import React from 'react';
import { Shield, Lock, Zap, EyeOff, AlertTriangle, Cpu, CheckCircle2, RefreshCw, FileText, Smartphone } from 'lucide-react';
import { VaultMode, VaultSettings, MemoryStatus } from '../types';

interface VaultHeaderProps {
  mode: VaultMode;
  settings: VaultSettings;
  memoryStatus: MemoryStatus;
  onLock: () => void;
  onTriggerEmergency: () => void;
}

export const VaultHeader: React.FC<VaultHeaderProps> = ({
  mode,
  settings,
  memoryStatus,
  onLock,
  onTriggerEmergency
}) => {
  if (mode === 'fake') {
    // STEALTH FAKE MODE HEADER - ZERO SECURITY NOISE, COMPLETELY PLAUSIBLE
    return (
      <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center space-x-2.5">
              <div className="bg-slate-800 p-2 rounded-xl text-emerald-400">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <span className="font-bold text-base tracking-tight text-white">{settings.stealthTitle}</span>
                <span className="text-[10px] text-slate-400 block -mt-0.5 font-sans">Personal Organizer &amp; Tasks</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={onLock}
                title="Lock Application"
                className="flex items-center space-x-1.5 bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border border-slate-700/60"
              >
                <Lock className="h-3.5 w-3.5 text-slate-400" />
                <span>Lock</span>
              </button>
            </div>
          </div>
        </div>
      </header>
    );
  }

  // REAL WORKSPACE HEADER - FULL SECURITY CONTROLS & EMERGENCY PANIC SWITCH
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-40 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Security Status Badge */}
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2 rounded-xl shadow-md shadow-emerald-500/20">
              <Shield className="h-6 w-6 text-slate-950 fill-slate-950/20" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-white">VAULT</span>
                <span className="text-xs font-mono px-2 py-0.5 bg-emerald-950 text-emerald-400 rounded-md border border-emerald-800/60 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>real.sqlite.enc</span>
                </span>
              </div>
              <div className="flex items-center space-x-2 text-[11px] text-slate-400 font-mono">
                <span className="text-slate-300">RAM: K_real active</span>
                <span>&bull;</span>
                <span className="text-emerald-400">Secure Enclave OK</span>
              </div>
            </div>
          </div>

          {/* Action Controls: Lock & Emergency 10s Panic Switch */}
          <div className="flex items-center space-x-2.5">
            {/* EMERGENCY PANIC TRIGGER BUTTON */}
            <button
              onClick={onTriggerEmergency}
              className="group flex items-center space-x-2 bg-gradient-to-r from-rose-600/90 to-red-700 hover:from-rose-600 hover:to-red-600 text-white px-3.5 py-1.5 rounded-xl font-bold text-xs sm:text-sm shadow-lg shadow-rose-900/40 transition-all border border-rose-400/30 active:scale-95 animate-pulse"
              title="Trigger 10s Emergency Handover / Duress Mode"
            >
              <Zap className="h-4 w-4 text-amber-300 fill-current group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">10s Panic Switch</span>
              <span className="sm:hidden">Panic</span>
            </button>

            {/* Normal Lock Button */}
            <button
              onClick={onLock}
              className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-1.5 rounded-xl font-medium text-xs sm:text-sm transition-all border border-slate-700"
              title="Lock Vault"
            >
              <Lock className="h-3.5 w-3.5 text-emerald-400" />
              <span>Lock</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
