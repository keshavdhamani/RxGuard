import React, { useState } from 'react';
import { X, Check, PackagePlus, AlertCircle, Sparkles, ShieldCheck } from 'lucide-react';
import { PrescriptionAnalysisResult, Medicine, TimingSlot } from '../types';

interface Props {
  scannedResult: PrescriptionAnalysisResult;
  onSave: (medicines: Medicine[], contraindications: any[], doctorAppt: any) => void;
  onClose: () => void;
  isSeniorMode?: boolean;
}

export const InventoryModal: React.FC<Props> = ({ scannedResult, onSave, onClose, isSeniorMode = false }) => {
  // Initialize editable inventory states based on scanned data
  const [items, setItems] = useState<Medicine[]>(() => {
    return scannedResult.medicines.map((med, idx) => {
      const dosesPerDay = Math.max(1, med.timing.length);
      const calculatedStock = dosesPerDay * (med.durationDays || 5);
      return {
        ...med,
        id: `med-${Date.now()}-${idx}`,
        totalStock: calculatedStock,
        remainingStock: calculatedStock,
        dosesPerDay,
        expiryWarningDays: 2, // Threshold default: 2 days left
        startDate: new Date().toISOString(),
      };
    });
  });

  const handleStockChange = (idx: number, newStock: number) => {
    const updated = [...items];
    const val = Math.max(1, newStock);
    updated[idx].totalStock = val;
    updated[idx].remainingStock = val;
    setItems(updated);
  };

  const handleThresholdChange = (idx: number, days: number) => {
    const updated = [...items];
    updated[idx].expiryWarningDays = Math.max(1, days);
    setItems(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const doctorAppt = {
      doctorName: scannedResult.doctorName,
      clinicName: scannedResult.clinicOrHospital || 'General Practice Clinic',
      date: scannedResult.nextAppointmentDate || new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
      time: '10:00 AM',
      phone: '+1 (555) 234-5678',
      notes: scannedResult.diagnosis || 'Routine Follow-up',
    };

    onSave(items, scannedResult.contraindications || [], doctorAppt);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8 animate-fadeIn">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-indigo-900 to-blue-900 text-white flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <PackagePlus className="w-5 h-5 text-indigo-300" />
              <span className="text-xs uppercase font-bold tracking-wider text-indigo-200">
                Step 2: Inventory Onboarding
              </span>
            </div>
            <h2 className="text-xl font-black mt-1">Confirm Pharmacy Stock Purchased</h2>
            <p className="text-xs text-indigo-200 mt-0.5">
              Verify actual physical counts purchased from chemist to calibrate auto-decrement
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="text-xs text-slate-500 bg-blue-50 p-3 rounded-xl border border-blue-100 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <span>
              We calculated initial stock counts based on <strong>daily dosage × duration</strong>. Adjust if the pharmacist dispensed a different blister pack size (e.g., 10 or 14 tablets).
            </span>
          </div>

          <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
            {items.map((item, idx) => (
              <div
                key={item.id}
                className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{item.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                      <span className="font-mono bg-white px-1.5 py-0.5 rounded border text-slate-700">
                        {item.dosage}
                      </span>
                      <span>•</span>
                      <span>{item.dosesPerDay} dose(s)/day</span>
                      <span>•</span>
                      <span>{item.durationDays} day course</span>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                    {item.foodRelation.replace('_', ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200/80">
                  {/* Total Purchased Stock */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Purchased Stock ({item.form}s)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max="500"
                        value={item.totalStock}
                        onChange={(e) => handleStockChange(idx, parseInt(e.target.value) || 1)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <span className="text-[10px] text-slate-400">
                      ~{Math.floor(item.totalStock / item.dosesPerDay)} days of supply
                    </span>
                  </div>

                  {/* Refill Threshold */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Low-Stock Warning Days
                    </label>
                    <select
                      value={item.expiryWarningDays}
                      onChange={(e) => handleThresholdChange(idx, parseInt(e.target.value) || 2)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="1">1 Day Left</option>
                      <option value="2">2 Days Left (Standard)</option>
                      <option value="3">3 Days Left</option>
                      <option value="5">5 Days Left</option>
                    </select>
                    <span className="text-[10px] text-slate-400">
                      Triggers WhatsApp refill button
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all shadow-md flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Confirm &amp; Generate Schedule</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
