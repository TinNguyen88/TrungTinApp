import React, { useState } from 'react';
import { Zap, ShieldCheck, Layout, EyeOff, Code, CheckCircle2, XCircle, ChevronDown, ChevronUp, Cpu, HardDrive, AlertCircle } from 'lucide-react';
import { ARCHITECTURAL_PILLARS } from '../data/architectureSpec';

export const ArchitectureSpecView: React.FC = () => {
  const [expandedPillar, setExpandedPillar] = useState<string>('10s-trigger');

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Zap': return <Zap className="h-6 w-6 text-amber-400" />;
      case 'ShieldCheck': return <ShieldCheck className="h-6 w-6 text-emerald-400" />;
      case 'Layout': return <Layout className="h-6 w-6 text-sky-400" />;
      case 'EyeOff': return <EyeOff className="h-6 w-6 text-purple-400" />;
      default: return <Cpu className="h-6 w-6 text-slate-400" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Executive Summary Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl mt-1 hidden sm:block">
            <Cpu className="h-8 w-8 text-emerald-400" />
          </div>
          <div className="space-y-3 max-w-4xl">
            <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full text-xs font-mono bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">
              <span>MODULE 0 DELIVERABLE</span>
              <span>&bull;</span>
              <span>STATUS: AWAITING APPROVAL</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Vault: iOS Security & Dual-Workspace Blueprint
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              As your Senior iOS Engineer and Security Architect, I have designed Vault around a strict cryptographic separation model. In a 10-second duress window, standard panic buttons fail. Vault relies on hardware-level App Intents (Action Button / Back Tap) and a lock-screen Duress PIN trap that instantly mounts a legitimate secondary workspace while zeroing out primary encryption keys (K_real) from volatile RAM.
            </p>
            <div className="flex flex-wrap gap-3 pt-2 text-xs font-mono text-slate-400">
              <span className="flex items-center px-2.5 py-1 bg-slate-800/80 rounded-md border border-slate-700/60">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 mr-1.5" /> iOS 17+ Native
              </span>
              <span className="flex items-center px-2.5 py-1 bg-slate-800/80 rounded-md border border-slate-700/60">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 mr-1.5" /> Zero Cloud Sync (Offline Only)
              </span>
              <span className="flex items-center px-2.5 py-1 bg-slate-800/80 rounded-md border border-slate-700/60">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 mr-1.5" /> RAM memset_s Wiping
              </span>
              <span className="flex items-center px-2.5 py-1 bg-slate-800/80 rounded-md border border-slate-700/60">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 mr-1.5" /> Secure Enclave Entropy
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Core Architectural Pillars */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-200 flex items-center space-x-2">
          <span>Core Engineering & Security Pillars</span>
          <span className="text-xs font-normal text-slate-400">(Click to inspect technical specs and trade-off decisions)</span>
        </h2>

        <div className="grid grid-cols-1 gap-4">
          {ARCHITECTURAL_PILLARS.map((pillar) => {
            const isExpanded = expandedPillar === pillar.id;
            return (
              <div
                key={pillar.id}
                className={`border rounded-xl transition-all overflow-hidden ${
                  isExpanded
                    ? 'bg-slate-900/90 border-slate-700 shadow-xl'
                    : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60'
                }`}
              >
                {/* Pillar Header */}
                <button
                  onClick={() => setExpandedPillar(isExpanded ? '' : pillar.id)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left cursor-pointer"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-2.5 bg-slate-800 rounded-xl border border-slate-700/60">
                      {getIcon(pillar.icon)}
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                        {pillar.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-400">
                        {pillar.subtitle}
                      </p>
                    </div>
                  </div>
                  <div className="text-slate-400 ml-4 flex-shrink-0">
                    {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </div>
                </button>

                {/* Pillar Details (Expanded) */}
                {isExpanded && (
                  <div className="px-6 pb-6 pt-2 border-t border-slate-800/80 space-y-6 animate-fadeIn">
                    <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/40 p-4 rounded-lg border border-slate-800/60">
                      {pillar.summary}
                    </p>

                    {/* Detailed Specifications */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-mono font-bold tracking-wider text-emerald-400 uppercase">
                        Technical Specifications & Rules
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {pillar.details.map((detail, idx) => (
                          <div key={idx} className="flex items-start space-x-2.5 text-xs sm:text-sm text-slate-300 bg-slate-800/30 p-3 rounded-lg border border-slate-800">
                            <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                            <span>{detail}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* iOS Technical Implementation & Snippets */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
                      <div className="lg:col-span-1 space-y-3">
                        <h4 className="text-xs font-mono font-bold tracking-wider text-sky-400 uppercase flex items-center">
                          <Code className="h-3.5 w-3.5 mr-1.5" /> iOS Frameworks & APIs
                        </h4>
                        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 text-xs">
                          <div>
                            <span className="text-slate-500 block mb-1 font-mono">FRAMEWORKS:</span>
                            <div className="flex flex-wrap gap-1.5">
                              {pillar.iosTechnicalImplementation.frameworks.map((fw, idx) => (
                                <span key={idx} className="px-2 py-0.5 bg-sky-950/60 text-sky-300 rounded border border-sky-800/60 font-mono">
                                  {fw}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <span className="text-slate-500 block mb-1 font-mono">CORE APIS:</span>
                            <div className="flex flex-wrap gap-1.5">
                              {pillar.iosTechnicalImplementation.apis.map((api, idx) => (
                                <span key={idx} className="px-2 py-0.5 bg-slate-900 text-slate-300 rounded border border-slate-800 font-mono">
                                  {api}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Code Snippet */}
                      {pillar.iosTechnicalImplementation.codeSnippet && (
                        <div className="lg:col-span-2 space-y-3">
                          <h4 className="text-xs font-mono font-bold tracking-wider text-slate-400 uppercase">
                            Reference iOS Architecture Implementation (Swift)
                          </h4>
                          <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-emerald-300 overflow-x-auto leading-relaxed shadow-inner">
                            <code>{pillar.iosTechnicalImplementation.codeSnippet}</code>
                          </pre>
                        </div>
                      )}
                    </div>

                    {/* Architectural Trade-offs Section */}
                    <div className="space-y-3 pt-2">
                      <h4 className="text-xs font-mono font-bold tracking-wider text-amber-400 uppercase flex items-center">
                        <AlertCircle className="h-3.5 w-3.5 mr-1.5" /> Challenging Conventional Ideas: Architecture Trade-Offs
                      </h4>
                      <div className="space-y-3">
                        {pillar.tradeOffs.map((to, idx) => (
                          <div key={idx} className="bg-slate-950/80 p-4 rounded-xl border border-amber-900/30 space-y-2">
                            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                              <span className="text-xs font-bold font-mono text-slate-300">
                                DECISION: {to.decision}
                              </span>
                              <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                                SELECTED ARCHITECTURE
                              </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
                              <div className="flex items-start space-x-2 text-emerald-300 bg-emerald-950/20 p-2.5 rounded-lg border border-emerald-900/40">
                                <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                                <div>
                                  <strong className="block text-white">Chosen: {to.chosen}</strong>
                                </div>
                              </div>
                              <div className="flex items-start space-x-2 text-rose-300 bg-rose-950/20 p-2.5 rounded-lg border border-rose-900/40">
                                <XCircle className="h-4 w-4 text-rose-400 flex-shrink-0 mt-0.5" />
                                <div>
                                  <strong className="block text-white">Rejected: {to.rejected}</strong>
                                </div>
                              </div>
                            </div>
                            <p className="text-xs text-slate-400 pt-1 leading-relaxed italic border-l-2 border-amber-500/50 pl-3">
                              {to.reasoning}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
