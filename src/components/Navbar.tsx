import React from 'react';
import { Shield, Lock, Zap, Layout, ListChecks, Smartphone, AlertTriangle } from 'lucide-react';
import { TabType } from '../types';

interface NavbarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  module0Status: 'in-review' | 'completed';
  onApproveModule0: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  module0Status,
  onApproveModule0
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2 rounded-xl shadow-md shadow-emerald-500/20">
              <Shield className="h-6 w-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-white">VAULT</span>
                <span className="text-xs font-mono px-2 py-0.5 bg-slate-800 text-emerald-400 rounded-md border border-slate-700">
                  iOS Spec v1.0
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Senior iOS Engineer &bull; Security Architect &bull; Software Architect
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800/80">
            <button
              onClick={() => setActiveTab('architecture')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'architecture'
                  ? 'bg-slate-800 text-white shadow-sm border border-slate-700/60'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Layout className="h-4 w-4 text-emerald-400" />
              <span>Architecture Spec</span>
            </button>
            <button
              onClick={() => setActiveTab('threat-model')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'threat-model'
                  ? 'bg-slate-800 text-white shadow-sm border border-slate-700/60'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <span>Threat Model & Trade-offs</span>
            </button>
            <button
              onClick={() => setActiveTab('simulator')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'simulator'
                  ? 'bg-slate-800 text-white shadow-sm border border-slate-700/60'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Smartphone className="h-4 w-4 text-sky-400" />
              <span>10s Trigger Simulator</span>
            </button>
            <button
              onClick={() => setActiveTab('roadmap')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'roadmap'
                  ? 'bg-slate-800 text-white shadow-sm border border-slate-700/60'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <ListChecks className="h-4 w-4 text-indigo-400" />
              <span>Module Roadmap</span>
              {module0Status === 'in-review' && (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
              )}
            </button>
          </nav>

          {/* Module Action / Approval Status */}
          <div className="flex items-center space-x-3">
            {module0Status === 'in-review' ? (
              <button
                onClick={onApproveModule0}
                className="flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-3.5 py-1.5 rounded-lg font-medium text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition-all border border-emerald-500/30 cursor-pointer animate-pulse"
              >
                <Lock className="h-3.5 w-3.5" />
                <span>Approve Module 0 Architecture</span>
              </button>
            ) : (
              <div className="flex items-center space-x-2 bg-emerald-950/80 text-emerald-400 px-3 py-1.5 rounded-lg border border-emerald-800/60 text-xs font-mono">
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                <span>Module 0 Approved</span>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-800/80 text-xs overflow-x-auto">
          <button
            onClick={() => setActiveTab('architecture')}
            className={`flex items-center space-x-1 px-2 py-1 rounded ${activeTab === 'architecture' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400'}`}
          >
            <Layout className="h-3.5 w-3.5" />
            <span>Spec</span>
          </button>
          <button
            onClick={() => setActiveTab('threat-model')}
            className={`flex items-center space-x-1 px-2 py-1 rounded ${activeTab === 'threat-model' ? 'bg-slate-800 text-amber-400' : 'text-slate-400'}`}
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Threats</span>
          </button>
          <button
            onClick={() => setActiveTab('simulator')}
            className={`flex items-center space-x-1 px-2 py-1 rounded ${activeTab === 'simulator' ? 'bg-slate-800 text-sky-400' : 'text-slate-400'}`}
          >
            <Smartphone className="h-3.5 w-3.5" />
            <span>Simulator</span>
          </button>
          <button
            onClick={() => setActiveTab('roadmap')}
            className={`flex items-center space-x-1 px-2 py-1 rounded ${activeTab === 'roadmap' ? 'bg-slate-800 text-indigo-400' : 'text-slate-400'}`}
          >
            <ListChecks className="h-3.5 w-3.5" />
            <span>Roadmap</span>
          </button>
        </div>
      </div>
    </header>
  );
};
