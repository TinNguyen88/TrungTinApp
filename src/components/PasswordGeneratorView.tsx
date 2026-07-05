import React, { useState, useEffect } from 'react';
import { Key, Copy, Check, RefreshCw, ShieldCheck, Zap, Plus, Sliders } from 'lucide-react';
import { generateSecurePassword } from '../utils/cryptoSim';
import { VaultItemCategory } from '../types';

interface PasswordGeneratorViewProps {
  onSaveToVault?: (item: { title: string; category: VaultItemCategory; content: string; password?: string }) => void;
}

export const PasswordGeneratorView: React.FC<PasswordGeneratorViewProps> = ({ onSaveToVault }) => {
  const [password, setPassword] = useState<string>('');
  const [length, setLength] = useState<number>(20);
  const [useNumbers, setUseNumbers] = useState<boolean>(true);
  const [useSymbols, setUseSymbols] = useState<boolean>(true);
  const [usePassphrase, setUsePassphrase] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);

  const regenerate = () => {
    const newPass = generateSecurePassword({
      length,
      useNumbers,
      useSymbols,
      usePassphrase
    });
    setPassword(newPass);
    setCopied(false);
    setSaved(false);
  };

  useEffect(() => {
    regenerate();
  }, [length, useNumbers, useSymbols, usePassphrase]);

  const handleCopy = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSave = () => {
    if (onSaveToVault && password) {
      onSaveToVault({
        title: `Generated Secret (${new Date().toLocaleDateString()})`,
        category: 'credential',
        content: `Auto-generated high entropy secret.\nPassword: ${password}`,
        password: password
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  // Estimate entropy bits
  const calcEntropy = () => {
    if (usePassphrase) {
      const words = password.split(/[- 0-9]/).filter(Boolean).length || 4;
      return Math.round(words * 12.9);
    }
    let poolSize = 26 + 26;
    if (useNumbers) poolSize += 10;
    if (useSymbols) poolSize += 30;
    return Math.round(length * Math.log2(poolSize));
  };

  const entropy = calcEntropy();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-xl font-bold text-white flex items-center justify-center space-x-2">
          <Key className="h-5 w-5 text-emerald-400" />
          <span>High-Entropy Secret Generator</span>
        </h2>
        <p className="text-xs text-slate-400 font-mono">
          Derived using device Secure Enclave hardware random entropy (<code className="text-emerald-400">SecRandomCopyBytes</code>)
        </p>
      </div>

      {/* Password Display Box */}
      <div className="bg-slate-900 border-2 border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 relative overflow-hidden group">
        <div className="absolute top-0 right-0 bg-emerald-950/80 px-3 py-1 rounded-bl-xl border-l border-b border-emerald-800/60 text-[10px] font-mono text-emerald-400 flex items-center space-x-1">
          <ShieldCheck className="h-3 w-3" />
          <span>~{entropy} bits entropy</span>
        </div>

        <div className="pt-3 pb-2 break-all font-mono text-lg sm:text-xl font-bold text-emerald-300 tracking-wide text-center selection:bg-emerald-500 selection:text-slate-950 min-h-[60px] flex items-center justify-center">
          {password || 'Generating...'}
        </div>

        <div className="flex items-center justify-center space-x-3 pt-2 border-t border-slate-800/80">
          <button
            onClick={regenerate}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition-all active:scale-95"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Regenerate</span>
          </button>

          <button
            onClick={handleCopy}
            className={`flex items-center space-x-1.5 px-5 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-md ${
              copied
                ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
            }`}
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            <span>{copied ? 'Copied to Clipboard' : 'Copy Secret'}</span>
          </button>

          {onSaveToVault && (
            <button
              onClick={handleSave}
              disabled={saved}
              className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all active:scale-95 ${
                saved
                  ? 'bg-teal-950 text-teal-300 border border-teal-800'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700'
              }`}
            >
              {saved ? <Check className="h-3.5 w-3.5 text-teal-400" /> : <Plus className="h-3.5 w-3.5" />}
              <span>{saved ? 'Saved to Vault!' : 'Save to Vault'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Configuration Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
          <span className="flex items-center space-x-1.5">
            <Sliders className="h-4 w-4 text-emerald-400" />
            <span>Generation Parameters</span>
          </span>
          <span className="font-mono text-emerald-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
            {usePassphrase ? `${Math.floor(length / 4)} words` : `${length} characters`}
          </span>
        </div>

        <div className="space-y-2">
          <input
            type="range"
            min={12}
            max={32}
            step={1}
            value={length}
            onChange={(e) => setLength(parseInt(e.target.value))}
            className="w-full accent-emerald-500 bg-slate-950 h-2 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-500">
            <span>12 chars (Standard)</span>
            <span>20 chars (High Security)</span>
            <span>32 chars (Maximum)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800/80">
          <label className="flex items-center space-x-2.5 bg-slate-950 p-3 rounded-xl border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
            <input
              type="checkbox"
              checked={useNumbers}
              onChange={(e) => setUseNumbers(e.target.checked)}
              disabled={usePassphrase}
              className="rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-0 w-4 h-4"
            />
            <span className="text-xs font-medium text-slate-300">Include Numbers (0-9)</span>
          </label>

          <label className="flex items-center space-x-2.5 bg-slate-950 p-3 rounded-xl border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
            <input
              type="checkbox"
              checked={useSymbols}
              onChange={(e) => setUseSymbols(e.target.checked)}
              className="rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-0 w-4 h-4"
            />
            <span className="text-xs font-medium text-slate-300">Include Symbols (!@#$)</span>
          </label>

          <label className="flex items-center space-x-2.5 bg-slate-950 p-3 rounded-xl border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
            <input
              type="checkbox"
              checked={usePassphrase}
              onChange={(e) => setUsePassphrase(e.target.checked)}
              className="rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-0 w-4 h-4"
            />
            <span className="text-xs font-medium text-slate-300">Diceware Passphrase</span>
          </label>
        </div>
      </div>
    </div>
  );
};
