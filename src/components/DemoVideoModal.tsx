import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Sparkles,
  Camera,
  ShieldAlert,
  Package,
  CalendarClock,
  HeartHandshake,
  MessageCircle,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  Download,
  Loader2,
  Film,
} from 'lucide-react';
import { ttsService } from '../services/ttsService';
import { videoExportService, RenderProgress } from '../services/videoExportService';

interface Props {
  onClose: () => void;
  onOpenLiveFeature?: (tab: 'timeline' | 'scanner' | 'cabinet') => void;
}

interface Chapter {
  id: number;
  title: string;
  subtitle: string;
  duration: number; // in seconds
  badge: string;
  narration: string;
  visualType: 'intro' | 'scanner' | 'contraindication' | 'inventory' | 'timeline' | 'refill' | 'doctor' | 'senior_sos';
}

const CHAPTERS: Chapter[] = [
  {
    id: 1,
    title: 'Welcome to RxGuard',
    subtitle: 'The AI Prescription Safety & Medication Tracker',
    duration: 8,
    badge: 'Overview',
    narration:
      'Welcome to RxGuard, an intelligent, offline-first mobile app designed to eliminate medication errors, detect dangerous drug interactions, and automate pharmacy refills.',
    visualType: 'intro',
  },
  {
    id: 2,
    title: 'Multimodal Gemini Vision OCR',
    subtitle: 'Extracting messy handwritten scripts & bottle labels',
    duration: 9,
    badge: 'AI Vision',
    narration:
      'First, the user snaps a photo of a messy handwritten prescription. Google Gemini 3.8 Flash extracts the doctor, patient, exact dosages, and meal timing into strict JSON.',
    visualType: 'scanner',
  },
  {
    id: 3,
    title: 'Clinical Safety & Drug Interactions',
    subtitle: 'Automated contraindication matrix check',
    duration: 9,
    badge: 'Safety Alert',
    narration:
      'RxGuard instantly cross-references all active medications. Here, it flags a critical interaction between Ibuprofen and Lisinopril, warning of bleeding and kidney risks.',
    visualType: 'contraindication',
  },
  {
    id: 4,
    title: 'Pharmacy Inventory Onboarding',
    subtitle: 'Confirming physical counts & 2-day threshold',
    duration: 8,
    badge: 'Inventory',
    narration:
      'The patient confirms the actual stock purchased from the chemist. RxGuard automatically calculates daily requirements and sets a two-day low-stock alert threshold.',
    visualType: 'inventory',
  },
  {
    id: 5,
    title: 'Smart Timeline & Real-Time Decrement',
    subtitle: 'Morning, Afternoon, Evening, and Bedtime routines',
    duration: 9,
    badge: 'Timeline',
    narration:
      'The interactive daily timeline organizes doses into four routine slots. When a patient marks a dose as taken, the inventory automatically decrements by one in real time.',
    visualType: 'timeline',
  },
  {
    id: 6,
    title: 'Low-Stock & 1-Click WhatsApp Refill',
    subtitle: 'Automated order generation directly to chemist',
    duration: 8,
    badge: 'Refill Logistics',
    narration:
      'When remaining supply drops to two days or less, a prominent refill alert triggers. With one tap, a complete WhatsApp order message is pre-filled for the pharmacy.',
    visualType: 'refill',
  },
  {
    id: 7,
    title: 'Doctor Appointment & 48h Alarms',
    subtitle: 'Integrated follow-up calendar with .ics exports',
    duration: 8,
    badge: 'Appointments',
    narration:
      'RxGuard tracks the next doctor visit, triggering forty-eight and twenty-four hour reminder alerts, with one-click export to Google and Apple Calendars.',
    visualType: 'doctor',
  },
  {
    id: 8,
    title: 'Senior Accessibility & Caregiver SOS',
    subtitle: 'High contrast, TTS voice readout & WhatsApp alerts',
    duration: 9,
    badge: 'Accessibility',
    narration:
      'Finally, Senior Mode offers high-contrast large fonts, text-to-speech audio guidance, and an emergency SOS button that sends live adherence updates to caregivers.',
    visualType: 'senior_sos',
  },
];

