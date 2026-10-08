export type TimingSlot = 'morning' | 'afternoon' | 'evening' | 'night';
export type FoodRelation = 'before_meal' | 'after_meal' | 'with_meal' | 'anytime';
export type SeverityLevel = 'High' | 'Moderate' | 'Low';

export interface Medicine {
  id: string;
  name: string;
  dosage: string;
  form: 'tablet' | 'capsule' | 'syrup' | 'inhaler' | 'injection' | 'drops' | 'other';
  timing: TimingSlot[];
  foodRelation: FoodRelation;
  durationDays: number;
  instructions?: string;
  purpose?: string;
  // Inventory tracking
  totalStock: number;
  remainingStock: number;
  dosesPerDay: number;
  expiryWarningDays: number; // Low stock threshold in days (default: 2)
  startDate: string; // ISO date
  prescriptionId?: string;
}

export interface Contraindication {
  id?: string;
  severity: SeverityLevel;
  message: string;
  involvedDrugs?: string[];
  clinicalAdvice?: string;
}

export interface PrescriptionAnalysisResult {
  doctorName: string;
  clinicOrHospital?: string;
  prescriptionDate?: string;
  nextAppointmentDate?: string;
  patientName?: string;
  diagnosis?: string;
  contraindications: Contraindication[];
  medicines: Array<Omit<Medicine, 'id' | 'totalStock' | 'remainingStock' | 'dosesPerDay' | 'expiryWarningDays' | 'startDate'>>;
  isMockFallback?: boolean;
  notes?: string;
}

export interface DoseScheduleItem {
  id: string;
  medicineId: string;
  medicineName: string;
  dosage: string;
  form: string;
  slot: TimingSlot;
  timeLabel: string;
  scheduledTime: string; // e.g. "08:00 AM"
  foodRelation: FoodRelation;
  foodLabel: string;
  taken: boolean;
  takenAt?: string;
  dateStr: string; // YYYY-MM-DD
  instructions?: string;
}

export interface DoctorAppointment {
  doctorName: string;
  clinicName: string;
  date: string; // YYYY-MM-DD
  time?: string;
  phone?: string;
  notes?: string;
}

export interface CaregiverInfo {
  name: string;
  phone: string;
  relation: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}
