import React, { useState, useEffect } from 'react';
import { Wifi, Battery, Signal, ChevronLeft } from 'lucide-react';

interface Props {
  viewMode: 'mobile' | 'full';
  children: React.ReactNode;
}

export const MobileFrame: React.FC<Props> = ({ viewMode, children }) => {
  const [timeStr, setTimeStr] = useState('09:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const h = now.getHours();
      const m = now.getMinutes().toString().padStart(2, '0');
      setTimeStr(`${h}:${m}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  if (viewMode === 'full') {
    return <div className="w-full min-h-screen bg-slate-100/60 pb-12">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-slate-900 py-4 sm:py-8 px-2 flex justify-center items-start">
      {/* Smartphone Chassis */}
      <div className="relative w-full max-w-[430px] bg-slate-950 rounded-[48px] p-3 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] border-4 border-slate-700/80 ring-1 ring-white/10 overflow-hidden">
        {/* Dynamic Island / Top Camera Pill */}
        <div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-50 flex items-center justify-between px-2.5 pointer-events-none">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-900 ring-1 ring-slate-800" />
          <div className="w-2.5 h-2.5 rounded-full bg-blue-950/60 ring-1 ring-blue-500/20" />
        </div>

        {/* Mobile Screen Surface */}
        <div className="relative bg-slate-50 rounded-[40px] overflow-hidden min-h-[820px] max-h-[880px] flex flex-col shadow-inner">
          {/* Status Bar */}
          <div className="h-10 px-6 pt-2 flex items-center justify-between text-slate-800 text-[11px] font-semibold select-none shrink-0 z-40 bg-white/70 backdrop-blur-md">
            <span>{timeStr}</span>
            <div className="flex items-center gap-1.5">
              <Signal className="w-3.5 h-3.5" />
              <Wifi className="w-3.5 h-3.5" />
              <Battery className="w-4 h-4" />
            </div>
          </div>

          {/* App Viewport with scrollable body */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin">
            {children}
          </div>

          {/* Bottom Home Indicator Bar */}
          <div className="h-5 bg-white flex items-center justify-center shrink-0">
            <div className="w-32 h-1 bg-slate-400 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};
