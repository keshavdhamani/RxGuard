import { DoctorAppointment, Medicine } from '../types';

export const calendarService = {
  downloadAppointmentICS(appointment: DoctorAppointment): void {
    const cleanDate = appointment.date.replace(/-/g, '');
    const startTimeStr = `${cleanDate}T100000Z`;
    const endTimeStr = `${cleanDate}T110000Z`;

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//RxGuard//Prescription Safety & Medication Tracker//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:rxguard-appt-${Date.now()}@rxguard.app`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `DTSTART:${startTimeStr}`,
      `DTEND:${endTimeStr}`,
      `SUMMARY:Medical Follow-up: ${appointment.doctorName}`,
      `DESCRIPTION:Follow-up appointment with ${appointment.doctorName} at ${appointment.clinicName}. Phone: ${appointment.phone || 'N/A'}. Notes: ${appointment.notes || 'Routine checkup'}.`,
      `LOCATION:${appointment.clinicName}`,
      'STATUS:CONFIRMED',
      'BEGIN:VALARM',
      'TRIGGER:-P2D', // 48 hours prior
      'ACTION:DISPLAY',
      `DESCRIPTION:Reminder: Medical appointment with ${appointment.doctorName} in 48 hours!`,
      'END:VALARM',
      'BEGIN:VALARM',
      'TRIGGER:-P1D', // 24 hours prior
      'ACTION:DISPLAY',
      `DESCRIPTION:Reminder: Medical appointment with ${appointment.doctorName} tomorrow!`,
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `RxGuard-Appointment-${appointment.doctorName.replace(/[^a-zA-Z0-9]/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  downloadRefillReminderICS(medicine: Medicine): void {
    const today = new Date();
    const targetDate = new Date();
    targetDate.setDate(today.getDate() + 2);
    const cleanDate = targetDate.toISOString().split('T')[0].replace(/-/g, '');

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//RxGuard//Prescription Safety//EN',
      'BEGIN:VEVENT',
      `UID:rxguard-refill-${medicine.id}-${Date.now()}@rxguard.app`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `DTSTART:${cleanDate}T090000Z`,
      `DTEND:${cleanDate}T093000Z`,
      `SUMMARY:⚠️ RxGuard Refill Alert: ${medicine.name} ${medicine.dosage}`,
      `DESCRIPTION:Inventory is low for ${medicine.name}. Remaining supply: ${medicine.remainingStock} units. Contact your pharmacy to refill.`,
      'BEGIN:VALARM',
      'TRIGGER:-PT15M',
      'ACTION:DISPLAY',
      `DESCRIPTION:Urgent: Refill ${medicine.name} today.`,
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `RxGuard-Refill-${medicine.name.replace(/[^a-zA-Z0-9]/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
};
