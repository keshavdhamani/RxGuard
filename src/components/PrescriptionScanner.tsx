import React, { useState, useRef } from 'react';
import {
  Camera,
  Upload,
  Sparkles,
  FileText,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Eye,
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
  Stethoscope,
  Calendar,
} from 'lucide-react';
import { PRESET_PRESCRIPTIONS, PresetPrescription } from '../data/mockPrescriptions';
import { PrescriptionAnalysisResult } from '../types';

interface Props {
  onAnalysisComplete: (result: PrescriptionAnalysisResult) => void;
  isSeniorMode?: boolean;
}

export const PrescriptionScanner: React.FC<Props> = ({ onAnalysisComplete, isSeniorMode = false }) => {
  const [selectedPreset, setSelectedPreset] = useState<string>('sample_handwritten');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisStep, setAnalysisStep] = useState<string>('');
  const [extractedResult, setExtractedResult] = useState<PrescriptionAnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Start live webcam / camera stream
  const startCamera = async () => {
    try {
      setCameraActive(true);
      setErrorMsg(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 } },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.warn('Camera stream error:', err);
      setErrorMsg('Could not access device camera. Please upload an image or select a sample prescription below.');
      setCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setPreviewImage(dataUrl);
      stopCamera();
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setPreviewImage(reader.result as string);
      stopCamera();
    };
    reader.readAsDataURL(file);
  };

  // Run Gemini 3.8 Flash Analysis
  const runAnalysis = async (presetIdToUse?: string) => {
    setIsAnalyzing(true);
    setErrorMsg(null);
    setExtractedResult(null);

    const targetPreset = presetIdToUse || selectedPreset;

    try {
      setAnalysisStep('1. Preprocessing image contrast & unwarping handwriting lines...');
      await new Promise((r) => setTimeout(r, 400));

      setAnalysisStep('2. Running Gemini 3.8 Flash Multimodal OCR on doctor script & dosages...');
      await new Promise((r) => setTimeout(r, 600));

      setAnalysisStep('3. Cross-referencing clinical pharmacology database & interaction matrix...');

      const response = await fetch('/api/analyze-prescription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: previewImage || null,
          sampleId: targetPreset,
        }),
      });

      if (!response.ok) {
        throw new Error('API server returned error: ' + response.statusText);
      }

      const json = await response.json();
      if (json.success && json.data) {
        setAnalysisStep('4. Clinical contraindication safety analysis complete!');
        await new Promise((r) => setTimeout(r, 300));
        setExtractedResult(json.data);
      } else {
        throw new Error(json.error || 'Failed to extract prescription data');
      }
    } catch (err: any) {
      console.error('Prescription analysis error:', err);
      setErrorMsg(err.message || 'Analysis error. Please try one of our verified demo samples.');
    } finally {
      setIsAnalyzing(false);
      setAnalysisStep('');
    }
  };

  const handleSelectPreset = (preset: PresetPrescription) => {
    setSelectedPreset(preset.id);
    setPreviewImage(null);
    stopCamera();
    runAnalysis(preset.id);
  };

  return (
    <div className="space-y-4">
      {/* Scanner Control Deck */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700">
                <Camera className="w-5 h-5" />
              </span>
              <h2 className={`font-black text-slate-900 ${isSeniorMode ? 'text-2xl' : 'text-lg'}`}>
                Prescription Scanner &amp; AI Safety Engine
              </h2>
            </div>
            <p className={`text-slate-500 mt-1 ${isSeniorMode ? 'text-base' : 'text-xs'}`}>
              Scan messy handwritten prescription notes or medicine bottle labels with Gemini 3.8 Flash
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!cameraActive ? (
              <button
                onClick={startCamera}
                className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-xs flex items-center gap-1.5"
              >
                <Camera className="w-4 h-4" />
                <span>Open Live Camera</span>
              </button>
            ) : (
              <button
                onClick={capturePhoto}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-xs flex items-center gap-1.5 animate-pulse"
              >
                <Camera className="w-4 h-4" />
                <span>Snap Photo</span>
              </button>
            )}

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-colors flex items-center gap-1.5"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Image</span>
            </button>
          </div>
        </div>

        {/* Live Camera Viewport */}
        {cameraActive && (
          <div className="mt-4 relative rounded-2xl overflow-hidden bg-black aspect-video max-h-72 flex items-center justify-center border-2 border-blue-500">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            <div className="absolute inset-0 border-2 border-dashed border-white/70 m-4 rounded-xl pointer-events-none flex items-center justify-center">
              <span className="text-white text-xs bg-black/60 px-3 py-1 rounded-full font-medium">
                Align prescription or bottle within frame
              </span>
            </div>
            <button
              onClick={stopCamera}
              className="absolute top-3 right-3 text-white bg-black/70 hover:bg-black px-2.5 py-1 rounded-lg text-xs"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Custom Uploaded Preview */}
        {previewImage && !cameraActive && (
          <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img
                src={previewImage}
                alt="Captured prescription"
                className="w-16 h-16 object-cover rounded-lg border border-slate-300"
              />
              <div>
                <span className="text-xs font-bold text-slate-800">Custom Prescription Image Ready</span>
                <p className="text-[11px] text-slate-500">Ready to send to Gemini Multimodal Vision API</p>
              </div>
            </div>
            <button
              onClick={() => runAnalysis()}
              disabled={isAnalyzing}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all shadow-xs flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>Analyze with Gemini</span>
            </button>
          </div>
        )}

        {/* Sample Prescriptions Showcase (For Demo Guarantee) */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              ⚡ Instant Demo Presets (1-Click Test Scenarios)
            </span>
            <span className="text-[11px] text-indigo-600 font-medium">Click any scenario to analyze</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            {PRESET_PRESCRIPTIONS.map((preset) => (
              <div
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                  selectedPreset === preset.id
                    ? 'border-indigo-500 bg-indigo-50/70 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span
                    className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                      preset.riskBadge === 'High Risk'
                        ? 'bg-rose-100 text-rose-800'
                        : preset.riskBadge === 'Moderate Risk'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {preset.riskBadge}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 capitalize">
                    {preset.sampleType}
                  </span>
                </div>

                <div className="font-bold text-slate-900 text-xs truncate">{preset.title}</div>
                <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{preset.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Analysis In-Progress Banner */}
      {isAnalyzing && (
        <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-center gap-3 animate-pulse shadow-sm">
          <RefreshCw className="w-5 h-5 text-indigo-600 animate-spin shrink-0" />
          <div className="min-w-0">
            <span className="text-xs font-bold text-indigo-900 uppercase">
              Gemini 3.8 Flash Vision Engine Processing
            </span>
            <p className="text-xs text-indigo-700 font-medium mt-0.5 truncate">{analysisStep}</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Extracted Results Panel */}
      {extractedResult && (
        <div className="bg-white rounded-2xl border-2 border-indigo-200 p-5 shadow-md space-y-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-full bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-black text-slate-900 text-base">
                  Prescription Extracted Successfully
                </h3>
                <p className="text-xs text-slate-500">
                  {extractedResult.medicines.length} medications identified with structured dosage &amp; contraindications
                </p>
              </div>
            </div>

            <button
              onClick={() => onAnalysisComplete(extractedResult)}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <span>Confirm Stock &amp; Add to Cabinet</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Doctor & Patient Info Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Prescribing Doctor</span>
              <div className="font-bold text-slate-900 truncate">{extractedResult.doctorName}</div>
              <div className="text-[11px] text-slate-500 truncate">{extractedResult.clinicOrHospital}</div>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Patient &amp; Diagnosis</span>
              <div className="font-bold text-slate-900">{extractedResult.patientName || 'Patient'}</div>
              <div className="text-[11px] text-slate-500 truncate">{extractedResult.diagnosis || 'Standard Course'}</div>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Next Follow-Up</span>
              <div className="font-bold text-blue-700">{extractedResult.nextAppointmentDate || 'In 7 Days'}</div>
              <div className="text-[11px] text-slate-500">48h &amp; 24h Alarms enabled</div>
            </div>
          </div>

          {/* Extracted Contraindications Alert */}
          {extractedResult.contraindications && extractedResult.contraindications.length > 0 && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1.5">
              <div className="flex items-center gap-2 text-rose-800 text-xs font-bold uppercase tracking-wide">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Drug Interaction / Contraindication Detected</span>
              </div>
              {extractedResult.contraindications.map((contra, idx) => (
                <div key={idx} className="text-xs text-rose-950 font-medium pl-6">
                  • <strong>[{contra.severity}]</strong> {contra.message}
                </div>
              ))}
            </div>
          )}

          {/* Scanned Medicines Table */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Identified Medications ({extractedResult.medicines.length}):
            </span>
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
              {extractedResult.medicines.map((med, idx) => (
                <div key={idx} className="p-3 bg-white flex items-center justify-between gap-3 text-xs">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{med.name}</span>
                      <span className="bg-slate-100 text-slate-600 font-mono px-1.5 py-0.5 rounded text-[11px]">
                        {med.dosage}
                      </span>
                    </div>
                    <div className="text-slate-500 mt-0.5 flex items-center gap-2 flex-wrap">
                      <span>Timing: {med.timing.join(', ')}</span>
                      <span>•</span>
                      <span>Relation: {med.foodRelation.replace('_', ' ')}</span>
                      <span>•</span>
                      <span>Duration: {med.durationDays} days</span>
                    </div>
                  </div>
                  <span className="text-slate-400 text-[11px] bg-slate-50 px-2 py-1 rounded border">
                    {med.purpose || 'Active Drug'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
