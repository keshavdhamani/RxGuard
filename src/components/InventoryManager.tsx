import React, { useState } from 'react';
import { Package, Plus, Minus, Trash2, AlertTriangle, CheckCircle, Pill, PlusCircle } from 'lucide-react';
import { Medicine, TimingSlot, FoodRelation } from '../types';
import { storageService } from '../services/storageService';

interface Props {
  medicines: Medicine[];
  onMedicinesChanged: () => void;
  isSeniorMode?: boolean;
}

export const InventoryManager: React.FC<Props> = ({ medicines, onMedicinesChanged, isSeniorMode = false }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMed, setNewMed] = useState({
    name: '',
    dosage: '',
    form: 'tablet' as const,
    timing: ['morning'] as TimingSlot[],
    foodRelation: 'after_meal' as FoodRelation,
    totalStock: 30,
    durationDays: 15,
    instructions: '',
  });

  const handleAdjustStock = (id: string, delta: number) => {
    const med = medicines.find((m) => m.id === id);
    if (!med) return;

    if (delta < 0) {
      storageService.decrementStock(id, Math.abs(delta));
    } else {
      storageService.incrementStock(id, delta);
    }
    onMedicinesChanged();
  };

  const handleDelete = (id: string) => {
    if (confirm('Remove this medicine from your cabinet?')) {
      storageService.deleteMedicine(id);
      onMedicinesChanged();
    }
  };

  const handleCreateMed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMed.name) return;

    const med: Medicine = {
      id: `med-manual-${Date.now()}`,
      name: newMed.name,
      dosage: newMed.dosage || '500mg',
      form: newMed.form,
      timing: newMed.timing,
      foodRelation: newMed.foodRelation,
      durationDays: newMed.durationDays,
      instructions: newMed.instructions,
      totalStock: newMed.totalStock,
      remainingStock: newMed.totalStock,
      dosesPerDay: newMed.timing.length,
      expiryWarningDays: 2,
      startDate: new Date().toISOString(),
    };

    storageService.addOrUpdateMedicine(med);
    onMedicinesChanged();
    setShowAddModal(false);
    setNewMed({
      name: '',
      dosage: '',
      form: 'tablet',
      timing: ['morning'],
      foodRelation: 'after_meal',
      totalStock: 30,
      durationDays: 15,
      instructions: '',
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
              <Package className="w-5 h-5" />
            </span>
            <h2 className={`font-black text-slate-900 ${isSeniorMode ? 'text-2xl' : 'text-lg'}`}>
              Pharmacy Inventory &amp; Stock Cabinet
            </h2>
          </div>
          <p className={`text-slate-500 mt-1 ${isSeniorMode ? 'text-base' : 'text-xs'}`}>
            Live inventory counts automatically synchronized with timeline checkoffs
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-1.5"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Custom Medicine</span>
        </button>
      </div>

      {/* Medicine Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {medicines.map((med) => {
          const dosesPerDay = Math.max(1, med.dosesPerDay || med.timing.length || 1);
          const daysLeft = Math.floor(med.remainingStock / dosesPerDay);
          const isLow = daysLeft <= (med.expiryWarningDays || 2);
          const percentLeft = Math.min(100, Math.round((med.remainingStock / (med.totalStock || 1)) * 100));

          return (
            <div
              key={med.id}
              className={`p-4 rounded-2xl border transition-all ${
                isLow
                  ? 'bg-rose-50/50 border-rose-200 shadow-xs'
                  : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-900 text-base truncate">{med.name}</span>
                    <span className="text-xs font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border">
                      {med.dosage}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {med.form} • {dosesPerDay} dose(s)/day • {med.foodRelation.replace('_', ' ')}
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(med.id)}
                  title="Remove from cabinet"
                  className="text-slate-300 hover:text-rose-600 p-1 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Progress and Stock metrics */}
              <div className="mt-3 bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Remaining Inventory:</span>
                  <div className="flex items-center gap-1 font-bold">
                    <span
                      className={`text-sm ${isLow ? 'text-rose-600 font-black' : 'text-slate-900'}`}
                    >
                      {med.remainingStock}
                    </span>
                    <span className="text-slate-400">/ {med.totalStock} {med.form}s</span>
                  </div>
                </div>

                {/* Visual Bar */}
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      isLow ? 'bg-rose-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${percentLeft}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1">
                  <span
                    className={`font-bold px-2 py-0.5 rounded-full ${
                      isLow ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {isLow ? `⚠️ Low: ${daysLeft} days left` : `✅ Adequate: ~${daysLeft} days`}
                  </span>
                  <span className="text-slate-400">Threshold: {med.expiryWarningDays || 2} days</span>
                </div>
              </div>

              {/* Quick Stepper for physical pill count */}
              <div className="mt-3 flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                <span className="text-xs text-slate-500">Quick Adjust:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAdjustStock(med.id, -1)}
                    disabled={med.remainingStock <= 0}
                    className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 text-slate-700 transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-mono font-bold w-6 text-center">
                    {med.remainingStock}
                  </span>
                  <button
                    onClick={() => handleAdjustStock(med.id, 1)}
                    className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Custom Medicine Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 border border-slate-200 shadow-2xl space-y-4 animate-fadeIn">
            <h3 className="font-bold text-slate-900 text-base">Add New Medicine to Cabinet</h3>
            <form onSubmit={handleCreateMed} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Medicine Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Metformin"
                  value={newMed.name}
                  onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Dosage</label>
                  <input
                    type="text"
                    placeholder="e.g. 500mg"
                    value={newMed.dosage}
                    onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Form</label>
                  <select
                    value={newMed.form}
                    onChange={(e) => setNewMed({ ...newMed, form: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium"
                  >
                    <option value="tablet">Tablet</option>
                    <option value="capsule">Capsule</option>
                    <option value="syrup">Syrup</option>
                    <option value="inhaler">Inhaler</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Total Stock</label>
                  <input
                    type="number"
                    min="1"
                    value={newMed.totalStock}
                    onChange={(e) => setNewMed({ ...newMed, totalStock: parseInt(e.target.value) || 1 })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Relation to Food</label>
                  <select
                    value={newMed.foodRelation}
                    onChange={(e) => setNewMed({ ...newMed, foodRelation: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium"
                  >
                    <option value="after_meal">After Meal</option>
                    <option value="before_meal">Before Meal</option>
                    <option value="with_meal">With Meal</option>
                    <option value="anytime">Anytime</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-xl border text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs"
                >
                  Save Medicine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
