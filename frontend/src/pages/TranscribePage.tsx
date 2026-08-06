import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { SOAPReport } from '../types';
import { TranscribeStreamManager, generateSOAPFromTranscript } from '../services/websocket';
import { exportReportToExcel } from '../services/excel';
import { Button } from '../components/common/Button';
import {
  Mic,
  Square,
  RefreshCw,
  Save,
  Download,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  Clock,
  Globe,
  Sparkles,
  Edit3,
  Check,
  Volume2,
} from 'lucide-react';

export const TranscribePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { patients, addReport } = useData();
  const { user } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();

  // Patient Selection State
  const initialPatientId = searchParams.get('patient_id') || (patients.length > 0 ? patients[0].id : '');
  const [selectedPatientId, setSelectedPatientId] = useState<string>(initialPatientId);

  // Recording State Machine: 'Idle' | 'Recording' | 'Processing'
  const [recordingState, setRecordingState] = useState<'Idle' | 'Recording' | 'Processing'>('Idle');
  const [durationSeconds, setDurationSeconds] = useState(0);

  // Transcripts State
  const [interimText, setInterimText] = useState('');
  const [finalText, setFinalText] = useState('');
  const [wsStatus, setWsStatus] = useState<string>('Ready');

  // Generated SOAP Report State
  const [soap, setSoap] = useState<SOAPReport | null>(null);
  const [isEditingSoap, setIsEditingSoap] = useState(false);
  const [editedSoap, setEditedSoap] = useState<SOAPReport>({
    subjective: '',
    objective: '',
    assessment: '',
    plan: '',
  });

  // Report Details
  const [reportType, setReportType] = useState<string>('General Consultation');
  const [isSavingReport, setIsSavingReport] = useState(false);

  // References
  const streamManagerRef = useRef<TranscribeStreamManager | null>(null);
  const timerRef = useRef<any>(null);
  const transcriptBoxRef = useRef<HTMLDivElement>(null);

  // Audio Wave Visualizer canvas reference
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Selected Patient Object
  const selectedPatient = patients.find((p) => p.id === selectedPatientId);

  // Auto-scroll transcript box to bottom on update
  useEffect(() => {
    if (transcriptBoxRef.current) {
      transcriptBoxRef.current.scrollTop = transcriptBoxRef.current.scrollHeight;
    }
  }, [interimText, finalText]);

  // Handle Recording Timer
  useEffect(() => {
    if (recordingState === 'Recording') {
      timerRef.current = setInterval(() => {
        setDurationSeconds((sec) => sec + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [recordingState]);

  // Audio Visualizer Wave
  const startAudioVisualizer = useCallback(() => {
    const stream = streamManagerRef.current?.getAudioStream();
    if (!stream || !canvasRef.current) return;

    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      const draw = () => {
        if (!ctx) return;
        analyser.getByteFrequencyData(dataArray);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const barWidth = (canvas.width / bufferLength) * 1.5;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * canvas.height;
          ctx.fillStyle = '#2F5496';
          ctx.beginPath();
          ctx.roundRect(x, canvas.height - barHeight, barWidth - 2, barHeight, [2, 2, 0, 0]);
          ctx.fill();
          x += barWidth + 2;
        }

        animationFrameRef.current = requestAnimationFrame(draw);
      };

      draw();
    } catch {
      // ignore audio context errors
    }
  }, []);

  const stopAudioVisualizer = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, []);

  // Format Duration HH:MM:SS
  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start Voice Dictation
  const handleStartRecording = async () => {
    if (!selectedPatientId) {
      showError('Please select a patient before starting voice consultation.');
      return;
    }

    setRecordingState('Recording');
    setDurationSeconds(0);
    setInterimText('');
    setWsStatus('Connecting to WebSocket...');

    streamManagerRef.current = new TranscribeStreamManager(
      'ws://localhost:8000/api/v1/transcribe/stream/',
      {
        onPartialTranscript: (text) => setInterimText(text),
        onFinalTranscript: (text) => {
          setFinalText((prev) => (prev ? prev + ' ' + text : text));
          setInterimText('');
        },
        onSoapGenerated: (generatedSoap) => {
          setSoap(generatedSoap);
          setEditedSoap(generatedSoap);
        },
        onError: (err) => showError(err, 'Transcription Error'),
        onStatusChange: (status) => setWsStatus(status),
      }
    );

    await streamManagerRef.current.startRecording();
    setTimeout(() => {
      startAudioVisualizer();
    }, 500);
    showInfo('Microphone active. Streaming voice to MediReport...');
  };

  // Stop Recording & Generate SOAP
  const handleStopRecording = async () => {
    setRecordingState('Processing');
    stopAudioVisualizer();

    if (streamManagerRef.current) {
      const accumulated = await streamManagerRef.current.stopRecording();
      const completeTranscript = (finalText + ' ' + accumulated).trim();
      setFinalText(completeTranscript);
      setInterimText('');

      // Generate SOAP report if not generated by WS
      setTimeout(() => {
        const generatedSoap = generateSOAPFromTranscript(completeTranscript, selectedPatient?.full_name);
        setSoap(generatedSoap);
        setEditedSoap(generatedSoap);
        setRecordingState('Idle');
        showSuccess('Consultation transcription completed and SOAP report synthesized!');
      }, 1200);
    } else {
      setRecordingState('Idle');
    }
  };

  const handleClearTranscript = () => {
    setFinalText('');
    setInterimText('');
    setSoap(null);
    setDurationSeconds(0);
    showInfo('Transcript and SOAP buffer cleared.');
  };

  // Save Generated SOAP Report
  const handleSaveReport = async () => {
    if (!selectedPatient) {
      showError('No patient selected.');
      return;
    }

    if (!soap) {
      showError('No SOAP report generated yet.');
      return;
    }

    setIsSavingReport(true);
    try {
      const currentSoap = isEditingSoap ? editedSoap : soap;
      const wordCount = (finalText || ' ').split(/\s+/).filter(Boolean).length;
      const formattedDuration = `${Math.floor(durationSeconds / 60)}m ${durationSeconds % 60}s`;

      const newRep = await addReport({
        patient: selectedPatient.id,
        consultation_date: new Date().toISOString().split('T')[0],
        report_type: reportType,
        subjective: currentSoap.subjective,
        objective: currentSoap.objective,
        assessment: currentSoap.assessment,
        plan: currentSoap.plan,
        raw_transcript: finalText,
      } as any);

      showSuccess(`Saved SOAP report for ${selectedPatient.full_name}!`);
      navigate(`/reports/${newRep.id}`);
    } catch {
      showError('Failed to save report to database.');
    } finally {
      setIsSavingReport(false);
    }
  };

  // Export Report to Excel
  const handleExportExcel = () => {
    if (!soap || !selectedPatient) return;
    const currentSoap = isEditingSoap ? editedSoap : soap;

    const tempReport: any = {
      id: 'REP-DRAFT-' + Date.now().toString(36).slice(0, 5),
      patient_id: selectedPatient.id,
      patient_name: selectedPatient.full_name,
      patient_mrn: selectedPatient.mrn,
      doctor_name: user?.full_name || 'Dr. Sarah Jenkins',
      type: reportType,
      date: new Date().toISOString().split('T')[0],
      duration: `${Math.floor(durationSeconds / 60)}m ${durationSeconds % 60}s`,
      status: 'Completed',
      soap: currentSoap,
      raw_transcript: finalText,
    };

    exportReportToExcel(tempReport, selectedPatient);
    showSuccess('Downloaded Excel workbook (Patient Info + Report sheets).');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <Mic className="w-7 h-7 text-[#2F5496]" />
            <span>Voice Consultation Transcriber</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time streaming audio transcription connected to ws://localhost:8000/api/v1/transcribe/stream/
          </p>
        </div>

        {/* Patient Selection Dropdown */}
        <div className="w-full sm:w-80">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
            Target Patient <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            disabled={recordingState === 'Recording'}
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 font-medium focus:border-[#2F5496] focus:ring-2 focus:ring-[#2F5496]/20 focus:outline-none shadow-xs disabled:bg-slate-100"
          >
            <option value="" disabled>
              Select a patient record...
            </option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.full_name} ({p.mrn}) • {p.gender}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Recording Control Console */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
        {/* State Banner */}
        <div className="flex items-center gap-2 text-xs font-semibold mb-4 px-3 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
          <Globe className="w-3.5 h-3.5 text-[#2F5496]" />
          <span>Stream Status: {wsStatus}</span>
          <span className="text-slate-300">•</span>
          <span>Detected: English (US)</span>
        </div>

        {/* Pulsing Big Microphone Button */}
        <div className="relative mb-6">
          {recordingState === 'Recording' && (
            <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping scale-150"></div>
          )}

          <button
            onClick={recordingState === 'Recording' ? handleStopRecording : handleStartRecording}
            disabled={recordingState === 'Processing'}
            className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl cursor-pointer ${
              recordingState === 'Recording'
                ? 'bg-red-600 hover:bg-red-700 text-white ring-8 ring-red-100'
                : 'bg-[#2F5496] hover:bg-[#244278] text-white ring-8 ring-blue-50'
            }`}
          >
            {recordingState === 'Recording' ? (
              <Square className="w-10 h-10 fill-current" />
            ) : recordingState === 'Processing' ? (
              <RefreshCw className="w-10 h-10 animate-spin" />
            ) : (
              <Mic className="w-10 h-10" />
            )}
          </button>
        </div>

        {/* Timer Display & State Message */}
        <div className="space-y-1">
          <div className="text-3xl font-black font-mono tracking-wider text-slate-900">
            {formatDuration(durationSeconds)}
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {recordingState === 'Recording' && (
              <span className="text-red-600 animate-pulse flex items-center justify-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-600"></span> Recording & Streaming Audio...
              </span>
            )}
            {recordingState === 'Processing' && (
              <span className="text-[#2F5496] flex items-center justify-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Processing SOAP AI Segmentation...
              </span>
            )}
            {recordingState === 'Idle' && 'Click Microphone to Start Consultation Recording'}
          </p>
        </div>

        {/* Canvas Visualizer Wave */}
        {recordingState === 'Recording' && (
          <div className="w-full max-w-md mt-4">
            <canvas ref={canvasRef} width={400} height={36} className="w-full h-9 rounded-lg bg-slate-50 border border-slate-200" />
          </div>
        )}

        {/* Report Type Selector */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-center gap-3 w-full max-w-lg">
          <label className="text-xs font-semibold text-slate-600">Consultation Category:</label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none"
          >
            <option value="General Consultation">General Consultation</option>
            <option value="Cardiology Follow-up">Cardiology Follow-up</option>
            <option value="Pediatric Checkup">Pediatric Checkup</option>
            <option value="Neurology Exam">Neurology Exam</option>
            <option value="Emergency Assessment">Emergency Assessment</option>
            <option value="Routine Physical">Routine Physical</option>
          </select>
        </div>
      </div>

      {/* Live Transcript Panel */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-[#2F5496]" />
            <h3 className="text-sm font-bold text-slate-800">Live Speech Transcript Stream</h3>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleClearTranscript} icon={<RefreshCw className="w-3.5 h-3.5" />}>
              Clear
            </Button>
          </div>
        </div>

        {/* Text Display Area */}
        <div
          ref={transcriptBoxRef}
          className="p-5 min-h-[140px] max-h-60 overflow-y-auto font-sans text-sm text-slate-800 leading-relaxed bg-slate-50/50 space-y-2"
        >
          {finalText ? (
            <span className="text-slate-900 font-normal">{finalText} </span>
          ) : null}

          {interimText ? (
            <span className="italic text-slate-500 bg-blue-50/80 px-1.5 py-0.5 rounded-md border border-blue-100">
              {interimText}
            </span>
          ) : null}

          {!finalText && !interimText && (
            <p className="text-slate-400 italic text-xs">
              Speech transcribed live will appear here in real time...
            </p>
          )}
        </div>
      </div>

      {/* Generated SOAP Report Preview */}
      {soap && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 mb-1">
                <Sparkles className="w-3.5 h-3.5" /> Generated SOAP Report
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                {selectedPatient?.full_name} • {reportType}
              </h2>
            </div>

            <div className="flex items-center gap-2.5">
              <Button
                variant={isEditingSoap ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setIsEditingSoap(!isEditingSoap)}
                icon={isEditingSoap ? <Check className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
              >
                {isEditingSoap ? 'Done Editing' : 'Edit Sections'}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleExportExcel}
                icon={<Download className="w-4 h-4 text-emerald-600" />}
              >
                Export Excel
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveReport}
                isLoading={isSavingReport}
                icon={<Save className="w-4 h-4" />}
                className="bg-emerald-600 hover:bg-emerald-700 font-bold"
              >
                Save Report
              </Button>
            </div>
          </div>

          {/* 4 Labeled SOAP Containers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Subjective */}
            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#2F5496] mb-2 flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-[#2F5496] text-white flex items-center justify-center text-xs">S</span>
                <span>Subjective (S)</span>
              </h3>
              {isEditingSoap ? (
                <textarea
                  value={editedSoap.subjective}
                  onChange={(e) => setEditedSoap({ ...editedSoap, subjective: e.target.value })}
                  rows={4}
                  className="w-full text-xs font-sans p-2 rounded-lg border border-slate-300 bg-white"
                />
              ) : (
                <p className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {editedSoap.subjective || soap.subjective}
                </p>
              )}
            </div>

            {/* Objective */}
            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-700 mb-2 flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-amber-600 text-white flex items-center justify-center text-xs">O</span>
                <span>Objective (O)</span>
              </h3>
              {isEditingSoap ? (
                <textarea
                  value={editedSoap.objective}
                  onChange={(e) => setEditedSoap({ ...editedSoap, objective: e.target.value })}
                  rows={4}
                  className="w-full text-xs font-sans p-2 rounded-lg border border-slate-300 bg-white"
                />
              ) : (
                <p className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {editedSoap.objective || soap.objective}
                </p>
              )}
            </div>

            {/* Assessment */}
            <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/40">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-purple-700 mb-2 flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-purple-600 text-white flex items-center justify-center text-xs">A</span>
                <span>Assessment (A)</span>
              </h3>
              {isEditingSoap ? (
                <textarea
                  value={editedSoap.assessment}
                  onChange={(e) => setEditedSoap({ ...editedSoap, assessment: e.target.value })}
                  rows={4}
                  className="w-full text-xs font-sans p-2 rounded-lg border border-slate-300 bg-white"
                />
              ) : (
                <p className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {editedSoap.assessment || soap.assessment}
                </p>
              )}
            </div>

            {/* Plan */}
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 mb-2 flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-emerald-600 text-white flex items-center justify-center text-xs">P</span>
                <span>Plan (P)</span>
              </h3>
              {isEditingSoap ? (
                <textarea
                  value={editedSoap.plan}
                  onChange={(e) => setEditedSoap({ ...editedSoap, plan: e.target.value })}
                  rows={4}
                  className="w-full text-xs font-sans p-2 rounded-lg border border-slate-300 bg-white"
                />
              ) : (
                <p className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {editedSoap.plan || soap.plan}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