export const DemoVideoModal: React.FC<Props> = ({ onClose, onOpenLiveFeature }) => {
  const [currentChapterIdx, setCurrentChapterIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [progressSec, setProgressSec] = useState(0);
  const [copiedScript, setCopiedScript] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<RenderProgress | null>(null);

  const currentChapter = CHAPTERS[currentChapterIdx];
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleDownloadMP4 = async () => {
    try {
      setIsExporting(true);
      setIsPlaying(false);
      ttsService.stop();

      const videoBlob = await videoExportService.generateDemoVideoMP4(
        (progress) => {
          setExportProgress(progress);
        }
      );

      videoExportService.downloadBlob(videoBlob, 'RxGuard_Demo_Video.mp4');
    } catch (err: any) {
      console.error('Failed to generate MP4 video:', err);
      alert('Could not render MP4 on this browser. You can watch the live interactive tour directly!');
    } finally {
      setIsExporting(false);
      setExportProgress(null);
    }
  };

  // Auto playback loop
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      ttsService.stop();
      return;
    }

    // Speak narration if not muted
    if (!isMuted) {
      ttsService.speak(currentChapter.narration);
    }

    setProgressSec(0);
    const interval = setInterval(() => {
      setProgressSec((prev) => {
        if (prev + 1 >= currentChapter.duration) {
          // Advance to next chapter
          if (currentChapterIdx + 1 < CHAPTERS.length) {
            setCurrentChapterIdx((c) => c + 1);
          } else {
            setIsPlaying(false);
          }
          return 0;
        }
        return prev + 1;
      });
    }, 1000);

    timerRef.current = interval;

    return () => {
      clearInterval(interval);
      ttsService.stop();
    };
  }, [currentChapterIdx, isPlaying, isMuted]);

  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    if (currentChapterIdx + 1 < CHAPTERS.length) {
      setCurrentChapterIdx(currentChapterIdx + 1);
    }
  };

  const handlePrev = () => {
    if (currentChapterIdx > 0) {
      setCurrentChapterIdx(currentChapterIdx - 1);
    }
  };

  const handleRestart = () => {
    setCurrentChapterIdx(0);
    setProgressSec(0);
    setIsPlaying(true);
  };

  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    if (next) {
      ttsService.stop();
    } else {
      ttsService.speak(currentChapter.narration);
    }
  };

  const handleCopyPitchScript = () => {
    const fullScript = CHAPTERS.map(
      (c) => `[${c.title} - ${c.badge}]\n${c.narration}\n`
    ).join('\n');
    navigator.clipboard.writeText(fullScript);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const totalDuration = CHAPTERS.reduce((acc, c) => acc + c.duration, 0);
  const elapsedTotal =
    CHAPTERS.slice(0, currentChapterIdx).reduce((acc, c) => acc + c.duration, 0) + progressSec;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-fadeIn">
      <div
        className={`bg-slate-950 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden w-full transition-all flex flex-col ${
          isFullscreen ? 'max-w-6xl h-[92vh]' : 'max-w-4xl my-auto'
        }`}
      >
        {/* Top Video Header */}
        <div className="px-5 py-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
            <h2 className="text-sm font-black tracking-wide">
              RxGuard Product Demo Walkthrough &amp; Video Tour
            </h2>
            <span className="text-[10px] uppercase font-bold bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 px-2 py-0.5 rounded-full">
              Interactive 4K Demo
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadMP4}
              disabled={isExporting}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95 disabled:opacity-50"
              title="Render & Download complete Demo Video as MP4"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Encoding {exportProgress?.percent || 0}%</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Video (.mp4)</span>
                </>
              )}
            </button>

            <button
              onClick={handleCopyPitchScript}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1 transition-colors"
              title="Copy complete voiceover script"
            >
              {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copiedScript ? 'Copied' : 'Copy Pitch Script'}</span>
            </button>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors hidden sm:block"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Video Canvas / Visual Stage */}
        <div className="relative aspect-video bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 p-6 flex flex-col justify-between overflow-hidden select-none border-b border-slate-800/80">
          {/* Subtle Stage Grid Effect */}
          <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

          {/* Exporting Overlay */}
          {isExporting && (
            <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4 animate-fadeIn">
              <div className="p-4 rounded-3xl bg-indigo-950 border border-indigo-500/50 shadow-2xl relative">
                <Film className="w-10 h-10 text-indigo-400 animate-pulse" />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                  <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Rendering RxGuard Demo Video (MP4)</h3>
                <p className="text-xs text-indigo-300 mt-1">
                  Encoding scene {exportProgress?.sceneIndex || 1} of 8: {exportProgress?.sceneTitle || 'Compiling visuals...'}
                </p>
              </div>
              <div className="w-full max-w-sm bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
                <div
                  className="bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 h-2 rounded-full transition-all duration-200"
                  style={{ width: `${exportProgress?.percent || 0}%` }}
                />
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400">
                {exportProgress?.percent || 0}% Complete • Direct .mp4 Download will start automatically
              </span>
            </div>
          )}

          {/* Top Stage Bar */}
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-indigo-600 text-white shadow-xs">
                {currentChapter.badge}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Scene {currentChapterIdx + 1} of {CHAPTERS.length}
              </span>
            </div>

            <div className="flex items-center gap-1.5 bg-black/60 px-3 py-1 rounded-full text-xs text-slate-300 border border-white/10 font-mono">
              <span className="text-emerald-400">{formatTime(elapsedTotal)}</span>
              <span>/</span>
              <span>{formatTime(totalDuration)}</span>
            </div>
          </div>

          {/* Center Visual Mockup depending on VisualType */}
          <div className="my-auto z-10 flex flex-col items-center justify-center text-center px-4 py-2">
            {/* Visual 1: Intro */}
            {currentChapter.visualType === 'intro' && (
              <div className="max-w-md w-full p-6 bg-slate-900/90 rounded-3xl border border-indigo-500/40 shadow-2xl backdrop-blur-md space-y-3 animate-fadeIn">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-400 p-0.5 shadow-lg flex items-center justify-center">
                  <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-white">
                    <Sparkles className="w-8 h-8 text-emerald-400 animate-spin" style={{ animationDuration: '6s' }} />
                  </div>
                </div>
                <h3 className="text-2xl font-black text-white tracking-tight">RxGuard Engine</h3>
                <p className="text-xs text-indigo-200">
                  Google Gemini 3.8 Flash • Real-Time Inventory • Safety Matrix • Senior Care
                </p>
                <div className="flex items-center justify-center gap-2 pt-2">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                    Zero Pill Omission
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold">
                    Contraindication Shield
                  </span>
                </div>
              </div>
            )}

            {/* Visual 2: Scanner */}
            {currentChapter.visualType === 'scanner' && (
              <div className="max-w-lg w-full p-5 bg-slate-900/90 rounded-2xl border border-blue-500/40 shadow-2xl text-left space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-blue-400 font-bold">
                    <Camera className="w-4 h-4 animate-pulse" />
                    <span>Multimodal Prescription OCR</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                    Confidence: 99.4%
                  </span>
                </div>

                <div className="p-3 bg-black/60 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300 space-y-1">
                  <div className="text-indigo-400 font-bold">Doctor: Dr. Marcus Sterling, MD (Urgent Care)</div>
                  <div>Rx 1: Amoxicillin Trihydrate 500mg • Q12H (Morning &amp; Night) • 5 Days</div>
                  <div>Rx 2: Omeprazole 20mg • Daily Before Breakfast • 7 Days</div>
                  <div className="text-emerald-400">✓ JSON Response strictly formatted per Type schema</div>
                </div>
              </div>
            )}

            {/* Visual 3: Contraindication */}
            {currentChapter.visualType === 'contraindication' && (
              <div className="max-w-lg w-full p-5 bg-rose-950/80 rounded-2xl border-2 border-rose-500 shadow-2xl text-left space-y-3 animate-fadeIn">
                <div className="flex items-center gap-2.5 text-rose-400">
                  <ShieldAlert className="w-6 h-6 text-rose-400 animate-bounce" />
                  <span className="text-sm font-black uppercase tracking-wide text-rose-200">
                    High-Risk Contraindication Alert
                  </span>
                </div>
                <div className="p-3 bg-black/50 rounded-xl border border-rose-800/80 text-xs text-rose-100">
                  <p className="font-bold">
                    ⚠️ CRITICAL INTERACTION: Lisinopril + Aspirin 81mg + Ibuprofen 400mg
                  </p>
                  <p className="text-[11px] text-slate-300 mt-1 pl-2 border-l-2 border-rose-400">
                    Clinical Advice: NSAIDs drastically increase gastrointestinal bleeding risk and blunt blood pressure efficacy. Substitute with Paracetamol 500mg.
                  </p>
                </div>
              </div>
            )}

            {/* Visual 4: Inventory */}
            {currentChapter.visualType === 'inventory' && (
              <div className="max-w-lg w-full p-5 bg-slate-900/90 rounded-2xl border border-indigo-500/40 shadow-2xl text-left space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between text-xs text-indigo-300 font-bold">
                  <span className="flex items-center gap-1.5">
                    <Package className="w-4 h-4" /> Pharmacy Onboarding
                  </span>
                  <span className="bg-indigo-900/50 px-2 py-0.5 rounded text-[10px]">
                    Threshold: ≤ 2 Days Left
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-black/50 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase">Purchased Count</span>
                    <div className="text-base font-black text-white mt-0.5">14 Capsules</div>
                    <span className="text-[10px] text-emerald-400">7 Days Total Supply</span>
                  </div>
                  <div className="p-2.5 bg-black/50 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase">Daily Frequency</span>
                    <div className="text-base font-black text-white mt-0.5">2 Doses / Day</div>
                    <span className="text-[10px] text-indigo-400">Auto-Decrement Bound</span>
                  </div>
                </div>
              </div>
            )}

            {/* Visual 5: Timeline */}
            {currentChapter.visualType === 'timeline' && (
              <div className="max-w-lg w-full p-5 bg-slate-900/90 rounded-2xl border border-emerald-500/40 shadow-2xl text-left space-y-2.5 animate-fadeIn">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <CalendarClock className="w-4 h-4" /> 4-Slot Daily Routine
                  </span>
                  <span className="text-[10px] text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">
                    80% Completed Today
                  </span>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="p-2 bg-emerald-950/40 border border-emerald-800/80 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="text-white font-bold">Amoxicillin 500mg</span>
                    </div>
                    <span className="text-[10px] text-emerald-300 font-mono">Stock decremented: -1 (4 Left)</span>
                  </div>
                  <div className="p-2 bg-black/40 border border-slate-800 rounded-xl flex items-center justify-between text-slate-400">
                    <span>🌙 Bedtime: Cetirizine 10mg (10:00 PM)</span>
                    <span className="text-[10px] text-amber-400">Pending</span>
                  </div>
                </div>
              </div>
            )}

            {/* Visual 6: Refill */}
            {currentChapter.visualType === 'refill' && (
              <div className="max-w-lg w-full p-5 bg-amber-950/70 rounded-2xl border border-amber-500 shadow-2xl text-left space-y-2.5 animate-fadeIn">
                <div className="flex items-center justify-between text-xs text-amber-300 font-bold">
                  <span>⚠️ LOW STOCK WARNING: 2 Days Supply Left</span>
                  <span className="bg-amber-900 px-2 py-0.5 rounded text-[10px]">Chemist Order</span>
                </div>
                <div className="p-3 bg-black/60 rounded-xl border border-amber-800/60 text-xs text-slate-200">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold mb-1">
                    <MessageCircle className="w-4 h-4" /> Pre-filled WhatsApp Refill Order:
                  </div>
                  <p className="text-[11px] font-mono text-slate-300">
                    "Hello Pharmacy, urgent refill for Alex M.: Amoxicillin 500mg (2 capsules left) + Omeprazole 20mg. Please confirm delivery."
                  </p>
                </div>
              </div>
            )}

            {/* Visual 7: Doctor */}
            {currentChapter.visualType === 'doctor' && (
              <div className="max-w-lg w-full p-5 bg-slate-900/90 rounded-2xl border border-blue-500/40 shadow-2xl text-left space-y-2.5 animate-fadeIn">
                <div className="flex items-center justify-between text-xs text-blue-300 font-bold">
                  <span>🩺 Follow-up Consultation Tracker</span>
                  <span className="bg-indigo-900/60 text-indigo-300 px-2 py-0.5 rounded text-[10px]">
                    48h Prior Alarm Active
                  </span>
                </div>
                <div className="p-3 bg-black/50 rounded-xl border border-slate-800 text-xs">
                  <div className="font-bold text-white">Dr. Arthur Vance, MD (Cardiology)</div>
                  <div className="text-slate-400 text-[11px]">Metropolitan Heart Institute • Oct 12, 10:30 AM</div>
                  <div className="mt-2 flex gap-2 text-[10px]">
                    <span className="bg-blue-600/30 text-blue-300 border border-blue-500/40 px-2 py-0.5 rounded">
                      RFC-5545 .ics Calendar Export Ready
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Visual 8: Senior SOS */}
            {currentChapter.visualType === 'senior_sos' && (
              <div className="max-w-lg w-full p-5 bg-slate-900/90 rounded-2xl border border-rose-500/50 shadow-2xl text-left space-y-2.5 animate-fadeIn">
                <div className="flex items-center justify-between text-xs text-rose-300 font-bold">
                  <span className="flex items-center gap-1.5">
                    <HeartHandshake className="w-4 h-4 text-rose-400" /> Senior Mode &amp; Caretaker SOS
                  </span>
                  <span className="bg-rose-950 text-rose-300 border border-rose-800 px-2 py-0.5 rounded text-[10px]">
                    1-Tap WhatsApp Push
                  </span>
                </div>
                <div className="p-3 bg-black/60 rounded-xl border border-slate-800 text-xs text-slate-200">
                  <span className="text-emerald-400 font-bold">Live Caregiver Adherence Dispatch:</span>
                  <p className="text-[11px] text-slate-300 mt-0.5 font-mono">
                    "🚨 Caregiver Update for Alex M. Adherence: 80% (4/5 doses taken). Low stock alert on Amoxicillin. Safe &amp; active."
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Captions / Narration Box */}
          <div className="z-10 p-4 bg-black/75 backdrop-blur-md rounded-2xl border border-white/10 text-left">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-black text-indigo-400 uppercase tracking-wide">
                {currentChapter.title}
              </span>
              <span className="text-[11px] text-slate-400">
                {currentChapter.subtitle}
              </span>
            </div>
            <p className="text-sm font-medium text-slate-100 leading-snug">
              {currentChapter.narration}
            </p>
          </div>
        </div>

        {/* Video Player Controls Deck */}
        <div className="p-4 bg-slate-900 shrink-0 space-y-3">
          {/* Progress Timeline Bar */}
          <div className="space-y-1">
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden cursor-pointer">
              <div
                className="bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, (elapsedTotal / totalDuration) * 100)}%`,
                }}
              />
            </div>

            {/* Chapters scrubber pills */}
            <div className="flex items-center justify-between gap-1 pt-1 overflow-x-auto scrollbar-none">
              {CHAPTERS.map((ch, idx) => (
                <button
                  key={ch.id}
                  onClick={() => {
                    setCurrentChapterIdx(idx);
                    setProgressSec(0);
                  }}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all whitespace-nowrap ${
                    idx === currentChapterIdx
                      ? 'bg-indigo-600 text-white ring-1 ring-indigo-400'
                      : idx < currentChapterIdx
                      ? 'bg-slate-800 text-slate-400'
                      : 'bg-slate-800/50 text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {ch.badge}
                </button>
              ))}
            </div>
          </div>

          {/* Buttons bar */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <button
                onClick={handleTogglePlay}
                className="p-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-bold transition-transform active:scale-95 shadow-md flex items-center justify-center"
                title={isPlaying ? 'Pause Demo' : 'Play Demo'}
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-slate-950" /> : <Play className="w-4 h-4 fill-slate-950 ml-0.5" />}
              </button>

              <button
                onClick={handlePrev}
                disabled={currentChapterIdx === 0}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white transition-colors"
                title="Previous Scene"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={handleNext}
                disabled={currentChapterIdx === CHAPTERS.length - 1}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white transition-colors"
                title="Next Scene"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={handleRestart}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="Restart from Beginning"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={handleToggleMute}
                className={`p-2 rounded-xl transition-colors ${
                  isMuted
                    ? 'bg-rose-900/60 text-rose-300 border border-rose-700'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
                title={isMuted ? 'Unmute Audio Narration' : 'Mute Audio Narration'}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>

            {/* Quick Live Interactive Launchers */}
            {onOpenLiveFeature && (
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-[11px] text-slate-400">Try live app:</span>
                <button
                  onClick={() => {
                    onOpenLiveFeature('scanner');
                    onClose();
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-indigo-950 hover:bg-indigo-900 text-indigo-300 border border-indigo-700 text-xs font-semibold"
                >
                  Try AI Scanner
                </button>
                <button
                  onClick={() => {
                    onOpenLiveFeature('timeline');
                    onClose();
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-700 text-xs font-semibold"
                >
                  Try Timeline
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
