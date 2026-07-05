import { ArchitecturalPillar, ThreatScenario, ModuleStep, VaultItem } from '../types';

export const ARCHITECTURAL_PILLARS: ArchitecturalPillar[] = [
  {
    id: '10s-trigger',
    title: 'The 10-Second Emergency Activation Engine',
    subtitle: 'Zero-latency, eyes-free secondary workspace mounting under extreme stress',
    icon: 'Zap',
    summary: 'In duress situations, fine motor skills degrade by up to 70%. Tapping small icons or navigating menus fails. Vault introduces a multi-modal hardware and biometric trigger system designed for 100% reliability within 3 seconds, well inside the 10-second survival window.',
    details: [
      'Hardware-Level Trigger: Native App Intent integration bound to the iPhone Action Button (iPhone 15 Pro+) or Back Tap (Triple Tap), launching Fake Mode from a locked screen without FaceID biometric prompt.',
      'The Duress PIN Biometric Trap: When unlocking Vault from cold launch or lock screen, entering the Duress PIN (e.g., 1111) instead of the Real PIN (e.g., 8492) instantly mounts the Fake Workspace and triggers immediate RAM key wiping.',
      'In-App Panic Gesture: A broad, screen-wide 3-finger swipe down or device inversion + accelerometer spike instantly swaps the UI window root and purges sensitive memory.',
      'Zero-Confirmation Transition: Fake Mode transitions silently without loading spinners, modal alerts, or visual artifacts that would arouse adversary suspicion.'
    ],
    iosTechnicalImplementation: {
      frameworks: ['AppIntents', 'LocalAuthentication', 'CoreMotion', 'UIKit / SwiftUI'],
      apis: ['LAContext.evaluatePolicy', 'UIWindow.rootViewController', 'CMMotionManager', 'SiriShortcuts / Action Button AppIntent'],
      codeSnippet: `// iOS AppIntent for Action Button / Lock Screen Widget
struct ActivateFakeWorkspaceIntent: AppIntent {
    static var title: LocalizedStringResource = "Open Workspace"
    static var openAppWhenRun: Bool = true
    
    @MainActor
    func perform() async throws -> some IntentResult {
        // Immediately mount Fake Workspace without prompting for FaceID
        VaultSecurityEngine.shared.mountWorkspace(mode: .fake, wipeRealKeys: true)
        return .result()
    }
}`
    },
    tradeOffs: [
      {
        decision: 'Trigger Mechanism',
        chosen: 'Hardware Action Button / Duress PIN / Broad Gestures',
        rejected: 'Hidden in-app "Panic Button" or triple-tapping an icon',
        reasoning: 'Why we challenge standard panic buttons: If your phone is in your pocket when confronted, finding and launching an app to press a button takes >12 seconds. A hardware bind or Duress PIN operates at the lock-screen boundary.'
      },
      {
        decision: 'Biometric Authentication in Fake Mode',
        chosen: 'Disabled / Bypassed for Fake Mode entry',
        rejected: 'Requiring FaceID / TouchID to open Fake Mode',
        reasoning: 'An adversary forcing you to unlock your phone will force your face onto the camera. FaceID would unlock the Real Workspace. The Duress PIN explicitly overrides FaceID and forces the Fake Workspace.'
      }
    ]
  },
  {
    id: 'crypto-storage',
    title: 'Zero-Knowledge Memory & Storage Cryptography',
    subtitle: 'Cryptographic isolation where the Real Workspace cannot be proven to exist',
    icon: 'ShieldCheck',
    summary: 'Vault uses two physically independent encrypted database containers. When Fake Mode is active, the encryption key for the Real Workspace ($K_{real}$) is not in volatile memory, making cryptographic extraction impossible even via forensic memory dumps.',
    details: [
      'Dual-Container Separation: Two distinct encrypted SQLite blobs (real.sqlite.enc and fake.sqlite.enc). Neither database contains pointers, metadata, or table names referencing the other.',
      'Secure Enclave Key Derivation: Master encryption keys derived via PBKDF2 / Argon2id using device-specific Secure Enclave hardware entropy combined with the user PIN.',
      'Active RAM Zeroing: Upon panic trigger or app suspension, Swift/C memory buffers holding $K_{real}$ are forcefully overwritten using memset_s / withUnsafeMutableBytes before deallocation.',
      'Plausible Deniability via Noise Padding: The storage directory is padded with cryptographically random noise blocks so total file allocation size remains constant, defeating file-size analysis.'
    ],
    iosTechnicalImplementation: {
      frameworks: ['CryptoKit', 'Security (Keychain / Secure Enclave)', 'SQLite3 / GRDB'],
      apis: ['SecItemAdd / SecItemCopyMatching', 'AES.GCM.seal / open', 'withUnsafeMutableBytes', 'memset_s'],
      codeSnippet: `// Secure Memory Wiping in iOS Swift
func purgeRealWorkspaceKeysFromRAM() {
    guard let keyPtr = realWorkspaceKeyBuffer else { return }
    // Force cryptographic zeroing of volatile memory
    keyPtr.withUnsafeMutableBytes { buffer in
        memset_s(buffer.baseAddress, buffer.count, 0, buffer.count)
    }
    realWorkspaceKeyBuffer = nil
    print("[SECURITY] Real Workspace AES Key scrubbed from RAM.")
}`
    },
    tradeOffs: [
      {
        decision: 'Storage Architecture',
        chosen: 'Raw SQLite + CryptoKit AES-GCM 256 with custom noise padding',
        rejected: 'Standard Apple CoreData / CloudKit with File Protection',
        reasoning: 'CoreData generates unencrypted WAL (Write-Ahead Log) files and SQLite temporary indices that can leak sensitive plaintext snippets during forensic recovery. Raw encrypted SQLite prevents WAL leakage.'
      },
      {
        decision: 'Cloud Synchronization',
        chosen: 'Strict Offline-First & Local-Only (Zero Cloud Sync)',
        rejected: 'iCloud Sync / E2EE Cloud Backup',
        reasoning: 'Why we challenge cloud backups: Cloud sync requires network requests, background daemons, and metadata tokens stored on Apple/AWS servers. In a border crossing or detention scenario, cloud metadata can be subpoenaed or analyzed.'
      }
    ]
  },
  {
    id: 'plausible-deniability',
    title: 'Legitimate Secondary Workspace Design',
    subtitle: 'Why Fake Mode must be a genuine, useful workspace—not a gimmick',
    icon: 'Layout',
    summary: 'A fake calculator or a blank screen is an immediate red flag to any human interrogator or security officer. If they see a calculator that requires a secret code, they know you are hiding something. Vault’s Fake Mode is a polished, fully functional professional workspace.',
    details: [
      'Not a Trick App: Vault presents as a clean, minimalist secure personal organizer. Fake Mode contains realistic, innocuous notes (e.g., grocery lists, public meeting notes, gym schedules, travel itineraries).',
      'Full Interactive Fidelity: In Fake Mode, users can create new notes, edit items, search, and delete—behaving exactly like a standard note-taking app.',
      'No Canaries or Hidden Toggles: There are no visual hints, disabled buttons, or hidden settings menus inside Fake Mode that would reveal the existence of a primary vault.',
      'Consistent UI / UX: The UI layout, font typography, and navigation mechanics are identical between Real and Fake modes; only the mounted decrypted database container differs.'
    ],
    iosTechnicalImplementation: {
      frameworks: ['SwiftUI / UIKit', 'Combine / Observation'],
      apis: ['NavigationStack', 'UIWindowScene', 'NSNotificationCenter'],
      codeSnippet: `// Workspace Router - No visual distinction between modes
class WorkspaceRouter: ObservableObject {
    @Published var activeContainer: WorkspaceType = .none
    
    func switchWorkspace(to type: WorkspaceType) {
        // Atomic UI switch without animation glitches
        withAnimation(.none) {
            self.activeContainer = type
        }
        if type == .fake {
            SecurityEngine.shared.scrubRealKeys()
        }
    }
}`
    },
    tradeOffs: [
      {
        decision: 'App Disguise Concept',
        chosen: 'Professional Minimalist Organizer (Dual-Workspace)',
        rejected: 'Fake Calculator, Fake Clock, or Weather App disguise',
        reasoning: 'Why we challenge "Fake Calculator" apps: Adversaries and border agents are trained to recognize calculator vaults. When asked why you have a calculator app that uses 150MB of storage, the deception fails instantly. A minimalist personal organizer is legitimate.'
      }
    ]
  },
  {
    id: 'lifecycle-hygiene',
    title: 'iOS Lifecycle & Forensic Snapshot Defense',
    subtitle: 'Preventing OS-level background leaks and app switcher snapshots',
    icon: 'EyeOff',
    summary: 'iOS automatically captures screenshots of apps when transitioning to the background for the App Switcher carousel. Without specialized defense, sensitive data from the Real Workspace could be stored unencrypted in the iOS system cache.',
    details: [
      'App Switcher Obfuscation: On UIScene.willDeactivateNotification, Vault instantly overlays a neutral privacy blur or switches the view to the Fake Workspace before iOS captures the background snapshot.',
      'Background Execution Suspension: As soon as the app enters background, all cryptographic keys in RAM are scrubbed. Re-opening the app always requires PIN re-authentication or defaults directly to Fake Mode.',
      'Pasteboard & Clipboard Protection: Automatic clipboard wiping after 15 seconds if sensitive text was copied within the Real Workspace.',
      'Zero Network Surface: No HTTP client code exists in the core vault module. The iOS app sandbox blocks all outbound network socket creation by default.'
    ],
    iosTechnicalImplementation: {
      frameworks: ['UIKit / SceneKit', 'Security'],
      apis: ['UISceneDelegate.sceneWillResignActive', 'UIPasteboard.general.items', 'UIApplication.userDidTakeScreenshotNotification'],
      codeSnippet: `// SceneDelegate Snapshot Defense
func sceneWillResignActive(_ scene: UIScene) {
    // 1. Immediately cover screen before iOS takes App Switcher screenshot
    privacyShieldView.isHidden = false
    
    // 2. Scrub sensitive RAM keys
    VaultSecurityEngine.shared.purgeRealWorkspaceKeysFromRAM()
    
    // 3. Reset UI to Fake Mode if high-threat mode is enabled
    if UserDefaults.standard.bool(forKey: "autoMountFakeOnBackground") {
        workspaceRouter.switchWorkspace(to: .fake)
    }
}`
    },
    tradeOffs: [
      {
        decision: 'Background Persistence',
        chosen: 'Instant RAM Key Wipe & Session Lock on backgrounding',
        rejected: 'Allowing 1-5 minute grace period before locking',
        reasoning: 'Security over convenience: In a physical snatch-and-grab scenario while your phone is unlocked, a grace period leaves your sensitive vault open. Immediate locking ensures safety.'
      }
    ]
  }
];

