import { Medicine, Contraindication, DoctorAppointment, CaregiverInfo, TimingSlot, DoseScheduleItem } from '../types';
import {
  INITIAL_DEMO_MEDICINES,
  INITIAL_DEMO_CONTRAINDICATIONS,
  INITIAL_DEMO_APPOINTMENT,
} from '../data/mockPrescriptions';

const KEYS = {
  MEDICINES: 'rxguard_medicines',
  CONTRAINDICATIONS: 'rxguard_contraindications',
  APPOINTMENT: 'rxguard_appointment',
  DOSE_LOGS: 'rxguard_dose_logs',
  CAREGIVER: 'rxguard_caregiver',
  PHARMACY: 'rxguard_pharmacy',
  SENIOR_MODE: 'rxguard_senior_mode',
  VIEW_MODE: 'rxguard_view_mode', // 'mobile' | 'full'
};

export const DEFAULT_CAREGIVER: CaregiverInfo = {
  name: 'Sarah Morgan',
  phone: '+15559876543',
  relation: 'Daughter / Primary Caregiver',
};

export const DEFAULT_PHARMACY = {
  name: 'CVS Caremark / Walgreens Express',
  phone: '+15553334444',
};

export const storageService = {
  // Load medicines with fallback to initial seed
  getMedicines(): Medicine[] {
    try {
      const stored = localStorage.getItem(KEYS.MEDICINES);
      if (stored) {
        return JSON.parse(stored);
      }
      this.saveMedicines(INITIAL_DEMO_MEDICINES);
      return INITIAL_DEMO_MEDICINES;
    } catch (e) {
      console.error('Error reading medicines from storage:', e);
      return INITIAL_DEMO_MEDICINES;
    }
  },

  saveMedicines(medicines: Medicine[]): void {
    try {
      localStorage.setItem(KEYS.MEDICINES, JSON.stringify(medicines));
    } catch (e) {
      console.error('Error saving medicines:', e);
    }
  },

  addOrUpdateMedicine(medicine: Medicine): void {
    const list = this.getMedicines();
    const index = list.findIndex((m) => m.id === medicine.id);
    if (index >= 0) {
      list[index] = medicine;
    } else {
      list.push(medicine);
    }
    this.saveMedicines(list);
  },

  deleteMedicine(id: string): void {
    const list = this.getMedicines().filter((m) => m.id !== id);
    this.saveMedicines(list);
  },

  // Real-time Inventory Decrement logic
  decrementStock(medicineId: string, amount = 1): Medicine | null {
    const list = this.getMedicines();
    const target = list.find((m) => m.id === medicineId);
    if (!target) return null;

    target.remainingStock = Math.max(0, target.remainingStock - amount);
    this.saveMedicines(list);
    return target;
  },

  // Inventory Restore logic (e.g. if user unticks a dose)
  incrementStock(medicineId: string, amount = 1): Medicine | null {
    const list = this.getMedicines();
    const target = list.find((m) => m.id === medicineId);
    if (!target) return null;

    target.remainingStock = Math.min(target.totalStock, target.remainingStock + amount);
    this.saveMedicines(list);
    return target;
  },

  // Low-Stock Computation logic (threshold: <= 2 days of supply remaining)
  getLowStockMedicines(): Array<{ medicine: Medicine; daysLeft: number; isCritical: boolean }> {
    const list = this.getMedicines();
    return list
      .map((med) => {
        const dailyRequirement = Math.max(1, med.dosesPerDay || med.timing.length || 1);
        const daysLeft = Math.floor(med.remainingStock / dailyRequirement);
        const threshold = med.expiryWarningDays || 2;
        const isLow = daysLeft <= threshold;
        const isCritical = daysLeft <= 1 || med.remainingStock <= 1;
        return {
          medicine: med,
          daysLeft,
          isLow,
          isCritical,
        };
      })
      .filter((item) => item.isLow);
  },

  // Contraindications
  getContraindications(): Contraindication[] {
    try {
      const stored = localStorage.getItem(KEYS.CONTRAINDICATIONS);
      if (stored) return JSON.parse(stored);
      this.saveContraindications(INITIAL_DEMO_CONTRAINDICATIONS);
      return INITIAL_DEMO_CONTRAINDICATIONS;
    } catch {
      return INITIAL_DEMO_CONTRAINDICATIONS;
    }
  },

  saveContraindications(list: Contraindication[]): void {
    try {
      localStorage.setItem(KEYS.CONTRAINDICATIONS, JSON.stringify(list));
    } catch (e) {
      console.error(e);
    }
  },

  // Doctor Appointment
  getAppointment(): DoctorAppointment {
    try {
      const stored = localStorage.getItem(KEYS.APPOINTMENT);
      if (stored) return JSON.parse(stored);
      this.saveAppointment(INITIAL_DEMO_APPOINTMENT);
      return INITIAL_DEMO_APPOINTMENT;
    } catch {
      return INITIAL_DEMO_APPOINTMENT;
    }
  },

  saveAppointment(appt: DoctorAppointment): void {
    try {
      localStorage.setItem(KEYS.APPOINTMENT, JSON.stringify(appt));
    } catch (e) {
      console.error(e);
    }
  },

  // Dose logs for today (key formatted by YYYY-MM-DD)
  getDoseLogs(dateKey: string): Record<string, boolean> {
    try {
      const all = localStorage.getItem(KEYS.DOSE_LOGS);
      const parsed = all ? JSON.parse(all) : {};
      return parsed[dateKey] || {};
    } catch {
      return {};
    }
  },

  setDoseTaken(dateKey: string, doseId: string, taken: boolean): void {
    try {
      const all = localStorage.getItem(KEYS.DOSE_LOGS);
      const parsed = all ? JSON.parse(all) : {};
      if (!parsed[dateKey]) parsed[dateKey] = {};
      parsed[dateKey][doseId] = taken;
      localStorage.setItem(KEYS.DOSE_LOGS, JSON.stringify(parsed));
    } catch (e) {
      console.error(e);
    }
  },

  // Caregiver
  getCaregiver(): CaregiverInfo {
    try {
      const stored = localStorage.getItem(KEYS.CAREGIVER);
      return stored ? JSON.parse(stored) : DEFAULT_CAREGIVER;
    } catch {
      return DEFAULT_CAREGIVER;
    }
  },

  saveCaregiver(caregiver: CaregiverInfo): void {
    try {
      localStorage.setItem(KEYS.CAREGIVER, JSON.stringify(caregiver));
    } catch (e) {
      console.error(e);
    }
  },

  // Pharmacy
  getPharmacy(): { name: string; phone: string } {
    try {
      const stored = localStorage.getItem(KEYS.PHARMACY);
      return stored ? JSON.parse(stored) : DEFAULT_PHARMACY;
    } catch {
      return DEFAULT_PHARMACY;
    }
  },

  savePharmacy(pharmacy: { name: string; phone: string }): void {
    try {
      localStorage.setItem(KEYS.PHARMACY, JSON.stringify(pharmacy));
    } catch (e) {
      console.error(e);
    }
  },

  // Accessibility: Senior Mode
  getSeniorMode(): boolean {
    return localStorage.getItem(KEYS.SENIOR_MODE) === 'true';
  },

  setSeniorMode(val: boolean): void {
    localStorage.setItem(KEYS.SENIOR_MODE, val ? 'true' : 'false');
  },

  // Viewport mode: 'mobile' vs 'full'
  getViewMode(): 'mobile' | 'full' {
    const val = localStorage.getItem(KEYS.VIEW_MODE);
    return val === 'full' ? 'full' : 'mobile';
  },

  setViewMode(mode: 'mobile' | 'full'): void {
    localStorage.setItem(KEYS.VIEW_MODE, mode);
  },

  // Reset to initial rich demo data
  resetToDemo(): void {
    localStorage.removeItem(KEYS.MEDICINES);
    localStorage.removeItem(KEYS.CONTRAINDICATIONS);
    localStorage.removeItem(KEYS.APPOINTMENT);
    localStorage.removeItem(KEYS.DOSE_LOGS);
    this.saveMedicines(INITIAL_DEMO_MEDICINES);
    this.saveContraindications(INITIAL_DEMO_CONTRAINDICATIONS);
    this.saveAppointment(INITIAL_DEMO_APPOINTMENT);
  },
};

