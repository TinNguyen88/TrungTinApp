import React, { useState, useEffect } from 'react';
import { AlertTriangle, Zap, Shield, EyeOff, RotateCcw, Clock, CheckCircle2 } from 'lucide-react';

interface EmergencyCountdownModalProps {
  onExecuteHandover: () => void;
  onCancel: () => void;
}

export const EmergencyCountdownModal: React.FC<EmergencyCountdownModalProps> = ({
  onExecuteHandover,
  onCancel
}) => {
  const [countdown, setCountdown] = useState<number>(10);
  const [isZeroing, setIsZeroing] = useState<boolean>(false);

  useEffect(() => {
    if (countdown > 0 && !isZeroing) {
      const timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && !isZeroing) {
      handleImmediateExecute();
    }
  }, [countdown, isZeroing]);

  const handleImmediateExecute = () => {
    setIsZeroing(true);
    setTimeout(() => {
      onExecuteHandover();
    }, 400); // Small 400ms delay to show RAM zeroing visual feedback before switching window root
  };

  return (
    <div className="fixed inset-0 bg-rose-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none animate-fadeIn">
      <div className="bg-slate-900 border-2 border-rose-500 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative text-center space-y-6 overflow-hidden">
        {/* Urgent Pulsing Banner Top */}
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-rose-600 via-amber-600 to-rose-600 py-1.5 px-4 text-xs font-bold uppercase tracking-widest text-white animate-pulse">
          EMERGENCY DURESS TRIGGER ACTIVATED
        </div>

        <div className="pt-4 flex flex-col items-center space-y-3">
          <div className="w-20 h-20 rounded-full bg-rose-950 border-2 border-rose-500 flex items-center justify-center shadow-lg shadow-rose-500/30 relative">
            <AlertTriangle className="w-10 h-10 text-rose-500 animate-bounce" />
            <span className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">
              10s
            </span>
          </div>

          <h2 className="text-2xl font-black tracking-tight text-white">
            {isZeroing ? 'PURGING VOLATILE RAM...' : 'SWITCHING TO FAKE WORKSPACE'}
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            You have triggered the emergency handover sequence. $K_{'{real}'}$ is being isolated for memory zeroing.
          </p>
        </div>

        {/* Huge Countdown Visualizer */}
        <div className="py-4 bg-slate-950 rounded-2xl border border-rose-900/60 flex flex-col items-center justify-center space-y-1">
          <div className="text-6xl font-black font-mono text-rose-500 tracking-wider">
            00:0{countdown}
          </div>
          <div className="text-[11px] font-mono uppercase tracking-widest text-slate-400">
            {isZeroing ? 'Executing memset_s(K_real, 0)...' : 'Auto-Handover Countdown'}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <button
            onClick={handleImmediateExecute}
            disabled={isZeroing}
            className="w-full bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center space-x-2 text-sm uppercase tracking-wider active:scale-95"
          >
            <Zap className="w-5 h-5 fill-current animate-pulse" />
            <span>Execute Emergency Handover Now</span>
          </button>

          <button
            onClick={onCancel}
            disabled={isZeroing}
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold py-3 px-6 rounded-xl border border-slate-700 transition-all flex items-center justify-center space-x-2 text-xs active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Cancel / False Alarm</span>
          </button>
        </div>

        <div className="text-[11px] font-mono text-slate-500 border-t border-slate-800 pt-3">
          Hardware App Intent &bull; Zero-Latency Root Switch
        </div>
      </div>
    </div>
  );
};