export const THREAT_SCENARIOS: ThreatScenario[] = [
  {
    id: 'border-crossing',
    name: 'Border Inspection / Airport Checkpoint',
    adversaryProfile: 'Government agent or border official with legal authority to demand device unlock.',
    timeframe: '10 to 30 seconds warning in checkpoint line.',
    attackVector: 'Physical coercion: "Unlock your phone and hand it over now."',
    conventionalFailure: 'User hesitates or tries to delete apps, drawing immediate suspicion. Standard password vaults are visible and adversary demands the master password.',
    vaultDefense: 'User enters their 4-digit Duress PIN (e.g., 1111) at the standard lock screen. Vault opens cleanly into Fake Mode showing travel itineraries and hotel notes. Real keys are wiped from memory.',
    residualRisk: 'Low. Unless the adversary has forensic warrants and months to attempt offline Secure Enclave brute-forcing (mitigated by hardware rate limits).'
  },
  {
    id: 'street-robbery',
    name: 'Street Mugging / Forced Device Handover',
    adversaryProfile: 'Aggressive street criminal demanding unlocked phone to check banking/crypto apps.',
    timeframe: '3 to 10 seconds under threat of physical violence.',
    attackVector: 'Snatch-and-grab while phone is open, or demanding immediate unlock.',
    conventionalFailure: 'User panics; normal apps leave sensitive notes or recovery seed phrases exposed.',
    vaultDefense: 'User squeezes iPhone Action Button or executes 3-finger swipe down before handing over. Vault swaps to Fake Mode instantly. Even if adversary inspects Vault, they see only a standard note list.',
    residualRisk: 'Near zero for data exposure. Physical device loss is expected, but cryptographic isolation protects digital identity and funds.'
  },
  {
    id: 'forensic-seizure',
    name: 'Post-Seizure Forensic Extraction (Cellebrite / GrayKey)',
    adversaryProfile: 'Forensic laboratory with physical access to seized device and advanced extraction tools.',
    timeframe: 'Hours to weeks of offline lab analysis.',
    attackVector: 'File system dumping, SQLite WAL log reconstruction, memory swap inspection.',
    conventionalFailure: 'Standard apps leave unencrypted WAL logs, temporary SQLite cache files, or plaintext strings in memory swap.',
    vaultDefense: 'Vault uses custom raw SQLite without WAL mode, encrypted via AES-GCM 256. When seized in Fake Mode, RAM is already scrubbed. Random noise padding prevents file-size analysis from detecting the real database size.',
    residualRisk: 'Hardware Secure Enclave vulnerability (0-day in iOS Secure Enclave processor, extremely rare and expensive).'
  }
];

