import React, { useState, useEffect } from 'react';
import { Smartphone, Zap, Shield, EyeOff, CheckCircle2, AlertTriangle, Key, HardDrive, Cpu, RotateCcw, Lock, Unlock, FileText, Plus, Search, Trash2, Clock } from 'lucide-react';
import { SimulatorState, MemoryState, VaultItem } from '../types';
import { SAMPLE_REAL_ITEMS, SAMPLE_FAKE_ITEMS } from '../data/architectureSpec';

export const TriggerSimulatorView: React.FC = () => {
  const [deviceState, setDeviceState] = useState<SimulatorState>('locked');
  const [pinInput, setPinInput] = useState<string>('');
  const [timerActive, setTimerActive] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(10);
  const [items, setItems] = useState<VaultItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<VaultItem | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [logMessages, setLogMessages] = useState<string[]>([
    '[INIT] Vault iOS Simulator initialized in sandbox.',
    '[CRYPTO] Secure Enclave hardware entropy ready.',
    '[STORAGE] Encrypted database containers unmounted.'
  ]);

  const [memoryState, setMemoryState] = useState<MemoryState>({
    realKeyInMemory: false,
    fakeKeyInMemory: false,
    activeContainer: 'none',
    memoryWipeStatus: 'intact',
    lastAction: 'System Locked'
  });

  // 10-Second Countdown Timer Effect
  useEffect(() => {
    let interval: any = null;
    if (timerActive && countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0 && timerActive) {
      setTimerActive(false);
      addLog('[ALERT] 10-second emergency window expired!');
    }
    return () => clearInterval(interval);
  }, [timerActive, countdown]);

  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogMessages((prev) => [`[${timestamp}] ${msg}`, ...prev.slice(0, 14)]);
  };

  const startEmergencyTimer = () => {
    setCountdown(10);
    setTimerActive(true);
    addLog('[THREAT] Emergency handover scenario initiated! You have 10 seconds to react.');
  };

  // PIN Pad handler
  const handlePinDigit = (digit: string) => {
    if (pinInput.length < 4) {
      const nextPin = pinInput + digit;
      setPinInput(nextPin);

      if (nextPin.length === 4) {
        setTimeout(() => {
          if (nextPin === '8492') {
            // Real PIN Entered
            unlockRealWorkspace();
          } else if (nextPin === '1111') {
            // Duress PIN Entered
            unlockFakeWorkspace(true);
          } else {
            addLog('[ERROR] Invalid PIN entered.');
            setPinInput('');
          }
        }, 250);
      }
    }
  };

  const unlockRealWorkspace = () => {
    setDeviceState('real-workspace');
    setItems(SAMPLE_REAL_ITEMS);
    setSelectedItem(SAMPLE_REAL_ITEMS[0]);
    setPinInput('');
    setMemoryState({
      realKeyInMemory: true,
      fakeKeyInMemory: false,
      activeContainer: 'real.sqlite.enc',
      memoryWipeStatus: 'intact',
      lastAction: 'Unlocked Real Workspace via PIN 8492'
    });
    addLog('[SUCCESS] Real PIN verified. PBKDF2 derived K_real loaded into volatile RAM.');
    addLog('[STORAGE] Mounted encrypted container: real.sqlite.enc.');
  };

  const unlockFakeWorkspace = (fromDuressPin = false) => {
    setDeviceState('fake-workspace');
    setItems(SAMPLE_FAKE_ITEMS);
    setSelectedItem(SAMPLE_FAKE_ITEMS[0]);
    setPinInput('');
    setTimerActive(false);

    // Simulate Cryptographic RAM zeroing of Real Key
    setMemoryState({
      realKeyInMemory: false,
      fakeKeyInMemory: true,
      activeContainer: 'fake.sqlite.enc',
      memoryWipeStatus: 'wiped',
      lastAction: fromDuressPin ? 'Triggered Duress PIN Trap (1111)' : 'Panic Switch Triggered (RAM Scrubbed)'
    });

    if (fromDuressPin) {
      addLog('[DURESS] Duress PIN 1111 entered at lock screen! Bypassing FaceID.');
    }
    addLog('[CRYPTO] ZEROING VOLATILE RAM: K_real overwritten with memset_s(0).');
    addLog('[STORAGE] Swapped root container to fake.sqlite.enc. Zero canaries visible.');
  };

  const handleActionButtonTrigger = () => {
    addLog('[HARDWARE] iPhone Action Button squeezed! Executing AppIntent shortcut.');
    unlockFakeWorkspace(false);
  };

  const handlePanicGesture = () => {
    addLog('[GESTURE] 3-Finger down swipe detected on screen.');
    unlockFakeWorkspace(false);
  };

  const handleReset = () => {
    setDeviceState('locked');
    setPinInput('');
    setTimerActive(false);
    setCountdown(10);
    setSelectedItem(null);
    setMemoryState({
      realKeyInMemory: false,
      fakeKeyInMemory: false,
      activeContainer: 'none',
      memoryWipeStatus: 'intact',
      lastAction: 'System Reset to Locked Screen'
    });
    addLog('[RESET] iPhone locked. All encryption keys purged from memory.');
  };

  const filteredItems = items.filter((i) =>
    i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.preview.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Intro & Emergency Handover Simulator Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full text-xs font-mono bg-sky-950 text-sky-400 border border-sky-800 mb-2">
              <span>INTERACTIVE IOS SANDBOX</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              10-Second Emergency Handover Simulator
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
              Test how Vault behaves when you are suddenly forced to hand over your unlocked phone or forced to unlock it under duress. Observe the cryptographic memory state monitor on the right.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {!timerActive ? (
              <button
                onClick={startEmergencyTimer}
                className="flex items-center space-x-2 bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-xl font-medium text-sm shadow-lg shadow-amber-600/20 transition-all cursor-pointer"
              >
                <Clock className="h-4 w-4" />
                <span>Simulate 10s Handover Scenario</span>
              </button>
            ) : (
              <div className="flex items-center space-x-3 bg-amber-950 border border-amber-500 text-amber-300 px-4 py-2 rounded-xl animate-pulse font-mono font-bold">
                <Clock className="h-5 w-5 text-amber-400 animate-spin" />
                <span className="text-lg">{countdown}s REMAINING!</span>
              </div>
            )}
            <button
              onClick={handleReset}
              className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-xl font-medium text-sm border border-slate-700 transition-all cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Lock Device</span>
            </button>
          </div>
        </div>

        {/* Quick Hardware Trigger Bar */}
        <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-950/60 p-3 rounded-xl border border-slate-800">
          <span className="text-slate-400 font-mono flex items-center">
            <Zap className="h-4 w-4 text-amber-400 mr-1.5" />
            INSTANT EMERGENCY TRIGGERS (Try clicking these at any time):
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleActionButtonTrigger}
              className="px-3 py-1.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-mono font-bold rounded-lg shadow-sm transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <Smartphone className="h-3.5 w-3.5" />
              <span>Squeeze Action Button (App Intent)</span>
            </button>
            <button
              onClick={handlePanicGesture}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono font-bold rounded-lg border border-slate-700 transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <EyeOff className="h-3.5 w-3.5 text-purple-400" />
              <span>3-Finger Swipe Down Gesture</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: iOS Phone Simulator vs Cryptographic RAM Monitor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* iOS Phone Simulator Frame (col-span-6) */}
        <div className="lg:col-span-6 flex justify-center">
          <div className="w-full max-w-[360px] bg-slate-950 border-[10px] border-slate-800 rounded-[48px] shadow-2xl overflow-hidden relative min-h-[680px] flex flex-col justify-between">
            {/* iOS Notch / Dynamic Island */}
            <div className="w-32 h-6 bg-slate-900 rounded-b-2xl mx-auto absolute top-0 left-1/2 -translate-x-1/2 z-40 flex items-center justify-center space-x-2">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-950 border border-slate-800" />
              <div className="w-3 h-3 rounded-full bg-slate-950" />
            </div>

            {/* iOS Status Bar */}
            <div className="px-6 pt-3 pb-2 flex justify-between items-center text-[11px] font-semibold text-slate-300 z-30">
              <span>9:41</span>
              <div className="flex items-center space-x-1.5">
                <span className="text-[10px] font-mono bg-emerald-950 text-emerald-400 px-1.5 rounded">5G</span>
                <span>100%</span>
              </div>
            </div>

            {/* SCREEN CONTENTS */}
            <div className="flex-1 flex flex-col pt-4 overflow-hidden relative">
              {/* STATE 1: LOCKED SCREEN (PIN PAD) */}
              {deviceState === 'locked' && (
                <div className="flex-1 flex flex-col justify-between p-6 text-center animate-fadeIn">
                  <div className="space-y-4 pt-6">
                    <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-2xl mx-auto flex items-center justify-center shadow-lg">
                      <Lock className="h-8 w-8 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg">Vault Locked</h3>
                      <p className="text-xs text-slate-400 mt-1">Enter Master PIN or Duress PIN</p>
                    </div>

                    {/* PIN Dots */}
                    <div className="flex justify-center space-x-4 py-2">
                      {[0, 1, 2, 3].map((idx) => (
                        <div
                          key={idx}
                          className={`w-3.5 h-3.5 rounded-full border transition-all ${
                            pinInput.length > idx
                              ? 'bg-emerald-400 border-emerald-400 scale-110'
                              : 'border-slate-700 bg-slate-900'
                          }`}
                        />
                      ))}
                    </div>

                    {/* PIN Cheat Sheet for Reviewer */}
                    <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 text-[11px] text-left space-y-1 text-slate-300 font-mono">
                      <div className="flex justify-between">
                        <span className="text-emerald-400 font-bold">&bull; Real PIN (8492):</span>
                        <span>Opens Real Workspace</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-amber-400 font-bold">&bull; Duress PIN (1111):</span>
                        <span>Opens Fake Mode + RAM Wipe</span>
                      </div>
                    </div>
                  </div>

                  {/* Keypad */}
                  <div className="grid grid-cols-3 gap-3 max-w-[240px] mx-auto pb-4">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'â'].map((btn) => (
                      <button
                        key={btn}
                        onClick={() => {
                          if (btn === 'C') setPinInput('');
                          else if (btn === 'â') setPinInput((prev) => prev.slice(0, -1));
                          else handlePinDigit(btn);
                        }}
                        className="h-12 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-lg border border-slate-800/80 transition-all flex items-center justify-center active:scale-95 cursor-pointer"
                      >
                        {btn}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STATE 2 & 3: WORKSPACE MOUNTED (REAL OR FAKE) */}
              {(deviceState === 'real-workspace' || deviceState === 'fake-workspace') && (
                <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 animate-fadeIn">
                  {/* Top Bar inside App */}
                  <div className="px-4 py-2 border-b border-slate-800 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-white">My Organizer</h3>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {deviceState === 'real-workspace' ? '4 items &bull; Synchronized' : '4 items &bull; Synchronized'}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handlePanicGesture}
                        title="3-Finger Swipe Down Emergency Trigger"
                        className="p-1.5 bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-800 text-slate-400 hover:text-amber-400 transition-all cursor-pointer"
                      >
                        <EyeOff className="h-4 w-4" />
                      </button>
                      <button
                        onClick={handleReset}
                        title="Lock Vault"
                        className="p-1.5 bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
                      >
                        <Lock className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Search bar */}
                  <div className="px-4 py-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-500" />
                      <input
                        type="text"
                        placeholder="Search notes & documents..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-slate-700"
                      />
                    </div>
                  </div>

                  {/* Item List vs Selected Detail */}
                  <div className="flex-1 flex overflow-hidden">
                    {/* Item List */}
                    <div className="w-1/2 border-r border-slate-800/80 overflow-y-auto divide-y divide-slate-800/60">
                      {filteredItems.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setSelectedItem(item)}
                          className={`w-full p-2.5 text-left transition-all ${
                            selectedItem?.id === item.id ? 'bg-slate-900' : 'hover:bg-slate-900/50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-xs text-white truncate">{item.title}</span>
                          </div>
                          <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">{item.preview}</p>
                          <span className="text-[9px] text-slate-500 font-mono mt-1 block">{item.updatedAt}</span>
                        </button>
                      ))}
                    </div>

                    {/* Selected Item Detail view */}
                    <div className="w-1/2 p-3 overflow-y-auto bg-slate-950">
                      {selectedItem ? (
                        <div className="space-y-3">
                          <div className="border-b border-slate-800 pb-2">
                            <span className="text-[9px] font-mono px-1.5 py-0.5 bg-slate-900 text-slate-400 rounded uppercase">
                              {selectedItem.category}
                            </span>
                            <h4 className="font-bold text-xs text-white mt-1 leading-tight">{selectedItem.title}</h4>
                            <span className="text-[9px] text-slate-500 font-mono">{selectedItem.updatedAt}</span>
                          </div>
                          <div className="text-[11px] text-slate-300 whitespace-pre-wrap leading-relaxed font-mono bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/60">
                            {selectedItem.preview}
                          </div>
                        </div>
                      ) : (
                        <div className="h-full flex items-center justify-center text-center text-slate-500 text-xs p-4">
                          Select an item to view content
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bottom Navigation Bar inside Fake/Real mode */}
                  <div className="px-4 py-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400 bg-slate-900/60">
                    <span className="flex items-center">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1.5" />
                      Storage Integrity Verified
                    </span>
                    <span className="font-mono text-slate-500">AES-GCM 256</span>
                  </div>
                </div>
              )}
            </div>

            {/* Home Indicator Bar */}
            <div className="w-32 h-1 bg-slate-700 rounded-full mx-auto my-2" />
          </div>
        </div>

        {/* Cryptographic RAM & Storage State Monitor (col-span-6) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-slate-800 rounded-xl text-emerald-400 border border-slate-700/60">
                  <Cpu className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">Cryptographic State Monitor</h3>
                  <p className="text-xs text-slate-400 font-mono">Live observation of volatile memory & SQLite storage</p>
                </div>
              </div>
              <div className="px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300">
                <span>STATUS: {deviceState.toUpperCase()}</span>
              </div>
            </div>

            {/* RAM State Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Real Key RAM Status */}
              <div className={`p-4 rounded-xl border transition-all ${
                memoryState.realKeyInMemory
                  ? 'bg-rose-950/30 border-rose-800/80 text-rose-200'
                  : 'bg-slate-950 border-slate-800/80 text-slate-400'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold uppercase flex items-center">
                    <Key className="h-4 w-4 mr-1.5 text-rose-400" />
                    Real Key ($K_{'{real}'}$) in RAM
                  </span>
                  <span className={`w-2.5 h-2.5 rounded-full ${memoryState.realKeyInMemory ? 'bg-rose-500 animate-ping' : 'bg-slate-700'}`} />
                </div>
                <div className="text-base font-bold font-mono">
                  {memoryState.realKeyInMemory ? 'LOADED IN VOLATILE RAM' : 'ZEROED OUT / SCRUBBED'}
                </div>
                <p className="text-[11px] mt-1 opacity-80 leading-relaxed font-mono">
                  {memoryState.realKeyInMemory
                    ? 'WARNING: Real AES-GCM 256 master key currently exists in Swift memory buffer.'
                    : 'SAFE: Memory address overwritten with 0 via memset_s. Zero forensic residue.'}
                </p>
              </div>

              {/* Fake Key RAM Status */}
              <div className={`p-4 rounded-xl border transition-all ${
                memoryState.fakeKeyInMemory
                  ? 'bg-emerald-950/30 border-emerald-800/80 text-emerald-200'
                  : 'bg-slate-950 border-slate-800/80 text-slate-400'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold uppercase flex items-center">
                    <Key className="h-4 w-4 mr-1.5 text-emerald-400" />
                    Fake Key ($K_{'{fake}'}$) in RAM
                  </span>
                  <span className={`w-2.5 h-2.5 rounded-full ${memoryState.fakeKeyInMemory ? 'bg-emerald-500' : 'bg-slate-700'}`} />
                </div>
                <div className="text-base font-bold font-mono">
                  {memoryState.fakeKeyInMemory ? 'MOUNTED IN MEMORY' : 'NOT MOUNTED'}
                </div>
                <p className="text-[11px] mt-1 opacity-80 leading-relaxed font-mono">
                  {memoryState.fakeKeyInMemory
                    ? 'ACTIVE: Secondary legitimate workspace key loaded. Real workspace remains invisible.'
                    : 'INACTIVE: Secondary workspace key not loaded in RAM.'}
                </p>
              </div>
            </div>

            {/* Storage Container Status */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase text-slate-300 flex items-center">
                  <HardDrive className="h-4 w-4 mr-1.5 text-sky-400" />
                  Mounted SQLite Container & Plausible Deniability
                </span>
                <span className="px-2 py-0.5 bg-sky-950 text-sky-300 rounded border border-sky-800 font-mono text-xs">
                  {memoryState.activeContainer}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">REAL CONTAINER SIZE:</span>
                  <span className="text-slate-300 font-bold">50.0 MB (Noise Padded)</span>
                </div>
                <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">FAKE CONTAINER SIZE:</span>
                  <span className="text-slate-300 font-bold">50.0 MB (Noise Padded)</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 italic">
                * Note: Both containers are permanently padded to identical 50.0 MB allocation sizes using cryptographically secure random noise. Forensic file-size analysis cannot distinguish which database contains real data.
              </p>
            </div>

            {/* Real-Time Security Logs */}
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold uppercase text-slate-400 flex items-center">
                <FileText className="h-3.5 w-3.5 mr-1 text-slate-400" />
                Live Architecture Event Stream
              </span>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 h-44 overflow-y-auto font-mono text-[11px] space-y-1 text-slate-300">
                {logMessages.map((log, idx) => (
                  <div key={idx} className={`leading-relaxed ${
                    log.includes('[SUCCESS]') || log.includes('[SAFE]') ? 'text-emerald-400 font-semibold' :
                    log.includes('[DURESS]') || log.includes('[THREAT]') || log.includes('[ALERT]') ? 'text-amber-400 font-bold' :
                    log.includes('[CRYPTO]') ? 'text-purple-300 font-semibold' :
                    log.includes('[HARDWARE]') || log.includes('[GESTURE]') ? 'text-sky-300' :
                    'text-slate-400'
                  }`}>
                    {log}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
