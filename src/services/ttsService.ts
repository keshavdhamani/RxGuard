import { DoseScheduleItem } from '../types';

let currentUtterance: SpeechSynthesisUtterance | null = null;

export const ttsService = {
  isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  },

  stop(): void {
    if (this.isSupported()) {
      window.speechSynthesis.cancel();
    }
  },

  speak(text: string, isSeniorMode = false): Promise<void> {
    return new Promise((resolve) => {
      if (!this.isSupported()) {
        console.warn('Speech synthesis not supported on this browser.');
        resolve();
        return;
      }

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      currentUtterance = utterance;

      // Elderly/Senior accessibility tuning: lower speed, clear enunciated pitch
      utterance.rate = isSeniorMode ? 0.82 : 0.92;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Select high-quality English voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(
        (v) => (v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel')))
      ) || voices.find((v) => v.lang.startsWith('en'));

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onend = () => {
        currentUtterance = null;
        resolve();
      };

      utterance.onerror = (e) => {
        console.warn('TTS playback note:', e);
        currentUtterance = null;
        resolve();
      };

      window.speechSynthesis.speak(utterance);
    });
  },

  speakDose(dose: DoseScheduleItem, isSeniorMode = false): Promise<void> {
    const formatted = `Time for your ${dose.timeLabel}. Take your ${dose.medicineName}, dosage ${dose.dosage}, ${dose.foodLabel}. ${dose.instructions || ''}`;
    return this.speak(formatted, isSeniorMode);
  },

  speakScheduleSummary(doses: DoseScheduleItem[], isSeniorMode = false): Promise<void> {
    if (doses.length === 0) {
      return this.speak('You have no medication scheduled for today.', isSeniorMode);
    }
    const pending = doses.filter((d) => !d.taken);
    if (pending.length === 0) {
      return this.speak('Great job! All your doses for today are completely taken.', isSeniorMode);
    }
    const next = pending[0];
    const text = `RxGuard schedule update. You have ${pending.length} remaining doses today. Next up is ${next.medicineName} ${next.dosage} for ${next.timeLabel}, scheduled at ${next.scheduledTime}.`;
    return this.speak(text, isSeniorMode);
  },
};
