import { Medicine, Contraindication, DoctorAppointment } from '../types';

export interface PresetPrescription {
  id: string;
  title: string;
  subtitle: string;
  doctor: string;
  specialty: string;
  clinic: string;
  riskBadge: 'High Risk' | 'Moderate Risk' | 'Safe Course';
  sampleType: 'handwritten' | 'typed' | 'bottle';
  description: string;
  imageThumbnail: string;
}

export const PRESET_PRESCRIPTIONS: PresetPrescription[] = [
  {
    id: 'sample_handwritten',
    title: 'Dr. Marcus Sterling - Acute Sinusitis',
    subtitle: 'Messy cursive handwritten prescription note',
    doctor: 'Dr. Marcus Sterling, MD',
    specialty: 'Internal Medicine & Urgent Care',
    clinic: 'St. Jude General Practice & Urgent Care',
    riskBadge: 'High Risk',
    sampleType: 'handwritten',
    description: 'Contains Amoxicillin 500mg, Omeprazole 20mg, Paracetamol 650mg, and Cetirizine 10mg. Includes high-risk drug interaction between Omeprazole and Amoxicillin timing.',
    imageThumbnail: 'prescription_handwritten_thumb',
  },
  {
    id: 'cardio_contraindication',
    title: 'Dr. Arthur Vance - Cardiac & HTN Care',
    subtitle: 'Post-stent coronary regimen with severe interaction',
    doctor: 'Dr. Arthur Vance, MD (Cardiology)',
    specialty: 'Cardiovascular Institute',
    clinic: 'Metropolitan Heart & Vascular Institute',
    riskBadge: 'High Risk',
    sampleType: 'typed',
    description: 'Contains Lisinopril 10mg, Aspirin Cardio 81mg, Atorvastatin 20mg, and flagged acute Ibuprofen 400mg. Severe bleeding and renal contraindication alert triggered.',
    imageThumbnail: 'cardio_rx_thumb',
  },
  {
    id: 'pediatric_infection',
    title: 'Dr. Emily Chen - Pediatric Course',
    subtitle: 'Bacterial Otitis Media dual oral suspension',
    doctor: 'Dr. Emily Chen, MD (Pediatrics)',
    specialty: 'Pediatric Care',
    clinic: 'Sunrise Children’s Health Center',
    riskBadge: 'Moderate Risk',
    sampleType: 'bottle',
    description: 'Contains Augmentin 400mg/5ml and Paracetamol Oral Suspension. Flags critical 4-6 hour dosing interval rules for children.',
    imageThumbnail: 'bottle_rx_thumb',
  },
];

export const INITIAL_DEMO_MEDICINES: Medicine[] = [
  {
    id: 'med-amox-1',
    name: 'Amoxicillin Trihydrate',
    dosage: '500mg',
    form: 'capsule',
    timing: ['morning', 'night'],
    foodRelation: 'after_meal',
    durationDays: 5,
    instructions: 'Take 1 capsule twice daily after meals. Complete the entire 5-day course.',
    purpose: 'Antibiotic for Respiratory Tract',
    totalStock: 10,
    remainingStock: 4, // 2 days left (dosesPerDay is 2, 4/2 = 2 days -> triggers low stock alert!)
    dosesPerDay: 2,
    expiryWarningDays: 2,
    startDate: new Date().toISOString(),
  },
  {
    id: 'med-omep-2',
    name: 'Omeprazole',
    dosage: '20mg',
    form: 'capsule',
    timing: ['morning'],
    foodRelation: 'before_meal',
    durationDays: 7,
    instructions: 'Take 1 capsule 30 minutes before breakfast with a glass of water.',
    purpose: 'Acid Reflux & Stomach Protection',
    totalStock: 7,
    remainingStock: 6,
    dosesPerDay: 1,
    expiryWarningDays: 2,
    startDate: new Date().toISOString(),
  },
  {
    id: 'med-para-3',
    name: 'Paracetamol (Acetaminophen)',
    dosage: '650mg',
    form: 'tablet',
    timing: ['morning', 'afternoon', 'night'],
    foodRelation: 'after_meal',
    durationDays: 3,
    instructions: 'Take 1 tablet every 8 hours after food as needed for fever or headache.',
    purpose: 'Pain & Fever Relief',
    totalStock: 9,
    remainingStock: 2, // 2 doses left, dosesPerDay is 3 (less than 1 day supply! Critical low stock!)
    dosesPerDay: 3,
    expiryWarningDays: 2,
    startDate: new Date().toISOString(),
  },
  {
    id: 'med-ceti-4',
    name: 'Cetirizine HCl',
    dosage: '10mg',
    form: 'tablet',
    timing: ['night'],
    foodRelation: 'anytime',
    durationDays: 5,
    instructions: 'Take 1 tablet at bedtime. May cause mild drowsiness.',
    purpose: 'Allergy & Congestion Relief',
    totalStock: 5,
    remainingStock: 4,
    dosesPerDay: 1,
    expiryWarningDays: 2,
    startDate: new Date().toISOString(),
  },
];

export const INITIAL_DEMO_CONTRAINDICATIONS: Contraindication[] = [
  {
    severity: 'High',
    message: 'High-Risk Timing Interaction: Omeprazole must be taken on an empty stomach at least 30-45 minutes before Amoxicillin or food.',
    involvedDrugs: ['Omeprazole', 'Amoxicillin Trihydrate'],
    clinicalAdvice: 'Taking simultaneously reduces gastric acid necessary for optimal antibiotic dissolution. Space doses appropriately as scheduled on your timeline.',
  },
  {
    severity: 'Moderate',
    message: 'Do not combine Paracetamol with any other OTC cold/cough syrups containing acetaminophen.',
    involvedDrugs: ['Paracetamol (Acetaminophen)'],
    clinicalAdvice: 'Exceeding 3,000mg total acetaminophen in 24 hours can cause acute hepatic toxicity.',
  },
];

export const INITIAL_DEMO_APPOINTMENT: DoctorAppointment = {
  doctorName: 'Dr. Marcus Sterling, MD',
  clinicName: 'St. Jude General Practice & Urgent Care',
  date: new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0], // 4 days from today
  time: '10:30 AM',
  phone: '+1 (555) 234-5678',
  notes: 'Post-antibiotic follow-up. Check sinus congestion and clear lung sounds.',
};