// Auto-generate interactive timeline items for a given date
export function generateDayTimeline(
  medicines: Medicine[],
  dateStr: string,
  doseLogs: Record<string, boolean>
): DoseScheduleItem[] {
  const items: DoseScheduleItem[] = [];

  const slotConfig: Record<TimingSlot, { timeLabel: string; scheduledTime: string; order: number }> = {
    morning: { timeLabel: 'Morning Dose', scheduledTime: '08:00 AM', order: 1 },
    afternoon: { timeLabel: 'Afternoon Dose', scheduledTime: '01:00 PM', order: 2 },
    evening: { timeLabel: 'Evening Dose', scheduledTime: '07:00 PM', order: 3 },
    night: { timeLabel: 'Bedtime Dose', scheduledTime: '10:00 PM', order: 4 },
  };

  const foodLabels = {
    before_meal: '30 mins Before Meal',
    after_meal: 'After Food (with water)',
    with_meal: 'Take with Food',
    anytime: 'Anytime with Water',
  };

  medicines.forEach((med) => {
    med.timing.forEach((slot) => {
      const config = slotConfig[slot];
      const doseId = `${dateStr}_${med.id}_${slot}`;
      items.push({
        id: doseId,
        medicineId: med.id,
        medicineName: med.name,
        dosage: med.dosage,
        form: med.form,
        slot,
        timeLabel: config.timeLabel,
        scheduledTime: config.scheduledTime,
        foodRelation: med.foodRelation,
        foodLabel: foodLabels[med.foodRelation] || 'With water',
        taken: Boolean(doseLogs[doseId]),
        dateStr,
        instructions: med.instructions,
      });
    });
  });

  // Sort by slot order
  return items.sort((a, b) => {
    return slotConfig[a.slot].order - slotConfig[b.slot].order;
  });
}
