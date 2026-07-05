import React from 'react';
import { ListChecks, CheckCircle2, Clock, Lock, ShieldCheck, ArrowRight, AlertCircle, PlayCircle } from 'lucide-react';
import { MODULE_ROADMAP } from '../data/architectureSpec';

interface ModuleRoadmapViewProps {
  module0Status: 'in-review' | 'completed';
  onApproveModule0: () => void;
  module1Status?: 'in-review' | 'completed';
}

export const ModuleRoadmapView: React.FC<ModuleRoadmapViewProps> = ({
  module0Status,
  onApproveModule0,
  module1Status = 'in-review'
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border border-indigo-900/40 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-start space-x-4 max-w-4xl">
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl mt-1 hidden sm:block">
              <ListChecks className="h-8 w-8 text-indigo-400" />
            </div>
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full text-xs font-mono bg-indigo-950/80 text-indigo-300 border border-indigo-800/60">
                <span>ITERATIVE ENGINEERING ROADMAP</span>
                <span>&bull;</span>
                <span>STRICT MODULE-BY-MODULE EXECUTION</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Vault Development Plan & Governance
              </h1>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                As commanded: <em className="text-white font-semibold">"Do not generate the entire application at once. Stop after each completed module and wait for my approval before continuing."</em> Each module includes Purpose, Architecture, File Structure, Production Code, Security Considerations, and Testing.
              </p>
            </div>
          </div>

          {/* Action Button for Module 0 Approval */}
          {module0Status === 'in-review' ? (
            <div className="bg-slate-950 p-4 rounded-xl border border-emerald-500/40 space-y-3 max-w-sm">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
                <AlertCircle className="h-4 w-4 flex-shrink-0 animate-bounce" />
                <span>Action Required: Approve Architecture</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Review the Module 0 iOS Architecture Spec, Threat Model, and interactive 10s Trigger Simulator. If approved, click below to authorize proceeding to Module 1 (Cryptographic Core).
              </p>
              <button
                onClick={onApproveModule0}
                className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm rounded-lg shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <PlayCircle className="h-4 w-4" />
                <span>Approve Architecture & Proceed to Module 1</span>
              </button>
            </div>
          ) : (
            <div className="bg-emerald-950/80 p-4 rounded-xl border border-emerald-800/80 text-emerald-300 space-y-1 self-center">
              <div className="flex items-center space-x-2 font-bold text-sm">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                <span>Module 0 Approved</span>
              </div>
              <p className="text-xs text-emerald-200/80">
                You have authorized Module 0. We are ready for your prompt to begin Module 1 implementation.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Roadmap List */}
      <div className="space-y-6">
        <h2 className="text-lg font-semibold text-slate-200">
          Iterative Engineering Sequence (Modules 0 to 5)
        </h2>

        <div className="space-y-4">
          {MODULE_ROADMAP.map((step) => {
            const isApproved = (step.id === 0 && module0Status === 'completed') || (step.id === 1 && module1Status === 'completed');
            const isCurrent = (step.id === 0 && module0Status === 'in-review') || (step.id === 1 && module0Status === 'completed' && module1Status === 'in-review') || (step.id === 2 && module1Status === 'completed');
            const isLocked = !isApproved && !isCurrent;

            return (
              <div
                key={step.id}
                className={`border rounded-2xl p-6 transition-all ${
                  isCurrent
                    ? 'bg-slate-900/90 border-amber-500/60 shadow-xl shadow-amber-500/5'
                    : isApproved
                    ? 'bg-slate-900/80 border-emerald-500/50 shadow-lg'
                    : 'bg-slate-950/60 border-slate-800/80 opacity-75'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
                  <div className="flex items-start space-x-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm font-mono flex-shrink-0 ${
                      isApproved ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                      isCurrent ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                      'bg-slate-900 text-slate-500 border border-slate-800'
                    }`}>
                      M{step.id}
                    </div>
                    <div>
                      <h3 className="font-bold text-base sm:text-lg text-white">
                        {step.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-400">
                        {step.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Badge */}
                  <div className="flex items-center space-x-2">
                    {isApproved ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono text-xs font-bold">
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> COMPLETED & APPROVED
                      </span>
                    ) : isCurrent ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-amber-950 text-amber-400 border border-amber-800 font-mono text-xs font-bold animate-pulse">
                        <Clock className="h-3.5 w-3.5 mr-1.5" /> IN REVIEW (CURRENT)
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-900 text-slate-500 border border-slate-800 font-mono text-xs font-bold">
                        <Lock className="h-3.5 w-3.5 mr-1.5" /> LOCKED (WAITING APPROVAL)
                      </span>
                    )}
                  </div>
                </div>

                {/* Deliverables & Checklist Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 text-xs sm:text-sm">
                  <div className="space-y-2">
                    <span className="text-xs font-mono font-bold uppercase text-slate-400 block">
                      Required Module Deliverables:
                    </span>
                    <ul className="space-y-1.5">
                      {step.deliverables.map((deliv, idx) => (
                        <li key={idx} className="flex items-start space-x-2 text-slate-300">
                          <span className="text-emerald-400 font-bold">&bull;</span>
                          <span>{deliv}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-mono font-bold uppercase text-emerald-400 block">
                      Security & Architectural Verification:
                    </span>
                    <ul className="space-y-1.5">
                      {step.securityChecklist.map((chk, idx) => (
                        <li key={idx} className="flex items-start space-x-2 text-slate-300 bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
                          <ShieldCheck className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                          <span>{chk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
