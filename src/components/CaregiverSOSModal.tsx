import React, { useState } from 'react';
import { X, HeartHandshake, Phone, MessageCircle, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { CaregiverInfo, DoseScheduleItem, Medicine, DoctorAppointment } from '../types';
import { formatWhatsAppCaregiverSOSMessage } from '../utils/whatsapp';
import { storageService } from '../services/storageService';

interface Props {
  caregiver: CaregiverInfo;
  doses: DoseScheduleItem[];
  lowStockItems: Array<{ medicine: Medicine; daysLeft: number }>;
  appointment: DoctorAppointment;
  patientName?: string;
  onUpdateCaregiver: (caregiver: CaregiverInfo) => void;
  onClose: () => void;
}

export const CaregiverSOSModal: React.FC<Props> = ({
  caregiver,
  doses,
  lowStockItems,
  appointment,
  patientName = 'Alex Morgan',
  onUpdateCaregiver,
  onClose,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<CaregiverInfo>(caregiver);

  const takenCount = doses.filter((d) => d.taken).length;
  const totalCount = doses.length;
  const adherencePercent = totalCount > 0 ? Math.round((takenCount / totalCount) * 100) : 100;

  const handleSendWhatsAppSOS = () => {
    const url = formatWhatsAppCaregiverSOSMessage(
      caregiver,
      patientName,
      doses,
      lowStockItems,
      appointment
    );
    window.open(url, '_blank');
  };

  const handleSaveCaregiver = (e: React.FormEvent) => {
    e.preventDefault();
    storageService.saveCaregiver(formData);
    onUpdateCaregiver(formData);
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden my-8 animate-fadeIn">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-rose-700 to-red-800 text-white flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/20">
              <HeartHandshake className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-black tracking-widest text-rose-200">
                Senior Accessibility Feature
              </span>
              <h2 className="text-xl font-black">Emergency Caretaker SOS</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Adherence Health Card */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase">Current Patient</span>
                <div className="text-base font-black text-slate-900">{patientName}</div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-slate-500 uppercase">Today's Adherence</span>
                <div className="text-lg font-black text-emerald-600">{adherencePercent}%</div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-200/80 text-xs text-slate-600 space-y-1">
              <div className="flex justify-between">
                <span>Completed Doses:</span>
                <span className="font-bold text-slate-900">{takenCount} of {totalCount} taken</span>
              </div>
              {lowStockItems.length > 0 && (
                <div className="flex justify-between text-rose-700 font-semibold">
                  <span>Low Stock Warnings:</span>
                  <span>{lowStockItems.length} med(s) require refilling</span>
                </div>
              )}
            </div>
          </div>

          {/* Caregiver Contact Card */}
          {!isEditing ? (
            <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-rose-700">
                    Primary Caregiver on File
                  </span>
                  <div className="text-base font-bold text-slate-900 mt-0.5">{caregiver.name}</div>
                  <div className="text-xs text-slate-600">{caregiver.relation}</div>
                  <div className="text-xs font-mono text-slate-800 font-bold mt-1">{caregiver.phone}</div>
                </div>

                <button
                  onClick={() => setIsEditing(true)}
                  className="text-xs font-bold text-rose-700 hover:text-rose-900 underline"
                >
                  Edit Contact
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSaveCaregiver} className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <h4 className="text-xs font-bold text-slate-800 uppercase">Update Caregiver Contact</h4>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-0.5">Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-medium"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-0.5">Relation</label>
                <input
                  type="text"
                  value={formData.relation}
                  onChange={(e) => setFormData({ ...formData, relation: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-medium"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-0.5">WhatsApp / Phone Number</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-medium font-mono"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 rounded-lg border text-xs text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-bold text-xs"
                >
                  Save Caregiver
                </button>
              </div>
            </form>
          )}

          {/* Action Trigger Buttons */}
          <div className="space-y-2 pt-2">
            <button
              onClick={handleSendWhatsAppSOS}
              className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm transition-all shadow-md flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Share Adherence Summary via WhatsApp</span>
            </button>

            <a
              href={`tel:${caregiver.phone}`}
              className="w-full py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-sm transition-all flex items-center justify-center gap-2 border border-slate-300"
            >
              <Phone className="w-4 h-4 text-slate-700" />
              <span>Call Caregiver Directly ({caregiver.phone})</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
