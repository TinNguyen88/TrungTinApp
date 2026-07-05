import React from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle2, XCircle, Shield, HelpCircle, ArrowRight } from 'lucide-react';
import { THREAT_SCENARIOS } from '../data/architectureSpec';

export const ThreatModelView: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/30 border border-amber-900/40 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl mt-1 hidden sm:block">
            <ShieldAlert className="h-8 w-8 text-amber-400" />
          </div>
          <div className="space-y-2 max-w-4xl">
            <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full text-xs font-mono bg-amber-950/80 text-amber-300 border border-amber-800/60">
              <span>SECURITY ARCHITECT EVALUATION</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Adversary Threat Modeling & Architectural Challenges
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              When designing Vault, we must assume a high-capability adversary who understands security technology. Here we challenge common assumptions (such as calculator disguises or cloud synchronization) and demonstrate how Vault’s 10-second SLA and cryptographic separation defend against physical coercion and forensic seizure.
            </p>
          </div>
        </div>
      </div>

      {/* Challenging Common Ideas Cards */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-200 flex items-center space-x-2">
          <span>Challenging Conventional Vault Design Ideas</span>
          <span className="text-xs font-normal text-slate-400">(Why standard password managers and trick apps fail)</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center space-x-2 text-rose-400">
              <XCircle className="h-5 w-5 flex-shrink-0" />
              <h3 className="font-bold text-sm">Why NOT a "Fake Calculator"?</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Border security officers and street robbers routinely look for fake calculator apps. An app named "Calculator" that occupies 100MB of storage or requests network permissions is an immediate giveaway. Once spotted, the adversary demands the secret arithmetic code under threat of coercion.
            </p>
            <div className="pt-2 border-t border-slate-800 text-xs text-emerald-300 font-mono flex items-center">
              <CheckCircle2 className="h-4 w-4 mr-1.5 text-emerald-400" />
              Vault Solution: Legitimate Dual Organizer
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center space-x-2 text-rose-400">
              <XCircle className="h-5 w-5 flex-shrink-0" />
              <h3 className="font-bold text-sm">Why NOT Cloud Synchronization?</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Cloud synchronization introduces network telemetry, DNS lookups, authentication tokens, and server-side metadata. In a border crossing investigation, officers can subpoena cloud providers or inspect network logs to prove that additional encrypted blobs exist.
            </p>
            <div className="pt-2 border-t border-slate-800 text-xs text-emerald-300 font-mono flex items-center">
              <CheckCircle2 className="h-4 w-4 mr-1.5 text-emerald-400" />
              Vault Solution: Strict Local & Offline-First
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center space-x-2 text-rose-400">
              <XCircle className="h-5 w-5 flex-shrink-0" />
              <h3 className="font-bold text-sm">Why NOT an In-App Panic Button?</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              In a sudden handover scenario, you only have ~10 seconds. If your phone is locked or in another app, taking it out, finding the icon, opening the app, and tapping a small "panic" icon requires fine motor coordination that evaporates under adrenaline and panic.
            </p>
            <div className="pt-2 border-t border-slate-800 text-xs text-emerald-300 font-mono flex items-center">
              <CheckCircle2 className="h-4 w-4 mr-1.5 text-emerald-400" />
              Vault Solution: Hardware Action Button / Duress PIN
            </div>
          </div>
        </div>
      </div>

      {/* Formal Threat Scenarios */}
      <div className="space-y-4 pt-4">
        <h2 className="text-lg font-semibold text-slate-200">
          Formal Adversary Threat Modeling Scenarios
        </h2>

        <div className="space-y-6">
          {THREAT_SCENARIOS.map((scenario) => (
            <div key={scenario.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-slate-800 rounded-lg text-amber-400">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base sm:text-lg text-white">
                      {scenario.name}
                    </h3>
                    <p className="text-xs font-mono text-slate-400">
                      ADVERSARY: {scenario.adversaryProfile}
                    </p>
                  </div>
                </div>
                <div className="inline-flex items-center px-3 py-1 rounded-lg bg-amber-950/60 text-amber-300 border border-amber-800/60 text-xs font-mono self-start sm:self-auto">
                  <span>SLA WINDOW: {scenario.timeframe}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-1.5">
                  <span className="text-xs font-mono text-slate-500 font-bold block uppercase">
                    1. Attack Vector & Coercion
                  </span>
                  <p className="text-slate-300">{scenario.attackVector}</p>
                </div>

                <div className="bg-rose-950/20 p-4 rounded-xl border border-rose-900/30 space-y-1.5">
                  <span className="text-xs font-mono text-rose-400 font-bold block uppercase flex items-center">
                    <XCircle className="h-3.5 w-3.5 mr-1" /> Conventional Failure
                  </span>
                  <p className="text-rose-200/90">{scenario.conventionalFailure}</p>
                </div>

                <div className="bg-emerald-950/30 p-4 rounded-xl border border-emerald-800/50 space-y-1.5">
                  <span className="text-xs font-mono text-emerald-400 font-bold block uppercase flex items-center">
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Vault Architectural Defense
                  </span>
                  <p className="text-emerald-100">{scenario.vaultDefense}</p>
                </div>
              </div>

              <div className="flex items-center justify-between bg-slate-950/60 px-4 py-2.5 rounded-lg border border-slate-800 text-xs font-mono">
                <span className="text-slate-400">RESIDUAL RISK ASSESSMENT:</span>
                <span className="text-emerald-400 font-bold">{scenario.residualRisk}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
