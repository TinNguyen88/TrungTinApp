export type TabType = 'architecture' | 'threat-model' | 'simulator' | 'roadmap' | 'module1-delivery';

export interface SwiftSourceFile {
  path: string;
  filename: string;
  category: 'App' | 'Security' | 'Models' | 'Tests' | 'Manifest';
  linesOfCode: number;
  description: string;
  code: string;
}

export interface ArchitecturalPillar {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  summary: string;
  details: string[];
  iosTechnicalImplementation: {
    frameworks: string[];
    apis: string[];
    codeSnippet?: string;
  };
  tradeOffs: {
    decision: string;
    chosen: string;
    rejected: string;
    reasoning: string;
  }[];
}

export interface ThreatScenario {
  id: string;
  name: string;
  adversaryProfile: string;
  timeframe: string;
  attackVector: string;
  conventionalFailure: string;
  vaultDefense: string;
  residualRisk: string;
}

export interface ModuleStep {
  id: number;
  title: string;
  subtitle: string;
  status: 'completed' | 'in-review' | 'pending' | 'locked';
  deliverables: string[];
  securityChecklist: string[];
}

export type SimulatorState = 'locked' | 'unlocking' | 'real-workspace' | 'fake-workspace' | 'panic-triggered';

export interface MemoryState {
  realKeyInMemory: boolean;
  fakeKeyInMemory: boolean;
  activeContainer: 'none' | 'real.sqlite.enc' | 'fake.sqlite.enc';
  memoryWipeStatus: 'intact' | 'zeroing' | 'wiped';
  lastAction: string;
}

export interface VaultItem {
  id: string;
  title: string;
  category: 'note' | 'credential' | 'contact' | 'document';
  preview: string;
  updatedAt: string;
  isSensitive: boolean;
}
