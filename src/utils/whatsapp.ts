import { Medicine, DoseScheduleItem, DoctorAppointment, CaregiverInfo } from '../types';

export function formatWhatsAppRefillMessage(
  pharmacyPhone: string,
  medicinesToRefill: Array<{ medicine: Medicine; daysLeft: number }>,
  patientName = 'Patient'
): string {
  const cleanPhone = pharmacyPhone.replace(/[^\d+]/g, '');

  let text = `🏥 *PRESCRIPTION REFILL ORDER - RxGuard*\n\n`;
  text += `Hello Pharmacy, I need to place an urgent refill order for:\n\n`;

  medicinesToRefill.forEach((item, idx) => {
    const med = item.medicine;
    text += `*${idx + 1}. ${med.name}* (${med.dosage})\n`;
    text += `   • Current Stock: ${med.remainingStock} ${med.form}s left (~${item.daysLeft} day supply)\n`;
    text += `   • Requesting standard pack refill: ${med.totalStock || 30} ${med.form}s\n`;
    if (med.instructions) {
      text += `   • Instructions: ${med.instructions}\n`;
    }
    text += `\n`;
  });

  text += `*Patient Name:* ${patientName}\n`;
  text += `*Generated via:* RxGuard Intelligent Medication Assistant\n`;
  text += `Please confirm receipt and estimated delivery/pickup time. Thank you!`;

  const encoded = encodeURIComponent(text);
  return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encoded}`;
}

export function formatWhatsAppCaregiverSOSMessage(
  caregiver: CaregiverInfo,
  patientName: string,
  doses: DoseScheduleItem[],
  lowStockItems: Array<{ medicine: Medicine; daysLeft: number }>,
  appointment: DoctorAppointment
): string {
  const cleanPhone = caregiver.phone.replace(/[^\d+]/g, '');
  const takenCount = doses.filter((d) => d.taken).length;
  const totalCount = doses.length;
  const adherencePercent = totalCount > 0 ? Math.round((takenCount / totalCount) * 100) : 100;

  let text = `🚨 *RxGUARD CAREGIVER ADHERENCE UPDATE*\n\n`;
  text += `Dear ${caregiver.name} (${caregiver.relation}),\n`;
  text += `Here is the real-time medication & health status for *${patientName}*:\n\n`;

  text += `📊 *Today's Adherence Rate:* ${adherencePercent}% (${takenCount}/${totalCount} doses completed)\n\n`;

  text += `📋 *Today's Schedule:*\n`;
  doses.forEach((d) => {
    const statusIcon = d.taken ? '✅ Taken' : '⏳ Pending';
    text += `• ${d.timeLabel} (${d.scheduledTime}): ${d.medicineName} ${d.dosage} → ${statusIcon}\n`;
  });

  if (lowStockItems.length > 0) {
    text += `\n⚠️ *LOW STOCK REFILL ALERTS:*\n`;
    lowStockItems.forEach((item) => {
      text += `• ${item.medicine.name}: Only ${item.medicine.remainingStock} units left (${item.daysLeft} days remaining)\n`;
    });
  }

  if (appointment) {
    text += `\n🩺 *Next Doctor Appointment:*\n`;
    text += `• ${appointment.doctorName} on *${appointment.date}* at ${appointment.clinicName}\n`;
  }

  text += `\n_Sent instantly via RxGuard SOS Caregiver Module_`;

  const encoded = encodeURIComponent(text);
  return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encoded}`;
}
