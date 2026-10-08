import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Sun,
  Sunset,
  Moon,
  Sunrise,
  CheckCircle2,
  Circle,
  Volume2,
  BellRing,
  Pill,
  Clock,
  Sparkles,
  Info,
  RotateCcw,
} from 'lucide-react';
import { DoseScheduleItem, TimingSlot } from '../types';
import { ttsService } from '../services/ttsService';
import { notificationService } from '../services/notificationService';

interface Props {
  timeline: DoseScheduleItem[];
  onToggleDose: (dose: DoseScheduleItem, taken: boolean) => void;
  isSeniorMode?: boolean;
}

export const DailyTimeline: React.FC<Props> = ({ timeline, onToggleDose, isSeniorMode = false }) => {
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  // Group by slot
  const slots: Array<{
    id: TimingSlot;
    label: string;
    sublabel: string;
    time: string;
    icon: React.ReactNode;
    color: string;
  }> = [
    {
      id: 'morning',
      label: 'Morning Routine',
      sublabel: 'Breakfast & Start of Day',
      time: '08:00 AM',
      icon: <Sunrise className="w-5 h-5" />,
      color: 'amber',
    },
    {
      id: 'afternoon',
      label: 'Afternoon Routine',
      sublabel: 'Lunch & Midday Check',
      time: '01:00 PM',
      icon: <Sun className="w-5 h-5" />,
      color: 'orange',
    },
    {
      id: 'evening',
      label: 'Evening Routine',
      sublabel: 'Dinner & Dusk',
      time: '07:00 PM',
      icon: <Sunset className="w-5 h-5" />,
      color: 'indigo',
    },
    {
      id: 'night',
      label: 'Bedtime Routine',
      sublabel: 'Before Sleep & Rest',
      time: '10:00 PM',
      icon: <Moon className="w-5 h-5" />,
      color: 'purple',
    },
  ];

  const takenCount = timeline.filter((d) => d.taken).length;
  const totalCount = timeline.length;
  const progressPercent = totalCount > 0 ? Math.round((takenCount / totalCount) * 100) : 0;

  const handleDoseClick = (dose: DoseScheduleItem) => {
    const nextTaken = !dose.taken;
    onToggleDose(dose, nextTaken);

    if (nextTaken) {
      notificationService.playDoseTakenChime();
      // If completing all doses for the day, fire celebratory confetti
      if (takenCount + 1 === totalCount && totalCount > 0) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    }
  };

  const handleSpeakDose = async (dose: DoseScheduleItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setSpeakingId(dose.id);
    await ttsService.speakDose(dose, isSeniorMode);
    setSpeakingId(null);
  };

  const handleReadAll = async () => {
    await ttsService.speakScheduleSummary(timeline, isSeniorMode);
  };

  const handleTestAlarm = (dose: DoseScheduleItem, e: React.MouseEvent) => {
    e.stopPropagation();
    notificationService.triggerMedicationAlarmTest(dose.medicineName, dose.dosage, dose.timeLabel);
  };

  return (
    <div className="space-y-4">
      {/* Timeline Header & Adherence Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className={`font-black text-slate-900 ${isSeniorMode ? 'text-2xl' : 'text-lg'}`}>
                Today's Medication Timeline
              </h2>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                {takenCount} of {totalCount} Taken
              </span>
            </div>
            <p className={`text-slate-500 mt-0.5 ${isSeniorMode ? 'text-base' : 'text-xs'}`}>
              Check doses in real time to automatically decrement cabinet inventory
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReadAll}
              className={`px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-bold transition-all flex items-center gap-1.5 shadow-xs ${
                isSeniorMode ? 'text-sm py-2.5 px-4' : 'text-xs'
              }`}
              title="Senior Accessibility: Read full schedule aloud"
            >
              <Volume2 className="w-4 h-4 text-blue-600" />
              <span>Read Aloud</span>
            </button>
          </div>
        </div>

        {/* Adherence Progress Bar */}
        <div className="mt-3">
          <div className="flex justify-between items-center text-xs font-medium text-slate-600 mb-1">
            <span>Daily Adherence Progress</span>
            <span className="font-bold text-blue-700">{progressPercent}% Completed</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-emerald-500 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 4 Timing Slots */}
      <div className="space-y-3">
        {slots.map((slot) => {
          const slotDoses = timeline.filter((d) => d.slot === slot.id);

          return (
            <div
              key={slot.id}
              className={`rounded-2xl border transition-all ${
                slotDoses.length > 0 ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-50/60 border-slate-200/50'
              } p-4`}
            >
              {/* Slot Header */}
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`p-2 rounded-xl ${
                      slot.id === 'morning'
                        ? 'bg-amber-100 text-amber-700'
                        : slot.id === 'afternoon'
                        ? 'bg-orange-100 text-orange-700'
                        : slot.id === 'evening'
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-purple-100 text-purple-700'
                    }`}
                  >
                    {slot.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className={`font-bold text-slate-900 ${isSeniorMode ? 'text-lg' : 'text-sm'}`}>
                        {slot.label}
                      </h3>
                      <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {slot.time}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">{slot.sublabel}</p>
                  </div>
                </div>

                <div className="text-xs font-semibold text-slate-400">
                  {slotDoses.length === 0
                    ? 'No scheduled doses'
                    : `${slotDoses.filter((d) => d.taken).length}/${slotDoses.length} Taken`}
                </div>
              </div>

              {/* Doses in this slot */}
              {slotDoses.length === 0 ? (
                <div className="py-2 text-center text-xs text-slate-400 italic">
                  Rest period — no medicines prescribed for this time.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {slotDoses.map((dose) => (
                    <div
                      key={dose.id}
                      onClick={() => handleDoseClick(dose)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        dose.taken
                          ? 'bg-emerald-50/70 border-emerald-200 opacity-80'
                          : 'bg-slate-50/80 hover:bg-blue-50/50 border-slate-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Interactive Checkbox */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDoseClick(dose);
                          }}
                          className={`shrink-0 transition-transform active:scale-90 ${
                            isSeniorMode ? 'p-1' : ''
                          }`}
                          aria-label={`Mark ${dose.medicineName} as ${dose.taken ? 'untaken' : 'taken'}`}
                        >
                          {dose.taken ? (
                            <CheckCircle2
                              className={`text-emerald-600 ${isSeniorMode ? 'w-8 h-8' : 'w-6 h-6'}`}
                            />
                          ) : (
                            <Circle
                              className={`text-slate-400 hover:text-blue-600 ${
                                isSeniorMode ? 'w-8 h-8' : 'w-6 h-6'
                              }`}
                            />
                          )}
                        </button>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`font-bold truncate ${
                                dose.taken
                                  ? 'line-through text-slate-500'
                                  : 'text-slate-900'
                              } ${isSeniorMode ? 'text-xl' : 'text-base'}`}
                            >
                              {dose.medicineName}
                            </span>
                            <span className="text-xs font-mono bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-700">
                              {dose.dosage}
                            </span>
                            <span
                              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                dose.foodRelation === 'before_meal'
                                  ? 'bg-amber-100 text-amber-800'
                                  : dose.foodRelation === 'after_meal'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              {dose.foodLabel}
                            </span>
                          </div>

                          {dose.instructions && (
                            <p
                              className={`text-slate-500 mt-1 line-clamp-1 ${
                                isSeniorMode ? 'text-sm' : 'text-xs'
                              }`}
                            >
                              💡 {dose.instructions}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Action buttons on card (TTS Audio & Alarm Simulation) */}
                      <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={(e) => handleSpeakDose(dose, e)}
                          title="Speak dose instruction aloud"
                          className={`p-2 rounded-xl bg-white border border-slate-200 hover:bg-blue-50 text-slate-700 hover:text-blue-700 transition-colors shadow-xs ${
                            speakingId === dose.id ? 'ring-2 ring-blue-500 animate-pulse' : ''
                          }`}
                        >
                          <Volume2 className={isSeniorMode ? 'w-5 h-5' : 'w-4 h-4'} />
                        </button>

                        <button
                          type="button"
                          onClick={(e) => handleTestAlarm(dose, e)}
                          title="Simulate push notification alarm chime"
                          className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-amber-50 text-slate-700 hover:text-amber-700 transition-colors shadow-xs"
                        >
                          <BellRing className={isSeniorMode ? 'w-5 h-5' : 'w-4 h-4'} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
