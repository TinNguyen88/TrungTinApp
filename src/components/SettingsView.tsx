import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Shield, 
  Key, 
  Lock, 
  Smartphone, 
  Clock, 
  Zap, 
  Trash2, 
  EyeOff, 
  Check, 
  AlertTriangle, 
  Save,
  RotateCcw,
  FileText
} from 'lucide-react';
import { VaultSettings, VaultMode } from '../types';

interface SettingsViewProps {
  mode: VaultMode;
  settings: VaultSettings;
  onUpdateSettings: (newSettings: VaultSettings) => void;
  onSelfDestruct: () => void;
  onLockNow: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  mode,
  settings,
  onUpdateSettings,
  onSelfDestruct,
  onLockNow
}) => {
  const [realPin, setRealPin] = useState(settings.realPin);
  const [duressPin, setDuressPin] = useState(settings.duressPin);
  const [enableFaceId, setEnableFaceId] = useState(settings.enableFaceId);
  const [emergencyMode, setEmergencyMode] = useState(settings.emergencyMode);
  const [autoLockTimeoutMinutes, setAutoLockTimeoutMinutes] = useState(settings.autoLockTimeoutMinutes);
  const [stealthTitle, setStealthTitle] = useState(settings.stealthTitle);
  const [saved, setSaved] = useState(false);

  const isFake = mode === 'fake';

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (realPin.length !== 4 || duressPin.length !== 4) {
      alert("PINs must be exactly 4 digits.");
      return;
    }
    if (realPin === duressPin) {
      alert("Real PIN and Duress PIN cannot be identical!");
      return;
    }

    onUpdateSettings({
      ...settings,
      realPin,
      duressPin,
      enableFaceId,
      emergencyMode,
      autoLockTimeoutMinutes,
      stealthTitle
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (isFake) {
    // STEALTH FAKE MODE SETTINGS - LOOKS LIKE NORMAL ORGANIZER APP
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-xl font-bold text-white flex items-center justify-center space-x-2">
            <SettingsIcon className="h-5 w-5 text-emerald-400" />
            <span>App Settings &amp; Preferences</span>
          </h2>
          <p className="text-xs text-slate-400 font-sans">
            Customize your personal note-taking experience
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h4 className="font-semibold text-sm text-white">App Display Name</h4>
                <p className="text-xs text-slate-400">Title shown in header and iOS task switcher</p>
              </div>
              <span className="font-mono text-xs text-emerald-400 bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
                {settings.stealthTitle}
              </span>
            </div>

            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h4 className="font-semibold text-sm text-white">Default Font Family</h4>
                <p className="text-xs text-slate-400">Typography style for notes editor</p>
              </div>
              <span className="text-xs text-slate-300">System San-Serif</span>
            </div>

            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h4 className="font-semibold text-sm text-white">Auto-Sort Order</h4>
                <p className="text-xs text-slate-400">How notes are ordered in list view</p>
              </div>
              <span className="text-xs text-slate-300">Recently Updated</span>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-500">Version 1.0.4 (iOS Build)</span>
            <button
              onClick={onLockNow}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-4 py-2 rounded-xl transition-colors"
            >
              Sign Out &amp; Lock
            </button>
          </div>
        </div>
      </div>
    );
  }

  // REAL WORKSPACE SETTINGS - SECURITY, DURESS PINS & TIMERS
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-xl font-bold text-white flex items-center justify-center space-x-2">
          <Shield className="h-5 w-5 text-emerald-400" />
          <span>Security Governance &amp; Duress Configuration</span>
        </h2>
        <p className="text-xs text-slate-400 font-mono">
          Configure hardware triggers, secondary PIN traps, and auto-wipe policies
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* PIN Configuration */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-800 text-emerald-400">
            <Key className="h-5 w-5" />
            <h3 className="font-bold text-base text-white">Dual Workspace PIN Configuration</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <label className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block">
                Real Workspace PIN (4 digits)
              </label>
              <input
                type="text"
                maxLength={4}
                required
                value={realPin}
                onChange={(e) => setRealPin(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-base text-white font-mono font-bold tracking-widest focus:outline-none focus:border-emerald-500"
              />
              <p className="text-[11px] text-slate-400 leading-tight">
                Unlocks <code className="text-emerald-400">real.sqlite.enc</code> and allocates $K_{'{real}'}$ into RAM.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-amber-900/60 space-y-2">
              <label className="text-xs font-semibold text-amber-400 uppercase tracking-wider block">
                Duress PIN / Trap (4 digits)
              </label>
              <input
                type="text"
                maxLength={4}
                required
                value={duressPin}
                onChange={(e) => setDuressPin(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full bg-slate-900 border border-amber-700/60 rounded-xl px-3.5 py-2 text-base text-amber-300 font-mono font-bold tracking-widest focus:outline-none focus:border-amber-500"
              />
              <p className="text-[11px] text-slate-400 leading-tight">
                Entering this PIN instantly mounts <code className="text-amber-400">fake.sqlite.enc</code> and purges RAM.
              </p>
            </div>
          </div>
        </div>

        {/* Emergency Handover Mode & Timers */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl">
          <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-800 text-rose-400">
            <Zap className="h-5 w-5" />
            <h3 className="font-bold text-base text-white">Emergency Handover Trigger Mode</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-2 ${
              emergencyMode === 'countdown-10s'
                ? 'bg-rose-950/40 border-rose-500 shadow-md shadow-rose-900/20'
                : 'bg-slate-950 border-slate-800 hover:border-slate-700'
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-white flex items-center space-x-1.5">
                  <Clock className="h-4 w-4 text-amber-400" />
                  <span>10-Second Duress Countdown</span>
                </span>
                <input
                  type="radio"
                  name="emMode"
                  checked={emergencyMode === 'countdown-10s'}
                  onChange={() => setEmergencyMode('countdown-10s')}
                  className="accent-rose-500 w-4 h-4"
                />
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Tapping the emergency trigger initiates a 10-second countdown window. Gives you a chance to cancel if triggered accidentally, or tap execute to handover.
              </p>
            </label>

            <label className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-2 ${
              emergencyMode === 'instant'
                ? 'bg-rose-950/40 border-rose-500 shadow-md shadow-rose-900/20'
                : 'bg-slate-950 border-slate-800 hover:border-slate-700'
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-white flex items-center space-x-1.5">
                  <Zap className="h-4 w-4 text-rose-400" />
                  <span>Instant Zero-Latency Switch</span>
                </span>
                <input
                  type="radio"
                  name="emMode"
                  checked={emergencyMode === 'instant'}
                  onChange={() => setEmergencyMode('instant')}
                  className="accent-rose-500 w-4 h-4"
                />
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                0ms immediate transition upon panic trigger or hardware Action Button press. No countdown, zero latency, instant RAM zeroing.
              </p>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800/80">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Stealth App Title (Fake Mode Display)
              </label>
              <input
                type="text"
                value={stealthTitle}
                onChange={(e) => setStealthTitle(e.target.value)}
                placeholder="e.g. Daily Notes or Tasks"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                This title is displayed in the header when Fake Mode is active.
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Auto-Lock Inactivity Timeout
              </label>
              <select
                value={autoLockTimeoutMinutes}
                onChange={(e) => setAutoLockTimeoutMinutes(parseInt(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                <option value={1}>1 Minute</option>
                <option value={5}>5 Minutes (Default)</option>
                <option value={15}>15 Minutes</option>
                <option value={0}>Immediate on background</option>
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                When inactivity exceeds timeout, Vault locks and purges volatile RAM.
              </p>
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center space-x-2.5 bg-slate-950 p-3.5 rounded-xl border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
              <input
                type="checkbox"
                checked={enableFaceId}
                onChange={(e) => setEnableFaceId(e.target.checked)}
                className="rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-0 w-4 h-4"
              />
              <div>
                <span className="text-xs font-bold text-white block">Enable Biometric FaceID / TouchID Unlock</span>
                <span className="text-[11px] text-slate-400 block">
                  Allows quick unlock into Real Workspace. Note: Duress PIN always overrides FaceID.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Save & Self Destruct Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              if (confirm("CRITICAL WARNING: This will immediately zeroize all encryption keys and permanently delete both real and fake SQLite database containers from local storage! Continue?")) {
                onSelfDestruct();
              }
            }}
            className="w-full sm:w-auto bg-rose-950/80 hover:bg-rose-900 text-rose-300 hover:text-white px-5 py-3 rounded-2xl text-xs font-bold transition-all border border-rose-800/80 flex items-center justify-center space-x-2 active:scale-95 shadow-md shadow-rose-950"
          >
            <Trash2 className="h-4 w-4" />
            <span>Emergency Self-Destruct / Wipe All Vaults</span>
          </button>

          <button
            type="submit"
            className={`w-full sm:w-auto px-6 py-3 rounded-2xl text-sm font-bold transition-all flex items-center justify-center space-x-2 active:scale-95 shadow-lg ${
              saved
                ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/30'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-900/40'
            }`}
          >
            {saved ? <Check className="h-4 w-4 stroke-[3]" /> : <Save className="h-4 w-4" />}
            <span>{saved ? 'Settings Saved Successfully!' : 'Save Security Policy'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