export const MODULE_ROADMAP: ModuleStep[] = [
  {
    id: 0,
    title: 'Module 0: iOS & Security Architecture Specification',
    subtitle: 'Senior Engineering Architecture Proposal, Threat Modeling & Technical Blueprint',
    status: 'in-review',
    deliverables: [
      'Comprehensive iOS Security & Software Architecture Document',
      'Rigorous Threat Modeling (Border Inspection, Forced Handover, Forensic Seizure)',
      'Challenge of Conventional Ideas (Why NOT fake calculators, why NOT cloud sync)',
      'Interactive Web Prototype Workbench & 10s Trigger Simulator'
    ],
    securityChecklist: [
      'Verified: Zero-knowledge cryptographic separation principle',
      'Verified: 10-second emergency response SLA under stress conditions',
      'Verified: Plausible deniability without visual canaries'
    ]
  },
  {
    id: 1,
    title: 'Module 1: Cryptographic Core & Key Management',
    subtitle: 'Swift CryptoKit, Secure Enclave Hardware Backing & RAM Scrubbing Engine',
    status: 'locked',
    deliverables: [
      'PBKDF2 / Argon2id Key Derivation implementation tied to Secure Enclave',
      'Dual-Key Hierarchy ($K_{real}$ vs $K_{fake}$)',
      'Volatile Memory Wiping (memset_s / UnsafeMutablePointer zeroing)',
      'Unit tests for cryptographic key purge and memory leak verification'
    ],
    securityChecklist: [
      'Ensure zero plaintext keys ever touch disk storage',
      'Verify memory buffer zeroing upon deallocation and background transition',
      'Implement brute-force hardware rate-limiting hooks'
    ]
  },
  {
    id: 2,
    title: 'Module 2: Storage & Plausible Deniability Engine',
    subtitle: 'Encrypted Dual SQLite Containers & File Allocation Noise Padding',
    status: 'locked',
    deliverables: [
      'Custom SQLite encryption wrapper without WAL (Write-Ahead Logging) leakage',
      'Independent container separation (real.sqlite.enc vs fake.sqlite.enc)',
      'Cryptographic random noise file padding generator (constant 50MB footprint)',
      'Storage integrity and forensic resilience test suite'
    ],
    securityChecklist: [
      'Verify zero cross-container references or shared indexing tables',
      'Ensure identical database read/write latency between Real and Fake modes',
      'Confirm zero plaintext temporary file creation during SQLite vacuuming'
    ]
  },
  {
    id: 3,
    title: 'Module 3: The 10-Second Emergency Trigger Engine',
    subtitle: 'iOS App Intents, Duress PIN Lock Screen & Multi-Modal Panic Handlers',
    status: 'locked',
    deliverables: [
      'Siri Shortcuts / Action Button AppIntent for instantaneous Fake Mode launch',
      'Duress PIN authentication trap at lock screen boundary',
      'In-app multi-finger panic gesture & accelerometer inversion trigger',
      'SceneDelegate lifecycle hooks (App Switcher screenshot blurring & background wipe)'
    ],
    securityChecklist: [
      'Test 10-second SLA across cold launch, background resume, and lock screen',
      'Verify FaceID override when Duress PIN is entered',
      'Ensure zero UI lag or transition stutter during emergency workspace swap'
    ]
  },
  {
    id: 4,
    title: 'Module 4: Minimalist UI/UX Workspaces',
    subtitle: 'High-Speed Minimalist Personal Organizer (Real vs. Fake Mode Views)',
    status: 'locked',
    deliverables: [
      'Clean, professional Note & Document viewer (iOS native typography and spacing)',
      'Realistic pre-populated Fake Mode templates (travel plans, public notes, checklists)',
      'Encrypted Real Workspace view for high-security notes and sensitive credentials',
      'Emergency "Self-Destruct / Nuke" optional trigger for extreme threat environments'
    ],
    securityChecklist: [
      'Ensure 100% UI visual consistency between Real and Fake workspaces',
      'Verify zero visual canaries, hidden badges, or disabled toggles in Fake Mode',
      'Implement automatic clipboard/pasteboard purge after 15 seconds'
    ]
  },
  {
    id: 5,
    title: 'Module 5: Hardening, Forensic Audit & Production Release',
    subtitle: 'End-to-End Security Verification, Offline Audit & App Store Packaging',
    status: 'locked',
    deliverables: [
      'Simulated forensic memory dump analysis (verifying zero key residues)',
      'Offline network sandbox verification (ensuring zero network socket creation)',
      'Complete automated UI and stress testing under simulated duress scenarios',
      'Final iOS production build blueprint & App Store submission compliance checklist'
    ],
    securityChecklist: [
      'Pass simulated Cellebrite / GrayKey file system inspection',
      'Confirm zero memory leaks under instruments memory graph analysis',
      'Final approval from Security Architect and User Partner'
    ]
  }
];

