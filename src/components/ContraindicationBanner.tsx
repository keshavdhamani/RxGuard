import React, { useState } from 'react';
import { AlertTriangle, ShieldAlert, ChevronDown, ChevronUp, Volume2, Info, CheckCircle2 } from 'lucide-react';
import { Contraindication } from '../types';
import { ttsService } from '../services/ttsService';

interface Props {
  contraindications: Contraindication[];
  isSeniorMode?: boolean;
}

export const ContraindicationBanner: React.FC<Props> = ({ contraindications, isSeniorMode = false }) => {
  const [expanded, setExpanded] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);

  if (!contraindications || contraindications.length === 0) {
    return null;
  }

  const hasHighRisk = contraindications.some((c) => c.severity === 'High');
  const highRiskCount = contraindications.filter((c) => c.severity === 'High').length;

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    const speechText = contraindications
      .map((c) => `Safety Alert: Severity ${c.severity}. ${c.message}. Recommendation: ${c.clinicalAdvice || ''}`)
      .join(' ');
    ttsService.speak(speechText, isSeniorMode);
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border transition-all shadow-md ${
        hasHighRisk
          ? 'bg-rose-50 border-rose-300 text-rose-950'
          : 'bg-amber-50 border-amber-300 text-amber-950'
      } ${isSeniorMode ? 'p-5' : 'p-4'}`}
      role="alert"
    >
      {/* Top Banner Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className={`p-2.5 rounded-xl shrink-0 ${
              hasHighRisk ? 'bg-rose-600 text-white animate-pulse' : 'bg-amber-500 text-white'
            }`}
          >
            <ShieldAlert className={isSeniorMode ? 'w-7 h-7' : 'w-6 h-6'} />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`font-black tracking-wide uppercase px-2.5 py-0.5 rounded-full text-xs ${
                  hasHighRisk ? 'bg-rose-200 text-rose-800' : 'bg-amber-200 text-amber-900'
                }`}
              >
                {hasHighRisk ? 'Critical Drug Interaction Flagged' : 'Medication Safety Notice'}
              </span>
              {highRiskCount > 0 && (
                <span className="text-xs font-semibold bg-rose-600 text-white px-2 py-0.5 rounded-full">
                  {highRiskCount} High Priority
                </span>
              )}
            </div>

            <h3 className={`font-bold mt-1 ${isSeniorMode ? 'text-lg leading-snug' : 'text-base'}`}>
              {hasHighRisk
                ? 'Potentially dangerous drug-drug interaction detected in active prescription'
                : 'Important timing and food interaction guidelines detected'}
            </h3>
            <p className={`text-slate-600 mt-0.5 ${isSeniorMode ? 'text-base' : 'text-xs'}`}>
              AI Clinical Pharmacologist has reviewed your active medicines against interaction databases.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleSpeak}
            title="Read warning aloud"
            className="p-2 rounded-xl bg-white border border-rose-200 text-rose-700 hover:bg-rose-100 transition-colors shadow-sm flex items-center gap-1 text-xs font-medium"
          >
            <Volume2 className="w-4 h-4" />
            <span className="hidden sm:inline">Listen</span>
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-2 rounded-xl bg-white/80 border border-slate-200 hover:bg-white transition-colors text-slate-700"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Primary Message Preview */}
      <div className={`mt-3 p-3 rounded-xl bg-white/90 border ${hasHighRisk ? 'border-rose-200' : 'border-amber-200'}`}>
        <p className={`font-semibold ${isSeniorMode ? 'text-base' : 'text-sm'} text-slate-900`}>
          ⚠️ {contraindications[0].message}
        </p>
        {contraindications[0].clinicalAdvice && (
          <p className={`mt-1.5 text-slate-700 ${isSeniorMode ? 'text-sm' : 'text-xs'} bg-slate-50 p-2 rounded-lg border border-slate-200 flex items-start gap-1.5`}>
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <span><strong>Clinical Mitigation:</strong> {contraindications[0].clinicalAdvice}</span>
          </p>
        )}
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="mt-3 space-y-2.5 pt-2 border-t border-rose-200/60">
          {contraindications.slice(1).map((item, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-white/90 border border-slate-200 text-xs">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    item.severity === 'High'
                      ? 'bg-rose-100 text-rose-800'
                      : item.severity === 'Moderate'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {item.severity} Risk
                </span>
                {item.involvedDrugs && (
                  <span className="text-slate-500 font-mono text-[11px]">
                    Drugs: {item.involvedDrugs.join(' ↔ ')}
                  </span>
                )}
              </div>
              <p className="font-medium text-slate-900">{item.message}</p>
              {item.clinicalAdvice && (
                <p className="text-slate-600 mt-1 pl-2 border-l-2 border-blue-400">
                  {item.clinicalAdvice}
                </p>
              )}
            </div>
          ))}

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-slate-500">
              Verified with Google Gemini 3.8 Flash Clinical Vision System
            </span>
            <button
              onClick={() => setAcknowledged(!acknowledged)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-all ${
                acknowledged
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {acknowledged ? 'Safety Warning Understood' : 'Mark as Understood'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
