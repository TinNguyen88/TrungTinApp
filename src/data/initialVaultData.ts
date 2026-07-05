import { VaultItem, VaultSettings } from '../types';

export const INITIAL_REAL_ITEMS: VaultItem[] = [
  {
    id: 'r-1',
    title: 'Master Recovery Phrase (Cold Wallet 0x89A...)',
    category: 'credential',
    username: 'wallet-cold-master',
    password: 'abandon ability able about above absent absorb abstract academy accent accept access',
    url: 'https://ledger.com/recovery',
    content: 'CRITICAL: 24-word BIP39 seed phrase for primary hardware vault. Do not store online or take photos.',
    preview: '1. abandon 2. ability 3. able 4. about 5. above...',
    updatedAt: '2 hours ago',
    isSensitive: true,
    favorite: true
  },
  {
    id: 'r-2',
    title: 'Offshore Trust Banking Access Credentials',
    category: 'credential',
    username: 'ch-trust-client-8892',
    password: 'P9#mK$290vL!xQ81z_SECURE_CH',
    url: 'https://secure.zurich-private-banking.ch/auth',
    content: 'Account: #8892-0019-CH. PIN: 9812. Routing via Zurich Secure Terminal. 2FA key stored on hardware YubiKey 5C.',
    preview: 'Account: #8892-0019-CH. PIN: 9812. Routing via Zurich...',
    updatedAt: 'Yesterday',
    isSensitive: true,
    favorite: true
  },
  {
    id: 'r-3',
    title: 'Emergency Relocation Plan & Safehouse Coordinates',
    category: 'note',
    content: 'Contact point: Geneva Safehouse Alpha.\nCoordinates: 46.2044° N, 6.1432° E.\nVerify via Signal PGP key fingerprint: 4B82 910A C391 002B.\nCode phrase: "The autumn leaves fall early in Zurich."',
    preview: 'Contact point: Geneva Safehouse Alpha. Verify via Signal PGP...',
    updatedAt: '3 days ago',
    isSensitive: true
  },
  {
    id: 'r-4',
    title: 'Whistleblower Affidavit & Internal Evidence',
    category: 'document',
    content: 'Encrypted PDF attachment: internal_audit_report_2026_final_signed.pdf (14.2 MB).\nContains timestamped emails and financial transfer receipts.',
    preview: 'Encrypted PDF attachment: internal_audit_report_2026...',
    updatedAt: '1 week ago',
    isSensitive: true
  },
  {
    id: 'r-5',
    title: 'Attorney General Emergency Legal Contact',
    category: 'contact',
    content: 'Name: Dr. Marcus Vance, Esq.\nPhone: +41 22 819 00 11\nEncrypted SIP: vance.legal@proton.me\nInstructions: In case of detention, invoke Article 14 immediately.',
    preview: 'Name: Dr. Marcus Vance, Esq. Phone: +41 22 819 00 11...',
    updatedAt: '2 weeks ago',
    isSensitive: true
  }
];

export const INITIAL_FAKE_ITEMS: VaultItem[] = [
  {
    id: 'f-1',
    title: 'Q3 Conference Travel Itinerary (Chicago)',
    category: 'note',
    content: 'Flight AA1042 departing ORD at 14:30.\nHotel: Marriott Downtown, Reservation #884920.\nCheck-in: 3:00 PM. Check-out: 11:00 AM.\nDinner meeting at Gibson\'s Bar & Steakhouse on Tuesday at 7:30 PM.',
    preview: 'Flight AA1042 departing ORD at 14:30. Hotel: Marriott Downtown...',
    updatedAt: '3 hours ago',
    isSensitive: false,
    favorite: true
  },
  {
    id: 'f-2',
    title: 'Weekly Grocery & Hardware Shopping List',
    category: 'note',
    content: '- Organic almond milk\n- Espresso beans (dark roast)\n- M5 stainless steel bolts & washers\n- Greek yogurt\n- Ripe avocados\n- Sourdough bread\n- Extra virgin olive oil',
    preview: '- Organic almond milk\n- Espresso beans\n- M5 stainless steel bolts...',
    updatedAt: 'Yesterday',
    isSensitive: false
  },
  {
    id: 'f-3',
    title: 'Gym Workout Routine (Hypertrophy Block A)',
    category: 'note',
    content: 'Monday (Push):\n- Incline Dumbbell Press 4x8\n- Overhead Shoulder Press 3x10\n- Cable Lateral Raise 3x15\n- Tricep Rope Pushdowns 4x12\n\nWednesday (Pull):\n- Lat Pulldown 4x10\n- Seated Cable Row 3x12\n- Face Pulls 3x15\n- Incline Dumbbell Curl 3x10',
    preview: 'Monday: Incline Dumbbell Press 4x8, Overhead Shoulder Press...',
    updatedAt: '4 days ago',
    isSensitive: false,
    favorite: true
  },
  {
    id: 'f-4',
    title: 'Netflix & Spotify Family Account',
    category: 'credential',
    username: 'alex.taylor.family@gmail.com',
    password: 'WelcomeHome2026!',
    url: 'https://netflix.com',
    content: 'Shared family subscription for living room and mobile devices.',
    preview: 'Shared family subscription for living room and mobile devices...',
    updatedAt: '1 week ago',
    isSensitive: false
  },
  {
    id: 'f-5',
    title: 'Recommended Autumn Book List',
    category: 'note',
    content: '1. Thinking, Fast and Slow by Daniel Kahneman\n2. Clean Architecture by Robert C. Martin\n3. The Pragmatic Programmer by Andrew Hunt\n4. Project Hail Mary by Andy Weir',
    preview: '1. Thinking, Fast and Slow by Daniel Kahneman\n2. Clean Architecture...',
    updatedAt: '2 weeks ago',
    isSensitive: false
  }
];

export const DEFAULT_SETTINGS: VaultSettings = {
  realPin: '8492',
  duressPin: '1111',
  enableFaceId: true,
  emergencyMode: 'countdown-10s',
  autoLockTimeoutMinutes: 5,
  enablePanicSwipe: true,
  stealthTitle: 'Daily Notes'
};
