import React, { useState } from 'react';
import { X, Code2, FolderTree, Cpu, Database, CheckCircle2, ShieldCheck, Copy, Check } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export const ArchitectureModal: React.FC<Props> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'tree' | 'gemini' | 'state' | 'overview'>('overview');
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const directoryTree = `rxguard-app/
├── server.ts                       # Express full-stack proxy & Gemini 3.8 Flash endpoint
├── src/
│   ├── types/
│   │   └── index.ts                # Strict TypeScript contracts (Medicine, Contraindication, Timeline)
│   ├── services/
│   │   ├── storageService.ts       # Offline-first SQLite/LocalStorage engine & auto-decrement
│   │   ├── ttsService.ts           # Senior-friendly Text-To-Speech (Web Speech API)
│   │   ├── notificationService.ts  # Browser Web Notifications & Web Audio API synthesizers
│   │   └── calendarService.ts      # iCalendar (.ics) export for 48h/24h doctor appointments
│   ├── utils/
│   │   └── whatsapp.ts             # 1-click WhatsApp Quick Refill & Caregiver SOS generators
│   ├── data/
│   │   └── mockPrescriptions.ts    # Bulletproof fallback scenarios (Sinusitis, Cardiology, Pediatric)
│   ├── components/
│   │   ├── Header.tsx              # Senior mode toggle, SOS trigger & Mobile/Full frame switch
│   │   ├── DailyTimeline.tsx       # 4-slot interactive schedule with real-time stock decrement
│   │   ├── PrescriptionScanner.tsx # Camera/Gallery OCR picker with Gemini Vision analysis
│   │   ├── ContraindicationBanner.tsx # High-visibility drug-drug safety warning banner
│   │   ├── LowStockCard.tsx        # ≤2 days supply alert & WhatsApp Quick Refill
│   │   ├── DoctorAppointmentCard.tsx # Doctor follow-up tracker & 48h/24h prior alarms
│   │   ├── InventoryModal.tsx      # Pharmacy onboarding: confirmed purchased stock
│   │   ├── InventoryManager.tsx    # Medicine cabinet with manual increment/decrement
│   │   ├── CaregiverSOSModal.tsx   # Senior citizen Emergency Caretaker SOS module
│   │   └── MobileFrame.tsx         # Sleek simulated mobile viewport with status bar
│   ├── App.tsx                     # Master state controller & router
│   ├── main.tsx
│   └── index.css
├── package.json
└── vite.config.ts`;

  const geminiPromptSnippet = `// Multimodal Prompt for Gemini 3.8 Flash
const prompt = \`You are RxGuard, an elite clinical pharmacologist and AI prescription analyzer.
Carefully inspect this prescription note or medicine bottle label.
Extract with maximum medical fidelity:
1. Prescribing doctor's name, clinic/hospital, prescription date, and follow-up appointment date.
2. Patient name and provisional diagnosis.
3. Prescribed medicines list:
   - name, dosage (e.g. 500mg), form (tablet/capsule/syrup/inhaler)
   - timing (morning, afternoon, evening, night)
   - foodRelation (before_meal, after_meal, with_meal, anytime)
   - durationDays, instructions, clinical purpose
4. Contraindications & Drug-Drug Interactions:
   Conduct a strict clinical safety analysis on all identified drugs.
   Flag potential drug-drug interactions (e.g. NSAID + Lisinopril/Aspirin).
   Classify severity as "High", "Moderate", or "Low" with clinical mitigation advice.

Return strictly structured JSON adhering to the provided Type schema.\`;

const response = await ai.models.generateContent({
  model: 'gemini-3.8-flash',
  contents: {
    parts: [
      { inlineData: { mimeType: 'image/jpeg', data: base64Data } },
      { text: prompt }
    ]
  },
  config: {
    responseMimeType: 'application/json',
    responseSchema: { ... }
  }
});`;

  const stateLogicSnippet = `// Real-Time Inventory Decrement & Low-Stock Logic:

// 1. Decrement inventory on dose checkoff
decrementStock(medicineId: string, amount = 1): Medicine | null {
  const target = list.find((m) => m.id === medicineId);
  if (!target) return null;
  target.remainingStock = Math.max(0, target.remainingStock - amount);
  storageService.saveMedicines(list);
  return target;
}

// 2. Low-Stock Alert Computation (Threshold: <= 2 Days Supply)
getLowStockMedicines() {
  return list.map((med) => {
    const dailyRequirement = Math.max(1, med.dosesPerDay || med.timing.length);
    const daysLeft = Math.floor(med.remainingStock / dailyRequirement);
    const threshold = med.expiryWarningDays || 2;
    return {
      medicine: med,
      daysLeft,
      isLow: daysLeft <= threshold,
      isCritical: daysLeft <= 1 || med.remainingStock <= 1
    };
  }).filter((item) => item.isLow);
}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8 animate-fadeIn flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-start justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <Code2 className="w-5 h-5 text-indigo-400" />
              <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-300">
                Hackathon Architecture Blueprint
              </span>
            </div>
            <h2 className="text-xl font-black mt-1">RxGuard System Architecture &amp; Tech Stack</h2>
            <p className="text-xs text-indigo-200 mt-0.5">
              Production-ready mobile web architecture with offline-first storage and Gemini 3.8 Flash Vision
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 p-2 bg-slate-100 border-b border-slate-200 shrink-0 text-xs font-bold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'overview' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Overview &amp; Deliverables
          </button>
          <button
            onClick={() => setActiveTab('tree')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'tree' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Directory Tree
          </button>
          <button
            onClick={() => setActiveTab('gemini')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'gemini' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Gemini Flash Prompt &amp; Schema
          </button>
          <button
            onClick={() => setActiveTab('state')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'state' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Inventory State &amp; Thresholds
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {activeTab === 'overview' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-indigo-950">
                    <Cpu className="w-4 h-4 text-indigo-600" />
                    <span>AI Vision &amp; Clinical Safety</span>
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    Uses Google Gemini 3.8 Flash multimodal vision to parse messy cursive handwriting and medicine bottles into strict typed JSON with automated drug-drug interaction matrix checks.
                  </p>
                </div>

                <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-emerald-950">
                    <Database className="w-4 h-4 text-emerald-600" />
                    <span>Offline-First Inventory Sync</span>
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    Real-time decrement on dosage checkbox clicks with automatic low-stock triggers (&le; 2 days remaining supply threshold).
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <h4 className="font-bold text-slate-800 text-sm">Key Features Implemented:</h4>
                <ul className="space-y-1.5 text-slate-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span><strong>Prescription Scanner &amp; AI Analyzer:</strong> Live camera, upload &amp; 3 verified clinical demo presets with safety alerts.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span><strong>Pharmacy Inventory Onboarding:</strong> Verify actual stock purchased and customize refill thresholds.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span><strong>Smart Daily Timeline:</strong> 4 routines (Morning, Afternoon, Evening, Bedtime) with real-time stock decrement.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span><strong>Low-Stock &amp; Refill Alerts:</strong> 1-click WhatsApp order generation and .ics calendar exports.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span><strong>Doctor Follow-Up Tracker:</strong> 48h and 24h prior notification alarms and calendar download.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span><strong>Senior Citizen Accessibility:</strong> Senior Mode high contrast, Web Speech TTS aloud, and Caregiver SOS WhatsApp reporting.</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'tree' && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-slate-700 uppercase">Project Directory Layout</span>
                <button
                  onClick={() => copyToClipboard(directoryTree)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md flex items-center gap-1 font-medium"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Tree'}</span>
                </button>
              </div>
              <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-[11px] overflow-x-auto leading-relaxed">
                {directoryTree}
              </pre>
            </div>
          )}

          {activeTab === 'gemini' && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-slate-700 uppercase">Gemini 3.8 Flash Multimodal Prompt</span>
                <button
                  onClick={() => copyToClipboard(geminiPromptSnippet)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md flex items-center gap-1 font-medium"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Code'}</span>
                </button>
              </div>
              <pre className="bg-slate-900 text-emerald-400 p-4 rounded-xl font-mono text-[11px] overflow-x-auto leading-relaxed">
                {geminiPromptSnippet}
              </pre>
            </div>
          )}

          {activeTab === 'state' && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-slate-700 uppercase">Inventory Decrement &amp; Threshold State Logic</span>
                <button
                  onClick={() => copyToClipboard(stateLogicSnippet)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md flex items-center gap-1 font-medium"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Code'}</span>
                </button>
              </div>
              <pre className="bg-slate-900 text-amber-300 p-4 rounded-xl font-mono text-[11px] overflow-x-auto leading-relaxed">
                {stateLogicSnippet}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