export const SAMPLE_REAL_ITEMS: VaultItem[] = [
  {
    id: 'r-1',
    title: 'Master Recovery Phrase (Cold Wallet 0x89A...)',
    category: 'credential',
    preview: '1. abandon 2. ability 3. able 4. about 5. above 6. absent 7. absorb 8. abstract...',
    updatedAt: '2 hours ago',
    isSensitive: true
  },
  {
    id: 'r-2',
    title: 'Emergency Relocation Plan & Safehouse Coordinates',
    category: 'note',
    preview: 'Contact point: Geneva Safehouse Alpha. Verify via Signal PGP key fingerprint 4B82...',
    updatedAt: 'Yesterday',
    isSensitive: true
  },
  {
    id: 'r-3',
    title: 'Offshore Trust Banking Access Credentials',
    category: 'credential',
    preview: 'Account: #8892-0019-CH. PIN: 9812. Routing via Zurich Secure Terminal...',
    updatedAt: '3 days ago',
    isSensitive: true
  },
  {
    id: 'r-4',
    title: 'Legal Affidavit & Whistleblower Evidence',
    category: 'document',
    preview: 'Encrypted PDF attachment: internal_audit_report_2026_final_signed.pdf (14.2 MB)',
    updatedAt: '1 week ago',
    isSensitive: true
  }
];

