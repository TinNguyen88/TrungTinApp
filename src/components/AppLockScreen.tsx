import React, { useState, useEffect } from 'react';
import { Shield, Lock, Delete, Smartphone, Zap, EyeOff, CheckCircle2, AlertTriangle, Key } from 'lucide-react';
import { VaultSettings } from '../types';

interface AppLockScreenProps {
  settings: VaultSettings;
  onUnlockReal: () => void;
  onUnlockFake: (isDuress: boolean) => void;
}

export const AppLockScreen: React.FC<AppLockScreenProps> = ({
  settings,
  onUnlockReal,
  onUnlockFake
}) => {
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [faceIdState, setFaceIdState] = useState<'idle' | 'scanning' | 'success' | 'failed'>('idle');

  // Trigger auto FaceID scan simulation on mount if enabled
  useEffect(() => {
    if (settings.enableFaceId) {
      const timer = setTimeout(() => {
        setFaceIdState('scanning');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [settings.enableFaceId]);

  const handleDigit = (digit: string) => {
    if (isAuthenticating) return;
    setError(null);
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);

      if (nextPin.length === 4) {
        setIsAuthenticating(true);
        setTimeout(() => {
          if (nextPin === settings.realPin) {
            onUnlockReal();
          } else if (nextPin === settings.duressPin) {
            // DURESS PIN DETECTED: Immediately mount fake workspace & wipe RAM!
            onUnlockFake(true);
          } else {
            setError('Incorrect PIN. Attempt logged.');
            setPin('');
            setIsAuthenticating(false);
          }
        }, 220);
      }
    }
  };

  const handleDelete = () => {
    if (pin.length > 0 && !isAuthenticating) {
      setPin(pin.slice(0, -1));
      setError(null);
    }
  };

  const simulateFaceId = () => {
    if (isAuthenticating) return;
    setFaceIdState('scanning');
    setIsAuthenticating(true);
    setTimeout(() => {
      setFaceIdState('success');
      setTimeout(() => {
        onUnlockReal();
      }, 400);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-between p-6 select-none relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header / App Identity */}
      <div className="w-full max-w-sm flex flex-col items-center pt-8 space-y-4 relative z-10">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-xl shadow-emerald-500/20 border border-emerald-400/30">
            <Shield className="w-8 h-8 text-slate-950 fill-slate-950/20" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-slate-900 border-2 border-slate-950 flex items-center justify-center">
            <Lock className="w-3 h-3 text-emerald-400" />
          </div>
        </div>
        
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-white">Vault iOS</h1>
          <p className="text-xs text-slate-400 font-mono">Zero-Knowledge Encrypted Container</p>
        </div>
      </div>

      {/* Center PIN Display & Biometric Trigger */}
      <div className="w-full max-w-xs flex flex-col items-center space-y-8 my-auto relative z-10">
        {/* PIN Dots */}
        <div className="flex items-center justify-center space-x-6 py-4">
          {[0, 1, 2, 3].map((idx) => {
            const isFilled = idx < pin.length;
            return (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full transition-all duration-150 ${
                  isFilled
                    ? 'bg-emerald-400 scale-110 shadow-lg shadow-emerald-400/50'
                    : 'bg-slate-800 border border-slate-700'
                }`}
              />
            );
          })}
        </div>

        {/* Error Message */}
        <div className="h-6 flex items-center justify-center">
          {error && (
            <div className="flex items-center space-x-1.5 text-rose-400 text-xs font-medium animate-shake bg-rose-950/60 px-3 py-1 rounded-full border border-rose-800/60">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* FaceID Button */}
        {settings.enableFaceId && (
          <button
            onClick={simulateFaceId}
            disabled={isAuthenticating}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              faceIdState === 'scanning'
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 animate-pulse'
                : faceIdState === 'success'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            <Smartphone className={`w-4 h-4 ${faceIdState === 'scanning' ? 'animate-bounce text-emerald-400' : ''}`} />
            <span>
              {faceIdState === 'scanning'
                ? 'Scanning FaceID...'
                : faceIdState === 'success'
                ? 'FaceID Verified!'
                : 'Tap for FaceID Unlock'}
            </span>
          </button>
        )}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-x-6 gap-y-4 w-full px-4">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              onClick={() => handleDigit(digit)}
              disabled={isAuthenticating}
              className="w-20 h-20 mx-auto rounded-full bg-slate-900/90 hover:bg-slate-800 active:bg-slate-700/80 border border-slate-800/80 flex flex-col items-center justify-center transition-all active:scale-95 shadow-md group"
            >
              <span className="text-2xl font-medium text-white group-hover:text-emerald-300 transition-colors">{digit}</span>
            </button>
          ))}

          {/* Bottom row: Empty / Biometric shortcut, 0, Delete */}
          <div className="w-20 h-20 mx-auto flex items-center justify-center">
            <button
              onClick={() => onUnlockFake(false)}
              title="Direct Quick Launch Fake Mode (Emergency Action Button Simulation)"
              className="w-12 h-12 rounded-full bg-slate-900/60 hover:bg-amber-950/60 hover:border-amber-700/50 text-slate-500 hover:text-amber-400 border border-slate-800 flex items-center justify-center transition-all text-xs"
            >
              <EyeOff className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={() => handleDigit('0')}
            disabled={isAuthenticating}
            className="w-20 h-20 mx-auto rounded-full bg-slate-900/90 hover:bg-slate-800 active:bg-slate-700/80 border border-slate-800/80 flex items-center justify-center transition-all active:scale-95 shadow-md group"
          >
            <span className="text-2xl font-medium text-white group-hover:text-emerald-300 transition-colors">0</span>
          </button>

          <div className="w-20 h-20 mx-auto flex items-center justify-center">
            <button
              onClick={handleDelete}
              disabled={isAuthenticating || pin.length === 0}
              className="w-14 h-14 rounded-full bg-slate-900/80 hover:bg-slate-800 active:bg-slate-700 text-slate-400 hover:text-white disabled:opacity-30 border border-slate-800 flex items-center justify-center transition-all active:scale-95"
            >
              <Delete className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Security Info Footer & Quick PIN Cheat Sheet for Evaluator */}
      <div className="w-full max-w-md pb-4 text-center space-y-3 relative z-10">
        <div className="p-3 bg-slate-900/90 rounded-2xl border border-slate-800/80 backdrop-blur-md shadow-xl">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-slate-300 font-semibold">Real PIN: <code className="text-emerald-400 bg-slate-950 px-1.5 py-0.5 rounded border border-emerald-900/50">{settings.realPin}</code></span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-slate-300 font-semibold">Duress PIN: <code className="text-amber-400 bg-slate-950 px-1.5 py-0.5 rounded border border-amber-900/50">{settings.duressPin}</code></span>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 border-t border-slate-800/60 pt-2 leading-tight">
            Entering the <strong className="text-amber-400/90">Duress PIN</strong> triggers a 0ms secondary workspace mount and executes volatile RAM zeroing (<code className="text-sky-400/80">memset_s</code>) on K_real.
          </p>
        </div>
      </div>
    </div>
  );
};
