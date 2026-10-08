# RxGuard: AI Prescription Safety & Intelligent Medication Tracker

[![License: Apache-2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-3.8_Flash-8E75C2?logo=google&logoColor=white)](https://ai.google.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

> **RxGuard** is an intelligent, offline-first mobile web application that combines **Google Gemini Multimodal Vision AI**, automated drug-drug contraindication analysis, real-time inventory decrementing, and senior-friendly accessibility to make medication management safe, effortless, and error-free.

---

## 🌟 Why RxGuard?

Medication errors, illegible doctor handwriting, missed refills, and adverse drug-drug interactions cause over 1.5 million preventable injuries and billions in healthcare costs annually. Elderly patients and individuals managing complex polypharmacy regimens are especially vulnerable.

**RxGuard solves this end-to-end:**
1. **Multimodal AI OCR:** Instantly transcribes messy handwritten prescriptions and medication bottles into structured, actionable treatment plans.
2. **Clinical Safety Engine:** Cross-checks prescribed medications against pharmacological databases to flag life-threatening drug-drug contraindications and food-timing conflicts.
3. **Smart Inventory Onboarding:** Calibrates physical pill stock and decrements inventory in real-time when doses are checked off.
4. **Automated Refill Logistics:** Detects when supply drops to $\le 2$ days and generates a 1-click WhatsApp refill order directly to the patient's pharmacy.
5. **Senior Citizen Accessibility:** High-contrast senior mode, Text-to-Speech (TTS) audio narration, and an **Emergency Caregiver SOS** module with instant adherence reporting.

---

## 🚀 Key Features

### 1. Prescription Scanner & AI Safety Engine
- **Multimodal Capture:** Scan physical prescriptions or medicine bottle labels using device camera or file upload.
- **Gemini Multimodal OCR:** Extracts doctor details, clinic name, next appointment date, medications, dosages, timing routines, and meal relationships.
- **Drug-Drug Contraindication Analysis:** Classifies safety risks (**High**, **Moderate**, **Low**) with clinical mitigation advice (e.g., separating NSAIDs from blood thinners or spacing antacids from antibiotics).
- **Audio Warning:** Built-in speech synthesis reads safety alerts aloud for elder comprehension.
- **1-Click Test Scenarios:** Built-in clinical presets (Acute Sinusitis, High-Risk Cardiology, and Pediatric Infection) ensure bulletproof demos even without physical prescriptions on hand.

### 2. Pharmacy Inventory Onboarding
- After scanning, users confirm actual physical stock dispensed by the chemist (e.g., *"Purchased 10 tablets for a 5-day course"*).
- Configures:
  - `totalStock`: Initial physical count
  - `dosesPerDay`: Computed automatically from morning/afternoon/evening/night slots
  - `remainingStock`: Live active inventory
  - `expiryWarningDays`: Customizable low-stock threshold (default: **2 days supply left**)

### 3. Smart Daily Timeline & Dynamic Alarms
- **4 Intuitive Daily Slots:**
  - 🌅 **Morning Routine** (08:00 AM) — Breakfast & day start
  - ☀️ **Afternoon Routine** (01:00 PM) — Lunch & midday check
  - 🌆 **Evening Routine** (07:00 PM) — Dinner & dusk
  - 🌙 **Bedtime Routine** (10:00 PM) — Rest & overnight care
- **Real-Time Stock Decrement:** Ticking "Take Dose" decrements the medicine inventory by 1 in real time (and restores it if unchecked).
- **Sound Feedback:** Web Audio API ascending dual-tone chime on dose completion + celebratory confetti upon finishing the day's schedule.
- **In-App & Browser Alarms:** Testable notification chime and system push notifications.

### 4. Low-Stock & Quick WhatsApp Refill
- **Critical Warning Badge:** Flashes prominent Amber/Red alerts when inventory drops to $\le 2$ days of supply.
- **Quick Refill via WhatsApp:** Generates a pre-formatted WhatsApp order message to the local chemist with exact drug names, dosages, remaining quantities, and patient name.
- **Calendar Refill Alert:** One-click download of `.ics` calendar alarms 2 days before stock exhaustion.
- **Quick Restock Stepper:** One-click `+10 Refill` button for instant inventory top-ups.

### 5. Doctor Follow-up & Appointment Tracker
- Displays doctor name, specialty, clinic address, and next appointment date on the home dashboard.
- **48-Hour & 24-Hour Prior Alarms:** Visual badges and notifications reminding the patient to confirm their consultation.
- **Add to Calendar (.ics):** Generates RFC-compliant iCalendar files with built-in alarms compatible with iOS Calendar, Google Calendar, and Outlook.
- **Clinic Dialer & WhatsApp Confirm:** Instant one-tap calling and WhatsApp check-in.

### 6. Senior Citizen Accessibility (Elderly-Friendly)
- **Senior Mode Toggle:** High-contrast color palette, 120% typographic scaling, and oversized tap targets.
- **Text-to-Speech (TTS):** Clear voice narration (e.g., *"Take 1 tablet of Paracetamol 650mg after lunch with a glass of water"*).
- **Master Audio Player:** *"Read Today's Schedule Aloud"* reads the daily regimen sequentially.
- **Emergency Caretaker SOS:** One-tap button generates a comprehensive WhatsApp report to the primary caregiver with today's adherence percentage, completed doses, low-stock warnings, and appointment dates.

---

## 🏗️ Architecture & Tech Stack

```
┌─────────────────────────────────────────────────────────────┐
│                       Client Viewport                       │
│      React 19 SPA • Tailwind CSS v4 • Web Audio • TTS       │
│  [Mobile Device Frame] ◄──────────────► [Full Web Layout]   │
└──────────────────────────────┬──────────────────────────────┘
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
┌───────────────────────────────┐   ┌───────────────────────────────┐
│     Offline-First Engine      │   │    Express Full-Stack API     │
│ LocalStorage / SQLite Driver  │   │  POST /api/analyze-prescrip.  │
│ Real-Time Stock Decrement     │   │  GET  /api/health             │
│ Low-Stock (≤2 Days) Trigger   │   └──────────────┬────────────────┘
└───────────────────────────────┘                  │
                                                   ▼
                                    ┌───────────────────────────────┐
                                    │      Google Gemini 3.8        │
                                    │      Flash Multimodal API     │
                                    │  Handwritten OCR + Safety Matrix│
                                    └───────────────────────────────┘
```

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend Framework** | React 19 + TypeScript | High-performance reactive UI |
| **Styling** | Tailwind CSS v4 | Clean medical UI, high contrast, smooth transitions |
| **AI / Vision Engine** | Google Gemini 3.8 Flash (`@google/genai`) | Multimodal handwritten OCR & contraindication analysis |
| **Backend Proxy** | Express.js + Node.js (via `tsx`) | Secure server-side Gemini invocation (no exposed client keys) |
| **Audio & Speech** | Web Speech API + Web Audio API | Elder-friendly TTS & synthesized medical chimes |
| **Calendar Integration** | RFC 5545 `.ics` Generator | Native appointment & refill reminder calendar files |
| **Messaging** | WhatsApp Click-to-Chat API | Instant pharmacy refill orders & Caregiver SOS reports |
| **Icons & Effects** | Lucide React + Canvas Confetti | Medical iconography & adherence celebration |

---

## 📁 Project Directory Structure

```
rxguard/
├── server.ts                       # Express backend proxy with Gemini 3.8 Flash endpoint
├── src/
│   ├── types/
│   │   └── index.ts                # Strict TypeScript interfaces (Medicine, Contraindication, Timeline)
│   ├── services/
│   │   ├── storageService.ts       # Offline-first storage, auto-decrement & low-stock engine
│   │   ├── ttsService.ts           # Senior Text-To-Speech audio service (Web Speech API)
│   │   ├── notificationService.ts  # Browser notifications & Web Audio API chime synthesizer
│   │   └── calendarService.ts      # iCalendar (.ics) generator for appointments & refills
│   ├── utils/
│   │   └── whatsapp.ts             # 1-click WhatsApp refill & caregiver SOS message generator
│   ├── data/
│   │   └── mockPrescriptions.ts    # Bulletproof fallback presets (Sinusitis, Cardiology, Pediatric)
│   ├── components/
│   │   ├── Header.tsx              # Senior mode switch, Mobile/Full view toggle, SOS trigger
│   │   ├── DailyTimeline.tsx       # 4 daily routine slots with real-time stock decrement
│   │   ├── PrescriptionScanner.tsx # Camera picker, gallery upload & Gemini Multimodal OCR
│   │   ├── ContraindicationBanner.tsx # High-visibility drug-drug interaction warning banner
│   │   ├── LowStockCard.tsx        # ≤2 days supply alert & WhatsApp Quick Refill
│   │   ├── DoctorAppointmentCard.tsx # Doctor follow-up tracker & 48h/24h prior alarms
│   │   ├── InventoryModal.tsx      # Step 2: Confirm actual purchased stock & refill threshold
│   │   ├── InventoryManager.tsx    # Live Medicine Cabinet with +/- stock adjusters
│   │   ├── CaregiverSOSModal.tsx   # Emergency Caretaker SOS module with WhatsApp adherence reporting
│   │   ├── ArchitectureModal.tsx   # Hackathon blueprint & deliverables inspector
│   │   └── MobileFrame.tsx         # Simulated mobile smartphone bezel with status bar
│   ├── App.tsx                     # Master state controller & tab router
│   ├── main.tsx                    # React DOM entry point
│   └── index.css                   # Tailwind CSS import & custom scrollbar styles
├── index.html                      # HTML5 entry with synced SEO metadata
├── metadata.json                   # Applet permissions & capabilities
├── package.json                    # Dependencies & scripts
├── tsconfig.json                   # TypeScript configuration
└── vite.config.ts                  # Vite build tooling & Tailwind integration
```

---

## 🤖 Gemini Multimodal Extraction Prompt

The backend sends the prescription image to **Gemini 3.8 Flash** with the following structured prompt and typed response schema:

```typescript
const prompt = `You are RxGuard, an elite clinical pharmacologist and AI prescription analyzer.
Carefully inspect this prescription note or medicine bottle label.
Extract the following information with maximum medical fidelity:
1. Prescribing doctor's name, clinic/hospital, prescription date, and follow-up appointment date.
2. Patient name and provisional diagnosis if legible.
3. Prescribed medicines list:
   - name (generic and brand if discernible)
   - dosage (e.g., "500mg", "20mg", "10ml")
   - form ("tablet", "capsule", "syrup", "inhaler", "drops", "other")
   - timing (array containing: "morning", "afternoon", "evening", "night")
   - foodRelation ("before_meal", "after_meal", "with_meal", "anytime")
   - durationDays (number of days prescribed)
   - instructions (clear patient directions)
   - purpose (clinical indication)
4. Contraindications & Drug-Drug Interactions:
   Conduct a strict clinical safety analysis on all identified drugs.
   Flag potential drug-drug interactions (e.g. NSAID + Lisinopril/Aspirin).
   Classify severity as "High", "Moderate", or "Low" with clinical mitigation advice.

Return strict JSON conforming to the response schema.`;
```

---

## ⚡ Quick Start & Installation

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **yarn** / **pnpm**
- **Gemini API Key** (optional for live AI; verified fallback presets are included so the app runs out-of-the-box!)

### 1. Clone the repository
```bash
git clone https://github.com/your-username/rxguard.git
cd rxguard
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create a `.env` file in the root directory:
```env
# Gemini API Key (get yours at https://aistudio.google.com/)
GEMINI_API_KEY="your_gemini_api_key_here"

# Application Port
PORT=3000
```

### 4. Run the development server
```bash
npm run dev
```

Visit **`http://localhost:3000`** in your browser.

### 5. Build for production
```bash
npm run build
npm start
```

---

## 🧪 Demo & Presentation Guide

For hackathon judges and demo evaluations:
1. **Instant AI Test:** Navigate to the **AI Scanner** tab and select any of the 3 instant presets:
   - **Acute Sinusitis (Handwritten):** Tests messy script parsing and Omeprazole + Amoxicillin timing conflicts.
   - **Cardiology (High Risk):** Flags critical bleeding and renal contraindications between Lisinopril, Aspirin, and Ibuprofen.
   - **Pediatric Infection:** Tests oral suspension dosing and antipyretic interval warnings.
2. **Real-Time Decrement:** Switch to **Timeline**, check any medication dose, and observe the live inventory count decrement by 1.
3. **WhatsApp Refill:** Check the **Low Stock Warning** card and click *"Quick Refill via WhatsApp"* to inspect the pre-filled order text.
4. **Senior Mode & Voice:** Click *"Senior Mode"* in the top bar to experience high-contrast scaling, then tap any speaker icon to hear the Web Speech audio readout.
5. **Caregiver SOS:** Click the red *"SOS"* button to preview the full real-time adherence report formatted for WhatsApp.
6. **Mobile vs. Desktop:** Toggle the screen icon in the top header to switch between the realistic smartphone bezel and full-width responsive desktop mode.

---

## 📄 License & Medical Disclaimer

Distributed under the **Apache-2.0 License**. See `LICENSE` for more information.

> **⚠️ Medical Disclaimer:** RxGuard is designed as an assistive medication management tool and hackathon technology prototype. It is not intended to replace professional medical judgment, diagnosis, or treatment. Always consult a qualified healthcare provider for medical decisions.
