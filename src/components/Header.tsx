import React from 'react';
import {
  ShieldCheck,
  Smartphone,
  Monitor,
  HeartHandshake,
  RotateCcw,
  Sparkles,
  Accessibility,
  Code2,
  Bell,
  Volume2,
} from 'lucide-react';
import { notificationService } from '../services/notificationService';

interface Props {
  isSeniorMode: boolean;
  onToggleSeniorMode: () => void;
  viewMode: 'mobile' | 'full';
  onToggleViewMode: () => void;
  onOpenSOS: () => void;
  onOpenArch: () => void;
  onResetDemo: () => void;
  unreadCount?: number;
}

export const Header: React.FC<Props> = ({
  isSeniorMode,
  onToggleSeniorMode,
  viewMode,
  onToggleViewMode,
  onOpenSOS,
  onOpenArch,
  onResetDemo,
  unreadCount = 0,
}) => {
  const handleRequestNotification = async () => {
    const granted = await notificationService.requestPermission();
    if (granted) {
      notificationService.showNotification('RxGuard Notifications Enabled', {
        body: 'You will receive reminders for scheduled doses and doctor appointments.',
      });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-emerald-500 p-0.5 shadow-md flex items-center justify-center">
            <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-white">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h1 className={`font-black tracking-tight text-slate-900 ${isSeniorMode ? 'text-2xl' : 'text-lg'}`}>
                RxGuard
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-md">
                AI Safety
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
              Intelligent Medication Tracker &amp; Safety Scanner
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Senior Accessibility Toggle */}
          <button
            onClick={onToggleSeniorMode}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs ${
              isSeniorMode
                ? 'bg-amber-400 border-amber-500 text-slate-950 ring-2 ring-amber-300'
                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
            }`}
            title="Toggle Senior Mode (High Contrast & Large Text)"
          >
            <Accessibility className="w-4 h-4 text-amber-700" />
            <span className="hidden md:inline">Senior Mode:</span>
            <span>{isSeniorMode ? 'ON' : 'OFF'}</span>
          </button>

          {/* Viewport Frame Toggle */}
          <button
            onClick={onToggleViewMode}
            className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors shadow-xs hidden sm:flex items-center gap-1 text-xs font-medium"
            title={`Switch to ${viewMode === 'mobile' ? 'Full Desktop View' : 'Mobile Phone Frame'}`}
          >
            {viewMode === 'mobile' ? (
              <>
                <Monitor className="w-4 h-4 text-blue-600" />
                <span className="hidden lg:inline">Full View</span>
              </>
            ) : (
              <>
                <Smartphone className="w-4 h-4 text-indigo-600" />
                <span className="hidden lg:inline">Mobile Frame</span>
              </>
            )}
          </button>

          {/* Notification Permission */}
          <button
            onClick={handleRequestNotification}
            className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors shadow-xs relative"
            title="Enable Alarms & Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Architecture / Hackathon Docs */}
          <button
            onClick={onOpenArch}
            className="p-2 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors shadow-xs flex items-center gap-1 text-xs font-bold"
            title="View Hackathon Architecture & Prompt Blueprint"
          >
            <Code2 className="w-4 h-4" />
            <span className="hidden lg:inline">Architecture</span>
          </button>

          {/* Caretaker SOS Quick Trigger */}
          <button
            onClick={onOpenSOS}
            className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black transition-all shadow-sm flex items-center gap-1.5 animate-pulse"
            title="Emergency Caretaker SOS: Share Adherence via WhatsApp"
          >
            <HeartHandshake className="w-4 h-4" />
            <span>SOS</span>
          </button>

          {/* Reset Demo Data */}
          <button
            onClick={onResetDemo}
            className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Reset to Fresh Demo Data"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
