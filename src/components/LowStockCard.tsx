import React, { useState } from 'react';
import { AlertCircle, MessageCircle, CalendarPlus, Plus, ChevronRight, PackageCheck, Sparkles } from 'lucide-react';
import { Medicine } from '../types';
import { formatWhatsAppRefillMessage } from '../utils/whatsapp';
import { calendarService } from '../services/calendarService';
import { storageService } from '../services/storageService';

interface Props {
  lowStockItems: Array<{ medicine: Medicine; daysLeft: number; isCritical: boolean }>;
  pharmacyPhone: string;
  patientName?: string;
  isSeniorMode?: boolean;
  onStockUpdated: () => void;
}

export const LowStockCard: React.FC<Props> = ({
  lowStockItems,
  pharmacyPhone,
  patientName = 'Alex Morgan',
  isSeniorMode = false,
  onStockUpdated,
}) => {
  const [quickRefillModalOpen, setQuickRefillModalOpen] = useState(false);
  const [refillSuccessMsg, setRefillSuccessMsg] = useState<string | null>(null);

  if (!lowStockItems || lowStockItems.length === 0) {
    return null;
  }

  const criticalCount = lowStockItems.filter((i) => i.isCritical).length;

  const handleWhatsAppRefill = () => {
    const url = formatWhatsAppRefillMessage(pharmacyPhone, lowStockItems, patientName);
    window.open(url, '_blank');
  };

  const handleQuickRestock = (medicineId: string, packSize: number) => {
    const med = storageService.getMedicines().find((m) => m.id === medicineId);
    if (med) {
      med.remainingStock += packSize;
      med.totalStock += packSize;
      storageService.addOrUpdateMedicine(med);
      onStockUpdated();
      setRefillSuccessMsg(`Restocked ${med.name} with +${packSize} ${med.form}s!`);
      setTimeout(() => setRefillSuccessMsg(null), 3000);
    }
  };

  return (
    <div
      className={`rounded-2xl border transition-all shadow-md overflow-hidden ${
        criticalCount > 0
          ? 'bg-gradient-to-br from-rose-50 to-orange-50 border-rose-300'
          : 'bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-300'
      } ${isSeniorMode ? 'p-5' : 'p-4'}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className={`p-2.5 rounded-xl shrink-0 ${
              criticalCount > 0 ? 'bg-rose-600 text-white animate-pulse' : 'bg-amber-500 text-white'
            }`}
          >
            <AlertCircle className={isSeniorMode ? 'w-7 h-7' : 'w-6 h-6'} />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-black uppercase px-2.5 py-0.5 rounded-full ${
                  criticalCount > 0 ? 'bg-rose-200 text-rose-800' : 'bg-amber-200 text-amber-900'
                }`}
              >
                {criticalCount > 0 ? 'Critical Refill Alert' : 'Low Stock Warning (≤ 2 Days)'}
              </span>
              <span className="text-xs font-bold text-slate-700">
                {lowStockItems.length} {lowStockItems.length === 1 ? 'Medicine' : 'Medicines'}
              </span>
            </div>

            <h3 className={`font-bold text-slate-900 mt-1 ${isSeniorMode ? 'text-xl' : 'text-base'}`}>
              Supply runs out in 2 days or less
            </h3>
            <p className={`text-slate-600 ${isSeniorMode ? 'text-base' : 'text-xs'}`}>
              Refill order recommended now to prevent medication interruption.
            </p>
          </div>
        </div>
      </div>

      {refillSuccessMsg && (
        <div className="mt-3 p-2.5 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-medium flex items-center gap-2 animate-fadeIn">
          <PackageCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{refillSuccessMsg}</span>
        </div>
      )}

      {/* Low stock item list */}
      <div className="mt-3 space-y-2">
        {lowStockItems.map(({ medicine, daysLeft, isCritical }) => (
          <div
            key={medicine.id}
            className="p-3 bg-white/95 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-xs"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm truncate">{medicine.name}</span>
                <span className="text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded font-mono">
                  {medicine.dosage}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1 text-xs">
                <span
                  className={`font-semibold px-2 py-0.5 rounded-full ${
                    isCritical
                      ? 'bg-rose-100 text-rose-800 font-bold'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {daysLeft <= 0 ? 'DEPLETED TODAY' : `${daysLeft} Day${daysLeft === 1 ? '' : 's'} Supply Left`}
                </span>
                <span className="text-slate-500">
                  Only <strong>{medicine.remainingStock}</strong> {medicine.form}s in stock
                </span>
              </div>
            </div>

            {/* Quick Actions per medicine */}
            <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
              <button
                onClick={() => calendarService.downloadRefillReminderICS(medicine)}
                title="Add Refill Alert to Calendar (.ics)"
                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors text-xs flex items-center gap-1"
              >
                <CalendarPlus className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Calendar</span>
              </button>
              <button
                onClick={() => handleQuickRestock(medicine.id, 10)}
                title="Mark Refilled (+10 units)"
                className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 font-medium transition-colors text-xs flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+10 Refill</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Master WhatsApp Refill Call to Action */}
      <div className="mt-3 pt-3 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-2.5">
        <div className="text-xs text-slate-600">
          <span>Target Pharmacy: <strong>CVS Caremark / Local Chemist</strong></span>
        </div>

        <button
          onClick={handleWhatsAppRefill}
          className={`w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-sm flex items-center justify-center gap-2 ${
            isSeniorMode ? 'text-base py-3' : 'text-xs'
          }`}
        >
          <MessageCircle className={isSeniorMode ? 'w-5 h-5' : 'w-4 h-4'} />
          <span>Quick Refill via WhatsApp</span>
          <ChevronRight className="w-4 h-4 opacity-70" />
        </button>
      </div>
    </div>
  );
};
