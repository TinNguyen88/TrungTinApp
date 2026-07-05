import React from 'react';
import { HardDrive, Cpu, ShieldAlert, CheckCircle2, RotateCcw, Lock, Unlock, Zap, Database, Terminal, FileCode, AlertTriangle } from 'lucide-react';
import { VaultMode, MemoryStatus, CryptoLog } from '../types';

interface StorageEngineViewProps {
  mode: VaultMode;
  memoryStatus: MemoryStatus;
  logs: CryptoLog[];
  onForceWipeRam: () => void;
  onExportBackup?: () => void;
}

export const StorageEngineView: React.FC<StorageEngineViewProps> = ({
  mode,
  memoryStatus,
  logs,
  onForceWipeRam,
  onExportBackup
}) => {
  const isFake = mode === 'fake';

  if (isFake) {
    // STEALTH FAKE MODE VIEW - LOOKS LIKE NORMAL LOCAL BACKUP & STORAGE UTILITY
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-xl font-bold text-white flex items-center justify-center space-x-2">
            <HardDrive className="h-5 w-5 text-emerald-400" />
            <span>Local Backups &amp; Storage Usage</span>
          </h2>
          <p className="text-xs text-slate-400 font-sans">
            Offline SQLite storage container for your personal organizer notes
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-emerald-400">
                <Database className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-white">notes.sqlite</h4>
                <p className="text-xs text-slate-400 font-mono">Mounted &bull; Local offline directory</p>
              </div>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-800/60">
              412 KB
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed font-sans">
            Your notes and lists are stored locally on your device using Apple iOS App Sandbox storage. No data is transmitted to cloud servers.
          </p>

          <div className="pt-2 flex justify-end">
            <button
              onClick={() => alert("Backup export initiated. File stored in local App Sandbox Documents directory.")}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-4 py-2 rounded-xl transition-colors"
            >
              Export Local Backup (.sqlite)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // REAL WORKSPACE - FULL CRYPTOGRAPHIC STORAGE & VOLATILE RAM INSPECTOR
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-xl font-bold text-white flex items-center justify-center space-x-2">
          <ShieldAlert className="h-5 w-5 text-emerald-400" />
          <span>Dual-Container Storage &amp; Cryptographic RAM Core</span>
        </h2>
        <p className="text-xs text-slate-400 font-mono">
          Hardware Secure Enclave &bull; PBKDF2 / Argon2id &bull; Volatile Memory Zeroing (<code className="text-sky-300">memset_s</code>)
        </p>
      </div>

      {/* Volatile RAM Status Card */}
      <div className="bg-slate-900 border-2 border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-sky-400">
              <Cpu className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-sky-400 block">VOLATILE RAM INSPECTOR</span>
              <h3 className="text-base font-bold text-white">Cryptographic Key Buffer Status</h3>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold flex items-center space-x-1.5 ${
              memoryStatus.realKeyInMemory
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                : 'bg-rose-950 text-rose-300 border border-rose-800'
            }`}>
              <span className={`w-2 h-2 rounded-full ${memoryStatus.realKeyInMemory ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
              <span>{memoryStatus.realKeyInMemory ? '$K_{real}$ ACTIVE IN RAM' : '$K_{real}$ ZEROED FROM RAM'}</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Primary Key ($K_{'{real}'}$):</span>
              <span className={memoryStatus.realKeyInMemory ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                {memoryStatus.realKeyInMemory ? '256-bit PBKDF2 Allocated' : '0x00000000 (Wiped)'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              {memoryStatus.realKeyInMemory
                ? 'Key currently held in protected volatile memory for decryption operations.'
                : 'Key buffer forcefully overwritten using memset_s. Cryptographic extraction impossible.'}
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Secondary Key ($K_{'{fake}'}$):</span>
              <span className="text-slate-300 font-mono">Isolated / Dormant</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              Fake container key is independent and cannot decrypt real.sqlite.enc under any circumstances.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <span className="text-xs font-mono text-slate-400">
            Last Action: <strong className="text-slate-200">{memoryStatus.lastAction}</strong>
          </span>

          <button
            onClick={onForceWipeRam}
            className="flex items-center space-x-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-300 hover:text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border border-rose-800/60 active:scale-95"
            title="Simulate immediate volatile RAM zeroing without switching windows"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Force Zeroize RAM ($K_{'{real}'}$ &rarr; 0x00)</span>
          </button>
        </div>
      </div>

      {/* Dual SQLite Container Filesystem Inspector */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
        <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
          <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-emerald-400">
            <HardDrive className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Dual SQLite Container Filesystem</h3>
            <p className="text-xs text-slate-400 font-mono">Physical isolation in iOS App Sandbox (/Documents)</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Real Container */}
          <div className="bg-slate-950 border border-emerald-500/30 rounded-2xl p-4 space-y-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-emerald-950/80 px-2.5 py-1 rounded-bl-xl border-l border-b border-emerald-800 text-[10px] font-mono text-emerald-400 font-bold">
              MOUNTED
            </div>
            <div className="flex items-center space-x-2 text-emerald-400">
              <Database className="h-5 w-5" />
              <span className="font-mono font-bold text-sm text-white">real.sqlite.enc</span>
            </div>
            <div className="space-y-1 text-xs font-mono text-slate-400">
              <div className="flex justify-between"><span>Size:</span><span className="text-slate-200">2,048 KB (Noise Padded)</span></div>
              <div className="flex justify-between"><span>Cipher:</span><span className="text-emerald-400">AES-256-GCM / SQLCipher</span></div>
              <div className="flex justify-between"><span>Entropy:</span><span className="text-slate-200">Secure Enclave PBKDF2</span></div>
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              Contains encrypted credentials and notes. Padded with random blocks to conceal actual record counts.
            </p>
          </div>

          {/* Fake Container */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 relative opacity-80">
            <div className="absolute top-0 right-0 bg-slate-900 px-2.5 py-1 rounded-bl-xl border-l border-b border-slate-800 text-[10px] font-mono text-slate-400">
              UNMOUNTED / STANDBY
            </div>
            <div className="flex items-center space-x-2 text-amber-400">
              <Database className="h-5 w-5" />
              <span className="font-mono font-bold text-sm text-white">fake.sqlite.enc</span>
            </div>
            <div className="space-y-1 text-xs font-mono text-slate-400">
              <div className="flex justify-between"><span>Size:</span><span className="text-slate-200">2,048 KB (Identical Size)</span></div>
              <div className="flex justify-between"><span>Cipher:</span><span className="text-amber-400">AES-256-GCM / SQLCipher</span></div>
              <div className="flex justify-between"><span>Entropy:</span><span className="text-slate-200">Independent PBKDF2</span></div>
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              Contains everyday plausible organizer notes. Acts as the primary decoy during duress handover.
            </p>
          </div>
        </div>
      </div>

      {/* Live Cryptographic Audit Log */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3">
        <div className="flex items-center space-x-2 text-xs font-mono font-bold text-slate-300 uppercase tracking-wider pb-2 border-b border-slate-800">
          <Terminal className="h-4 w-4 text-emerald-400" />
          <span>Real-Time Cryptographic Engine Audit Log</span>
        </div>

        <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800/80 font-mono text-xs space-y-2 max-h-52 overflow-y-auto">
          {logs.map((log) => {
            const color =
              log.level === 'threat'
                ? 'text-rose-400 font-bold'
                : log.level === 'warn'
                ? 'text-amber-400'
                : log.level === 'success'
                ? 'text-emerald-400'
                : 'text-slate-300';
            return (
              <div key={log.id} className="flex items-start space-x-2">
                <span className="text-slate-500 shrink-0">[{log.timestamp}]</span>
                <span className={color}>{log.message}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
