/**
 * Canvas-based HD Video (MP4) Renderer & Exporter for RxGuard Demo
 */

export interface RenderProgress {
  percent: number;
  sceneIndex: number;
  sceneTitle: string;
}

export const videoExportService = {
  isSupported(): boolean {
    return (
      typeof window !== 'undefined' &&
      typeof HTMLCanvasElement !== 'undefined' &&
      'captureStream' in HTMLCanvasElement.prototype &&
      typeof MediaRecorder !== 'undefined'
    );
  },

  async generateDemoVideoMP4(
    onProgress?: (progress: RenderProgress) => void
  ): Promise<Blob> {
    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2D canvas context');

    // 8 Scenes: 2 seconds per scene = 16 seconds total, 30 fps = 480 frames
    const scenes = [
      {
        badge: 'SCENE 1: OVERVIEW',
        title: 'RxGuard: AI Prescription Safety',
        subtitle: 'Intelligent Medication Tracker & Contraindication Shield',
        details: [
          '• Offline-first mobile medication safety companion',
          '• Multimodal Vision AI for messy handwritten prescriptions',
          '• Automated drug-drug interaction matrix checks',
        ],
        accentColor: '#3b82f6',
      },
      {
        badge: 'SCENE 2: MULTIMODAL OCR',
        title: 'Google Gemini 3.8 Flash Vision Scanner',
        subtitle: 'Multimodal OCR from messy handwritten prescription notes',
        details: [
          '• Camera / Gallery input parsed into strictly typed JSON',
          '• Doctor: Dr. Marcus Sterling, MD (St. Jude Urgent Care)',
          '• Prescriptions: Amoxicillin 500mg, Omeprazole 20mg, Paracetamol 650mg',
        ],
        accentColor: '#8b5cf6',
      },
      {
        badge: 'SCENE 3: CLINICAL SAFETY',
        title: 'Critical Contraindication Warning Flagged',
        subtitle: 'Automated Drug-Drug Interaction Safety Alert',
        details: [
          '⚠️ HIGH RISK INTERACTION: Ibuprofen (NSAID) + Lisinopril + Aspirin 81mg',
          '• Multiplied acute gastrointestinal bleeding risk & blunted BP efficacy',
          '• Clinical Advice: Substitute with Paracetamol 500mg for pain',
        ],
        accentColor: '#ef4444',
      },
      {
        badge: 'SCENE 4: INVENTORY ONBOARDING',
        title: 'Pharmacy Inventory Stock Onboarding',
        subtitle: 'Actual physical count verification & 2-day threshold',
        details: [
          '• Purchased: 14 capsules (7-day supply at 2 doses/day)',
          '• Auto-decrement bound to timeline checkoffs',
          '• Low-stock alert threshold set to ≤ 2 days of supply remaining',
        ],
        accentColor: '#10b981',
      },
      {
        badge: 'SCENE 5: SMART DAILY TIMELINE',
        title: '4-Slot Routine & Real-Time Stock Decrement',
        subtitle: 'Morning (8 AM), Afternoon (1 PM), Evening (7 PM), Bedtime (10 PM)',
        details: [
          '• Checkbox tap decrements medicine cabinet stock in real-time (-1)',
          '• Ascending audio chime via Web Audio API + celebratory confetti',
          '• Audio speaker reads dose instructions aloud for elder clarity',
        ],
        accentColor: '#06b6d4',
      },
      {
        badge: 'SCENE 6: REFILL LOGISTICS',
        title: 'Low-Stock Warning & 1-Click WhatsApp Refill',
        subtitle: 'Automated pharmacy order dispatch when stock ≤ 2 days',
        details: [
          '⚠️ CRITICAL: 2 Days Left (Only 3 tablets remaining)',
          '• Pre-fills complete WhatsApp order message to local chemist',
          '• Generates RFC-5545 .ics calendar refill alert',
        ],
        accentColor: '#f59e0b',
      },
      {
        badge: 'SCENE 7: DOCTOR FOLLOW-UP',
        title: 'Doctor Appointment Tracker & Prior Alarms',
        subtitle: '48-hour and 24-hour reminder notifications',
        details: [
          '• Dr. Arthur Vance, MD (Cardiovascular Institute)',
          '• Next appointment countdown & clinic dialer',
          '• One-tap download to Apple Calendar & Google Calendar',
        ],
        accentColor: '#6366f1',
      },
      {
        badge: 'SCENE 8: ACCESSIBILITY & SOS',
        title: 'Senior Citizen Mode & Emergency Caregiver SOS',
        subtitle: 'High contrast, TTS voice guidance & 1-tap WhatsApp report',
        details: [
          '• 120% font scaling, high-contrast palette & large action buttons',
          '• Web Speech TTS reads instructions aloud in plain English',
          '• 1-Click Caretaker SOS shares live adherence report via WhatsApp',
        ],
        accentColor: '#f43f5e',
      },
    ];

    const fps = 30;
    const durationPerSceneSec = 2.5; // 2.5s per scene = 20s high-quality demo video
    const totalFrames = scenes.length * durationPerSceneSec * fps;

    // Detect best supported MIME type (prefer mp4)
    let mimeType = 'video/mp4';
    if (MediaRecorder.isTypeSupported('video/mp4;codecs=avc1.424028,mp4a.40.2')) {
      mimeType = 'video/mp4;codecs=avc1.424028,mp4a.40.2';
    } else if (MediaRecorder.isTypeSupported('video/mp4')) {
      mimeType = 'video/mp4';
    } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
      mimeType = 'video/webm;codecs=vp9';
    } else if (MediaRecorder.isTypeSupported('video/webm')) {
      mimeType = 'video/webm';
    }

    const stream = canvas.captureStream(fps);
    const recordedChunks: Blob[] = [];
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond: 4500000, // 4.5 Mbps HD
    });

    mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        recordedChunks.push(e.data);
      }
    };

    const completionPromise = new Promise<Blob>((resolve, reject) => {
      mediaRecorder.onstop = () => {
        const finalBlob = new Blob(recordedChunks, { type: 'video/mp4' });
        resolve(finalBlob);
      };
      mediaRecorder.onerror = (err) => reject(err);
    });

    mediaRecorder.start();

    // Render loop frame by frame
    const framesPerScene = durationPerSceneSec * fps;
    let currentFrame = 0;

    const renderFrame = () => {
      const sceneIdx = Math.min(
        scenes.length - 1,
        Math.floor(currentFrame / framesPerScene)
      );
      const scene = scenes[sceneIdx];
      const sceneFrame = currentFrame % framesPerScene;
      const sceneProgress = sceneFrame / framesPerScene; // 0 to 1

      // 1. Background (Dark futuristic medical slate)
      const grad = ctx.createLinearGradient(0, 0, 1280, 720);
      grad.addColorStop(0, '#020617'); // slate-950
      grad.addColorStop(0.5, '#0f172a'); // slate-900
      grad.addColorStop(1, '#022c22'); // dark emerald tint
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1280, 720);

      // Subtle grid dots
      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
      for (let x = 40; x < 1280; x += 60) {
        for (let y = 40; y < 720; y += 60) {
          ctx.beginPath();
          ctx.arc(x, y, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Top Header Brand Bar
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(40, 30, 1200, 70);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 1;
      ctx.strokeRect(40, 30, 1200, 70);

      // Logo icon box
      ctx.fillStyle = scene.accentColor;
      ctx.beginPath();
      ctx.roundRect(60, 42, 46, 46, 12);
      ctx.fill();

      // Shield cross symbol
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText('Rx', 68, 74);

      // Brand Title
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 26px sans-serif';
      ctx.fillText('RxGuard', 120, 73);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '14px sans-serif';
      ctx.fillText('AI Prescription Safety & Medication Tracker', 240, 72);

      // Pill badge (Scene)
      ctx.fillStyle = scene.accentColor;
      ctx.beginPath();
      ctx.roundRect(1020, 48, 200, 34, 17);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(scene.badge, 1120, 70);
      ctx.textAlign = 'left';

      // 2. Main Central Presentation Card
      const cardY = 130;
      const cardHeight = 490;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
      ctx.beginPath();
      ctx.roundRect(40, cardY, 1200, cardHeight, 24);
      ctx.fill();
      ctx.strokeStyle = scene.accentColor;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Inner Accent Glow
      ctx.fillStyle = `${scene.accentColor}18`;
      ctx.beginPath();
      ctx.roundRect(42, cardY + 2, 1196, 110, 22);
      ctx.fill();

      // Scene Title
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText(scene.title, 80, 200);

      // Scene Subtitle
      ctx.fillStyle = scene.accentColor;
      ctx.font = '600 20px sans-serif';
      ctx.fillText(scene.subtitle, 80, 235);

      // Horizontal separator
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.beginPath();
      ctx.moveTo(80, 260);
      ctx.lineTo(1200, 260);
      ctx.stroke();

      // Details bullets
      let bulletY = 310;
      scene.details.forEach((line) => {
        ctx.fillStyle = line.startsWith('⚠️') ? '#fca5a5' : '#e2e8f0';
        ctx.font = '22px sans-serif';
        ctx.fillText(line, 80, bulletY);
        bulletY += 50;
      });

      // Animated Pulse Waveform Bars at bottom of card (simulating voice narration)
      const waveY = 560;
      ctx.fillStyle = scene.accentColor;
      for (let i = 0; i < 30; i++) {
        const height =
          12 +
          Math.sin(currentFrame * 0.2 + i * 0.4) * 16 +
          Math.cos(currentFrame * 0.15 + i * 0.3) * 10;
        ctx.beginPath();
        ctx.roundRect(80 + i * 16, waveY - height / 2, 8, Math.max(4, height), 4);
        ctx.fill();
      }

      ctx.fillStyle = '#94a3b8';
      ctx.font = '13px monospace';
      ctx.fillText(
        `NARRATION SYNCED • 30 FPS HD • GOOGLE GEMINI MULTIMODAL ENGINE`,
        580,
        565
      );

      // 3. Global Bottom Progress Bar
      const totalProgress = currentFrame / totalFrames;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.fillRect(40, 640, 1200, 12);

      const barGrad = ctx.createLinearGradient(40, 640, 1240, 640);
      barGrad.addColorStop(0, '#3b82f6');
      barGrad.addColorStop(0.5, '#8b5cf6');
      barGrad.addColorStop(1, '#10b981');
      ctx.fillStyle = barGrad;
      ctx.beginPath();
      ctx.roundRect(40, 640, 1200 * totalProgress, 12, 6);
      ctx.fill();

      // Progress Time text
      ctx.fillStyle = '#94a3b8';
      ctx.font = '14px monospace';
      const curSec = Math.floor(currentFrame / fps);
      const totalSec = Math.floor(totalFrames / fps);
      ctx.fillText(
        `0:${curSec.toString().padStart(2, '0')} / 0:${totalSec.toString().padStart(2, '0')}`,
        40,
        680
      );
      ctx.fillText(`SCENE ${sceneIdx + 1} OF ${scenes.length}`, 1120, 680);

      currentFrame++;

      if (onProgress) {
        onProgress({
          percent: Math.round((currentFrame / totalFrames) * 100),
          sceneIndex: sceneIdx + 1,
          sceneTitle: scene.title,
        });
      }

      if (currentFrame < totalFrames) {
        requestAnimationFrame(renderFrame);
      } else {
        mediaRecorder.stop();
      }
    };

    renderFrame();

    return completionPromise;
  },

  downloadBlob(blob: Blob, filename = 'RxGuard_Demo_Video.mp4') {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  },
};
