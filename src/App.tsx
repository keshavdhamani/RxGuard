/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  CalendarClock,
  Camera,
  Package,
  HeartHandshake,
  ShieldAlert,
  Sparkles,
  Volume2,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

import {
  Medicine,
  Contraindication,
  DoctorAppointment,
  CaregiverInfo,
  PrescriptionAnalysisResult,
  DoseScheduleItem,
} from './types';
import { storageService, generateDayTimeline } from './services/storageService';
import { Header } from './components/Header';
import { DailyTimeline } from './components/DailyTimeline';
import { PrescriptionScanner } from './components/PrescriptionScanner';
import { ContraindicationBanner } from './components/ContraindicationBanner';
import { LowStockCard } from './components/LowStockCard';
import { DoctorAppointmentCard } from './components/DoctorAppointmentCard';
import { InventoryModal } from './components/InventoryModal';
import { InventoryManager } from './components/InventoryManager';
import { CaregiverSOSModal } from './components/CaregiverSOSModal';
import { ArchitectureModal } from './components/ArchitectureModal';
import { MobileFrame } from './components/MobileFrame';

export default function App() {
  const [todayDateStr] = useState<string>(() => new Date().toISOString().split('T')[0]);

  // Core State
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [contraindications, setContraindications] = useState<Contraindication[]>([]);
  const [appointment, setAppointment] = useState<DoctorAppointment>(storageService.getAppointment());
  const [caregiver, setCaregiver] = useState<CaregiverInfo>(storageService.getCaregiver());
  const [pharmacy, setPharmacy] = useState(storageService.getPharmacy());
  const [doseLogs, setDoseLogs] = useState<Record<string, boolean>>({});

  // UI state
  const [activeTab, setActiveTab] = useState<'timeline' | 'scanner' | 'cabinet'>('timeline');
  const [isSeniorMode, setIsSeniorMode] = useState<boolean>(() => storageService.getSeniorMode());
  const [viewMode, setViewMode] = useState<'mobile' | 'full'>(() => storageService.getViewMode());
  const [scannedResult, setScannedResult] = useState<PrescriptionAnalysisResult | null>(null);
  const [showSOSModal, setShowSOSModal] = useState<boolean>(false);
  const [showArchModal, setShowArchModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initialize data on mount
  useEffect(() => {
    loadAllData();
  }, [todayDateStr]);

  const loadAllData = () => {
    const meds = storageService.getMedicines();
    setMedicines(meds);
    setContraindications(storageService.getContraindications());
    setAppointment(storageService.getAppointment());
    setCaregiver(storageService.getCaregiver());
    setPharmacy(storageService.getPharmacy());
    setDoseLogs(storageService.getDoseLogs(todayDateStr));
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Real-time dose toggle & Inventory Decrement (Requirement #3)
  const handleToggleDose = (dose: DoseScheduleItem, taken: boolean) => {
    // 1. Update logs
    storageService.setDoseTaken(todayDateStr, dose.id, taken);
    setDoseLogs((prev) => ({ ...prev, [dose.id]: taken }));

    // 2. Decrement or restore inventory in real-time
    if (taken) {
      const updated = storageService.decrementStock(dose.medicineId, 1);
      if (updated) {
        setMedicines([...storageService.getMedicines()]);
        showToast(`Dose taken: Decremented ${updated.name} inventory (Remaining: ${updated.remainingStock})`);
      }
    } else {
      const restored = storageService.incrementStock(dose.medicineId, 1);
      if (restored) {
        setMedicines([...storageService.getMedicines()]);
        showToast(`Dose unchecked: Restored ${restored.name} inventory`);
      }
    }
  };

  // Save new onboarded inventory from scanner (Requirement #2)
  const handleSaveInventory = (
    newMeds: Medicine[],
    newContraindications: Contraindication[],
    newAppt: DoctorAppointment
  ) => {
    // Merge or replace
    const currentMeds = storageService.getMedicines();
    // Add new medicines
    newMeds.forEach((nm) => {
      const idx = currentMeds.findIndex((m) => m.name.toLowerCase() === nm.name.toLowerCase());
      if (idx >= 0) {
        currentMeds[idx] = nm;
      } else {
        currentMeds.push(nm);
      }
    });

    storageService.saveMedicines(currentMeds);
    storageService.saveContraindications(newContraindications);
    storageService.saveAppointment(newAppt);

    setMedicines([...currentMeds]);
    setContraindications(newContraindications);
    setAppointment(newAppt);

    setScannedResult(null);
    setActiveTab('timeline');
    showToast('Prescription inventory saved! Schedule generated on your timeline.');
  };

  const handleToggleSeniorMode = () => {
    const next = !isSeniorMode;
    setIsSeniorMode(next);
    storageService.setSeniorMode(next);
  };

  const handleToggleViewMode = () => {
    const next = viewMode === 'mobile' ? 'full' : 'mobile';
    setViewMode(next);
    storageService.setViewMode(next);
  };

  const handleResetDemo = () => {
    if (confirm('Reset to standard rich demo data with active contraindication & 2-day low-stock scenario?')) {
      storageService.resetToDemo();
      loadAllData();
      showToast('Reset to demo scenario successfully!');
    }
  };

  // Computations
  const timeline = generateDayTimeline(medicines, todayDateStr, doseLogs);
  const lowStockItems = storageService.getLowStockMedicines();
  const unreadAlerts = lowStockItems.length + (contraindications.some((c) => c.severity === 'High') ? 1 : 0);

  return (
    <div
      className={`min-h-screen text-slate-900 transition-colors ${
        isSeniorMode ? 'bg-amber-50/40 text-[18px]' : 'bg-slate-100/70'
      }`}
    >
      <MobileFrame viewMode={viewMode}>
        <div className="flex flex-col min-h-full">
          {/* Header */}
          <Header
            isSeniorMode={isSeniorMode}
            onToggleSeniorMode={handleToggleSeniorMode}
            viewMode={viewMode}
            onToggleViewMode={handleToggleViewMode}
            onOpenSOS={() => setShowSOSModal(true)}
            onOpenArch={() => setShowArchModal(true)}
            onResetDemo={handleResetDemo}
            unreadCount={unreadAlerts}
          />

          {/* Toast Notification */}
          {toastMessage && (
            <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-slate-900/90 text-white rounded-full text-xs font-semibold shadow-lg backdrop-blur-xs flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Main App Body */}
          <main className="flex-1 p-4 pb-24 max-w-4xl mx-auto w-full space-y-4">
            {/* Top Critical Safety Banners */}
            <ContraindicationBanner
              contraindications={contraindications}
              isSeniorMode={isSeniorMode}
            />

            {/* Low-Stock & WhatsApp Refill Alerts */}
            <LowStockCard
              lowStockItems={lowStockItems}
              pharmacyPhone={pharmacy.phone}
              patientName="Alex Morgan"
              isSeniorMode={isSeniorMode}
              onStockUpdated={() => setMedicines(storageService.getMedicines())}
            />

            {/* Doctor Follow-up Appointment Tracker */}
            <DoctorAppointmentCard
              appointment={appointment}
              isSeniorMode={isSeniorMode}
            />

            {/* Active Tab View */}
            {activeTab === 'timeline' && (
              <DailyTimeline
                timeline={timeline}
                onToggleDose={handleToggleDose}
                isSeniorMode={isSeniorMode}
              />
            )}

            {activeTab === 'scanner' && (
              <PrescriptionScanner
                onAnalysisComplete={(result) => setScannedResult(result)}
                isSeniorMode={isSeniorMode}
              />
            )}

            {activeTab === 'cabinet' && (
              <InventoryManager
                medicines={medicines}
                onMedicinesChanged={() => setMedicines(storageService.getMedicines())}
                isSeniorMode={isSeniorMode}
              />
            )}
          </main>

          {/* Bottom Navigation Bar */}
          <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 py-1.5 px-4 max-w-4xl mx-auto shadow-lg">
            <div className="flex items-center justify-around">
              <button
                onClick={() => setActiveTab('timeline')}
                className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all ${
                  activeTab === 'timeline'
                    ? 'text-blue-600 font-bold scale-105'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <CalendarClock className={isSeniorMode ? 'w-6 h-6' : 'w-5 h-5'} />
                <span className={`mt-0.5 ${isSeniorMode ? 'text-xs font-bold' : 'text-[11px]'}`}>
                  Timeline
                </span>
              </button>

              <button
                onClick={() => setActiveTab('scanner')}
                className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all relative ${
                  activeTab === 'scanner'
                    ? 'text-indigo-600 font-bold scale-105'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <div className="p-1 rounded-full bg-indigo-50">
                  <Camera className={isSeniorMode ? 'w-6 h-6' : 'w-5 h-5'} />
                </div>
                <span className={`mt-0.5 ${isSeniorMode ? 'text-xs font-bold' : 'text-[11px]'}`}>
                  AI Scanner
                </span>
              </button>

              <button
                onClick={() => setActiveTab('cabinet')}
                className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all relative ${
                  activeTab === 'cabinet'
                    ? 'text-emerald-600 font-bold scale-105'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Package className={isSeniorMode ? 'w-6 h-6' : 'w-5 h-5'} />
                <span className={`mt-0.5 ${isSeniorMode ? 'text-xs font-bold' : 'text-[11px]'}`}>
                  Cabinet
                </span>
                {lowStockItems.length > 0 && (
                  <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                )}
              </button>

              <button
                onClick={() => setShowSOSModal(true)}
                className="flex flex-col items-center py-1 px-3 rounded-xl text-rose-600 hover:text-rose-700 transition-all"
              >
                <HeartHandshake className={isSeniorMode ? 'w-6 h-6' : 'w-5 h-5'} />
                <span className={`mt-0.5 ${isSeniorMode ? 'text-xs font-bold' : 'text-[11px]'}`}>
                  SOS Care
                </span>
              </button>
            </div>
          </nav>

          {/* Modals */}
          {scannedResult && (
            <InventoryModal
              scannedResult={scannedResult}
              onSave={handleSaveInventory}
              onClose={() => setScannedResult(null)}
              isSeniorMode={isSeniorMode}
            />
          )}

          {showSOSModal && (
            <CaregiverSOSModal
              caregiver={caregiver}
              doses={timeline}
              lowStockItems={lowStockItems}
              appointment={appointment}
              patientName="Alex Morgan"
              onUpdateCaregiver={(cg) => setCaregiver(cg)}
              onClose={() => setShowSOSModal(false)}
            />
          )}

          {showArchModal && (
            <ArchitectureModal onClose={() => setShowArchModal(false)} />
          )}
        </div>
      </MobileFrame>
    </div>
  );
}
