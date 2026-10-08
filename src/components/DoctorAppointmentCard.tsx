import React from 'react';
import { Calendar, Stethoscope, Phone, Clock, BellRing, CalendarCheck, MessageSquare, AlertCircle } from 'lucide-react';
import { DoctorAppointment } from '../types';
import { calendarService } from '../services/calendarService';
import { notificationService } from '../services/notificationService';

interface Props {
  appointment: DoctorAppointment;
  isSeniorMode?: boolean;
}

export const DoctorAppointmentCard: React.FC<Props> = ({ appointment, isSeniorMode = false }) => {
  if (!appointment || !appointment.doctorName) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const apptDate = new Date(appointment.date);
  apptDate.setHours(0, 0, 0, 0);

  const diffTime = apptDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const isTomorrow = diffDays === 1;
  const isToday = diffDays === 0;
  const isWithin48h = diffDays <= 2 && diffDays >= 0;

  const handleTestReminder = () => {
    notificationService.showNotification(`🩺 Appointment Reminder: ${appointment.doctorName}`, {
      body: `Reminder: You have an appointment with ${appointment.doctorName} at ${appointment.clinicName} on ${appointment.date} at ${appointment.time || '10:00 AM'}.`,
    });
    notificationService.playWarningAlarm();
  };

  const handleWhatsAppConfirm = () => {
    const text = encodeURIComponent(
      `Hello ${appointment.clinicName}, I am confirming my upcoming appointment with ${appointment.doctorName} on ${appointment.date} at ${appointment.time || 'scheduled time'}. Patient: Alex Morgan.`
    );
    window.open(`https://api.whatsapp.com/send?phone=15552345678&text=${text}`, '_blank');
  };

  return (
    <div
      className={`rounded-2xl border transition-all shadow-sm overflow-hidden bg-gradient-to-r from-blue-50 via-indigo-50 to-sky-50 border-blue-200 ${
        isSeniorMode ? 'p-5' : 'p-4'
      }`}
    >
      {/* 48h / 24h Prior Reminder Alert Banner */}
      {isWithin48h && (
        <div className="mb-3 p-2.5 bg-indigo-600 text-white rounded-xl flex items-center justify-between text-xs font-semibold shadow-xs">
          <div className="flex items-center gap-2">
            <BellRing className="w-4 h-4 animate-bounce" />
            <span>
              {isToday
                ? `TODAY: Appointment with ${appointment.doctorName}`
                : isTomorrow
                ? `24-Hour Reminder: Confirm visit tomorrow with ${appointment.doctorName}`
                : `48-Hour Reminder: Confirm appointment with ${appointment.doctorName}`}
            </span>
          </div>
          <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-bold">
            Prior Alert
          </span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-blue-600 text-white shrink-0 shadow-xs">
            <Stethoscope className={isSeniorMode ? 'w-7 h-7' : 'w-6 h-6'} />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider bg-blue-200 text-blue-900 px-2 py-0.5 rounded-full">
                Follow-up & Appointment Tracker
              </span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  isWithin48h ? 'bg-amber-100 text-amber-800 animate-pulse' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {isToday ? 'Today' : isTomorrow ? 'Tomorrow' : `In ${diffDays} Days`}
              </span>
            </div>

            <h3 className={`font-bold text-slate-900 mt-1 ${isSeniorMode ? 'text-xl' : 'text-base'}`}>
              {appointment.doctorName}
            </h3>
            <p className="text-slate-600 text-xs font-medium">{appointment.clinicName}</p>

            <div className="flex items-center gap-3 mt-2 text-xs text-slate-700 flex-wrap">
              <span className="flex items-center gap-1 font-semibold text-blue-900">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                {appointment.date}
              </span>
              {appointment.time && (
                <span className="flex items-center gap-1 text-slate-600">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  {appointment.time}
                </span>
              )}
              {appointment.phone && (
                <a
                  href={`tel:${appointment.phone}`}
                  className="flex items-center gap-1 text-blue-700 hover:underline"
                >
                  <Phone className="w-3.5 h-3.5" />
                  {appointment.phone}
                </a>
              )}
            </div>

            {appointment.notes && (
              <p className="mt-2 text-[11px] text-slate-500 italic bg-white/70 p-1.5 rounded-lg border border-blue-100">
                Notes: {appointment.notes}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-blue-200">
          <button
            onClick={() => calendarService.downloadAppointmentICS(appointment)}
            className={`w-full sm:w-auto px-3 py-2 rounded-xl bg-white hover:bg-blue-50 border border-blue-300 text-blue-800 font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 ${
              isSeniorMode ? 'text-sm' : 'text-xs'
            }`}
          >
            <CalendarCheck className="w-4 h-4 text-blue-600" />
            <span>Add to Calendar (.ics)</span>
          </button>

          <button
            onClick={handleWhatsAppConfirm}
            className={`w-full sm:w-auto px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 ${
              isSeniorMode ? 'text-sm' : 'text-xs'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Confirm via WhatsApp</span>
          </button>

          <button
            onClick={handleTestReminder}
            className="text-[11px] text-slate-500 hover:text-slate-800 underline flex items-center gap-1 mt-1"
          >
            <BellRing className="w-3 h-3" />
            <span>Test 48h/24h Notification</span>
          </button>
        </div>
      </div>
    </div>
  );
};