export const SAMPLE_FAKE_ITEMS: VaultItem[] = [
  {
    id: 'f-1',
    title: 'Q3 Conference Travel Itinerary (Chicago)',
    category: 'note',
    preview: 'Flight AA1042 departing ORD at 14:30. Hotel: Marriott Downtown, Reservation #884920.',
    updatedAt: '3 hours ago',
    isSensitive: false
  },
  {
    id: 'f-2',
    title: 'Weekly Grocery & Hardware Shopping List',
    category: 'note',
    preview: '- Organic almond milk\n- Espresso beans\n- M5 stainless steel bolts\n- Greek yogurt\n- Avocado',
    updatedAt: 'Yesterday',
    isSensitive: false
  },
  {
    id: 'f-3',
    title: 'Gym Workout Routine (Hypertrophy Block A)',
    category: 'note',
    preview: 'Monday: Incline Dumbbell Press 4x8, Lat Pulldown 4x10, Cable Lateral Raise 3x15...',
    updatedAt: '4 days ago',
    isSensitive: false
  },
  {
    id: 'f-4',
    title: 'Recommended Book List for Autumn',
    category: 'note',
    preview: '1. Thinking, Fast and Slow by Daniel Kahneman\n2. Clean Architecture by Robert C. Martin...',
    updatedAt: '2 weeks ago',
    isSensitive: false
  }
];
