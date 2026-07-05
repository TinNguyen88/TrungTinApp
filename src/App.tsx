/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { ArchitectureSpecView } from './components/ArchitectureSpecView';
import { ThreatModelView } from './components/ThreatModelView';
import { TriggerSimulatorView } from './components/TriggerSimulatorView';
import { ModuleRoadmapView } from './components/ModuleRoadmapView';
import { Module1DeliveryView } from './components/Module1DeliveryView';
import { TabType } from './types';
import { CheckCircle2, Shield, X, ArrowRight, Lock } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('module1-delivery');
  const [module0Status, setModule0Status] = useState<'in-review' | 'completed'>('completed');
  const [module1Status, setModule1Status] = useState<'in-review' | 'completed'>('in-review');
  const [showApprovalModal, setShowApprovalModal] = useState<boolean>(false);
  const [showModule1Modal, setShowModule1Modal] = useState<boolean>(false);

  const handleApproveModule0 = () => {
    setModule0Status('completed');
    setShowApprovalModal(true);
  };

  const handleApproveModule1 = () => {
    setModule1Status('completed');
    setShowModule1Modal(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        module0Status={module0Status}
        onApproveModule0={handleApproveModule0}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {activeTab === 'module1-delivery' && (
          <Module1DeliveryView
            onApproveModule1={handleApproveModule1}
            isApproved={module1Status === 'completed'}
          />
        )}
        {activeTab === 'architecture' && <ArchitectureSpecView />}
        {activeTab === 'threat-model' && <ThreatModelView />}
        {activeTab === 'simulator' && <TriggerSimulatorView />}
        {activeTab === 'roadmap' && (
          <ModuleRoadmapView
            module0Status={module0Status}
            onApproveModule0={handleApproveModule0}
            module1Status={module1Status}
          />
        )}
      </main>

      {/* Approval Acknowledgement Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-emerald-500/60 rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative text-left space-y-4">
            <button
              onClick={() => setShowApprovalModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center space-x-3 text-emerald-400">
              <div className="p-2.5 bg-emerald-950 rounded-xl border border-emerald-800">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div>
                <span className="text-xs font-mono uppercase tracking-wider block text-emerald-300">GOVERNANCE CHECKPOINT</span>
                <h3 className="text-xl font-bold text-white">Module 0 Approved!</h3>
              </div>
            </div>

            <p className="text-slate-300 text-sm leading-relaxed">
              As your Senior iOS Engineer and Security Architect, I acknowledge your approval of the <strong className="text-white">Module 0 Architecture & Security Blueprint</strong>.
            </p>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs font-mono text-slate-300">
              <div className="flex items-center justify-between text-emerald-400 font-bold">
                <span>NEXT STEP IN ROADMAP:</span>
                <span>MODULE 1</span>
              </div>
              <p className="text-slate-400">
                &bull; Module 1: Cryptographic Core & Key Management
                <br />&bull; PBKDF2 / Argon2id + Secure Enclave Entropy
                <br />&bull; Swift volatile memory zeroing (<code className="text-sky-300">memset_s</code>)
              </p>
            </div>

            <p className="text-xs text-amber-300 bg-amber-950/40 p-3 rounded-lg border border-amber-900/50">
              Per your directive: <em className="text-amber-200">"Stop after each completed module and wait for my approval before continuing."</em> We have paused development at Module 0. When you are ready, instruct me in the chat to begin implementing Module 1.
            </p>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => {
                  setShowApprovalModal(false);
                  setActiveTab('roadmap');
                }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-600/20 flex items-center space-x-2"
              >
                <span>View Roadmap Status</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Module 1 Approval Acknowledgement Modal */}
      {showModule1Modal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-emerald-500/60 rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative text-left space-y-4">
            <button
              onClick={() => setShowModule1Modal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center space-x-3 text-emerald-400">
              <div className="p-2.5 bg-emerald-950 rounded-xl border border-emerald-800">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div>
                <span className="text-xs font-mono uppercase tracking-wider block text-emerald-300">GOVERNANCE CHECKPOINT</span>
                <h3 className="text-xl font-bold text-white">Module 1 Officially Approved!</h3>
              </div>
            </div>

            <p className="text-slate-300 text-sm leading-relaxed">
              As your Senior iOS Engineer and Security Architect, I acknowledge your approval of <strong className="text-white">Module 1: Cryptographic Core & Key Management</strong>.
            </p>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs font-mono text-slate-300">
              <div className="flex items-center justify-between text-emerald-400 font-bold">
                <span>NEXT STEP IN ROADMAP:</span>
                <span>MODULE 2 UNLOCKED</span>
              </div>
              <p className="text-slate-400">
                &bull; Module 2: Storage Engine & SQLite SQLCipher
                <br />&bull; Hardware-bound encrypted database files
                <br />&bull; Physical isolation of Real vs Fake schema containers
              </p>
            </div>

            <p className="text-xs text-amber-300 bg-amber-950/40 p-3 rounded-lg border border-amber-900/50">
              Per your directive: <em className="text-amber-200">"Stop after each completed module and wait for my approval before continuing."</em> We have paused development at Module 1. When you are ready, instruct me in the chat to begin implementing Module 2.
            </p>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => {
                  setShowModule1Modal(false);
                  setActiveTab('roadmap');
                }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-600/20 flex items-center space-x-2"
              >
                <span>View Roadmap Status</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 text-slate-500 py-6 text-center text-xs font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>VAULT &bull; iOS Security & Dual-Workspace Architecture Spec v1.0</span>
          <span>Strict Local & Offline-First &bull; Zero Knowledge Separation</span>
        </div>
      </footer>
    </div>
  );
}
