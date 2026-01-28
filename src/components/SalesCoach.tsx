import React, { useCallback, useEffect, useRef } from 'react';
import { Mic, Square, Pause, Play, Trash2, Download, Settings, Lightbulb, History, LogOut, User, Upload } from 'lucide-react';
import { useSessionStore } from '../store/sessionStore';
import { useSpeechRecognition, useMockSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useAudioFileTranscription } from '../hooks/useAudioFileTranscription';
import { TranscriptPanel } from './TranscriptPanel';
import { CoachingPanel } from './CoachingPanel';
import { AdminPanel } from './AdminPanel';
import { CoachingAdminPanel } from './CoachingAdminPanel';
import { HistoryPanel } from './HistoryPanel';
import { isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

// Konfiguration - byt ut mot riktiga nycklar i produktion
const SPEECH_CONFIG = {
  subscriptionKey: import.meta.env.VITE_AZURE_SPEECH_KEY || 'demo-mode',
  region: import.meta.env.VITE_AZURE_SPEECH_REGION || 'swedencentral',
  language: 'sv-SE'
};

// Kolla om Azure-nyckel finns
const HAS_AZURE_KEY = import.meta.env.VITE_AZURE_SPEECH_KEY && import.meta.env.VITE_AZURE_SPEECH_KEY !== 'demo-mode';

export const SalesCoach: React.FC = () => {
  const {
    status,
    segments,
    interimText,
    coachingTips,
    startSession,
    stopSession,
    pauseSession,
    resumeSession,
    addInterimTranscript,
    addFinalTranscript,
    clearTranscript,
    clearAllTips,
    getSessionSummary
  } = useSessionStore();

  const { user, signOut } = useAuth();

  const [showAdmin, setShowAdmin] = React.useState(false);
  const [showCoachingAdmin, setShowCoachingAdmin] = React.useState(false);
  const [showHistory, setShowHistory] = React.useState(false);
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Läs demo-läge från localStorage för att överleva page reload
  const [forceDemoMode] = React.useState(() => {
    return localStorage.getItem('forceDemoMode') === 'true';
  });

  // Använd mock om ingen Azure-nyckel finns eller om demo-läge är tvingat
  const useMock = !HAS_AZURE_KEY || forceDemoMode;

  // Växla demo-läge (kräver reload pga React hooks-regler)
  const handleToggleDemo = () => {
    const newMode = !forceDemoMode;
    localStorage.setItem('forceDemoMode', String(newMode));
    window.location.reload();
  };

  // Välj rätt speech hook
  const speechHookOptions = {
    ...SPEECH_CONFIG,
    onInterimResult: addInterimTranscript,
    onFinalResult: addFinalTranscript,
    onError: (error: string) => console.error('Speech error:', error),
    onStatusChange: (speechStatus: 'idle' | 'listening' | 'error') => {
      console.log('Speech status:', speechStatus);
    }
  };

  const speechRecognition = useMock
    ? useMockSpeechRecognition(speechHookOptions)
    : useSpeechRecognition(speechHookOptions);

  const { isListening, startListening, stopListening, error: speechError } = speechRecognition;

  // Audio file transcription hook
  const { transcribeFile, isProcessing, progress } = useAudioFileTranscription({
    subscriptionKey: SPEECH_CONFIG.subscriptionKey,
    region: SPEECH_CONFIG.region,
    language: SPEECH_CONFIG.language,
    onInterimResult: addInterimTranscript,
    onFinalResult: addFinalTranscript,
    onError: (error: string) => console.error('Transcription error:', error),
    onComplete: () => {
      stopSession();
      console.log('File transcription complete');
    }
  });

  // Hantera start av session och inspelning
  const handleStart = useCallback(async () => {
    startSession();
    await startListening();
  }, [startSession, startListening]);

  // Hantera stopp
  const handleStop = useCallback(() => {
    stopListening();
    stopSession();
  }, [stopListening, stopSession]);

  // Hantera fil-uppladdning
  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validera filtyp
    if (!file.name.endsWith('.wav') && !file.type.includes('audio')) {
      alert('Vänligen välj en WAV-fil');
      return;
    }

    // Starta session och transkribera fil
    startSession();
    await transcribeFile(file);

    // Rensa file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [startSession, transcribeFile]);

  // Hantera paus/resume
  const handlePauseResume = useCallback(async () => {
    if (status === 'recording') {
      stopListening();
      pauseSession();
    } else if (status === 'paused') {
      await startListening();
      resumeSession();
    }
  }, [status, stopListening, startListening, pauseSession, resumeSession]);

  // Rensa allt
  const handleClear = useCallback(() => {
    clearTranscript();
    clearAllTips();
  }, [clearTranscript, clearAllTips]);

  // Exportera sammanfattning
  const handleExport = useCallback(() => {
    const summary = getSessionSummary();
    const blob = new Blob([summary], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `samtalsnoteringar-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, [getSessionSummary]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 's') {
        e.preventDefault();
        if (status === 'idle' || status === 'stopped') {
          handleStart();
        } else {
          handleStop();
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'p') {
        e.preventDefault();
        if (status === 'recording' || status === 'paused') {
          handlePauseResume();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status, handleStart, handleStop, handlePauseResume]);

  const isActive = status === 'recording' || status === 'paused';

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-sm">
                SC
              </div>
              <h1 className="text-xl font-semibold">Sales Coach AI</h1>
            </div>

            {useMock && (
              <span className="px-2 py-1 bg-yellow-600/20 text-yellow-400 text-xs rounded-full">
                Demo-läge
              </span>
            )}

            {HAS_AZURE_KEY && (
              <button
                onClick={handleToggleDemo}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  forceDemoMode
                    ? 'bg-yellow-600/20 text-yellow-400 hover:bg-yellow-600/30'
                    : 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30'
                }`}
              >
                {forceDemoMode ? 'Byt till Azure' : 'Byt till Demo'}
              </button>
            )}
          </div>

          <div className="flex items-center gap-4">
            {isListening && (
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                <span className="text-sm text-gray-400">Lyssnar...</span>
              </div>
            )}

            {speechError && (
              <span className="text-sm text-red-400">{speechError}</span>
            )}

            <button
              onClick={() => setShowCoachingAdmin(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              title="Coachning-inställningar"
            >
              <Lightbulb className="w-4 h-4" />
              <span className="text-sm">Coachning</span>
            </button>

            <button
              onClick={() => setShowAdmin(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              title="Hantera erbjudanden"
            >
              <Settings className="w-4 h-4" />
              <span className="text-sm">Erbjudanden</span>
            </button>

            {isSupabaseConfigured() && (
              <button
                onClick={() => setShowHistory(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                title="Samtalshistorik"
              >
                <History className="w-4 h-4" />
                <span className="text-sm">Historik</span>
              </button>
            )}

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                <User className="w-4 h-4" />
                <span className="text-sm">{user?.email?.split('@')[0] || 'User'}</span>
              </button>

              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-20">
                    <div className="p-2">
                      <div className="px-3 py-2 text-sm text-gray-400 border-b border-gray-700">
                        {user?.email}
                      </div>
                      <button
                        onClick={async () => {
                          await signOut();
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 mt-1 text-sm text-red-400 hover:bg-gray-700 rounded transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Logga ut
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto p-6">
        {/* Control bar */}
        <div className="bg-gray-800 rounded-xl p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {!isActive && !isProcessing ? (
              <>
                <button
                  onClick={handleStart}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors"
                  title="Starta live-inspelning från mikrofon"
                >
                  <Mic className="w-5 h-5" />
                  Starta samtal
                </button>

                {!useMock && (
                  <>
                    <div className="w-px h-8 bg-gray-700" />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
                      title="Ladda upp ljudfil för transkribering"
                    >
                      <Upload className="w-5 h-5" />
                      Ladda upp fil
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".wav,audio/wav,audio/wave"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </>
                )}
              </>
            ) : isProcessing ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-6 py-3 bg-blue-600/20 text-blue-400 rounded-lg">
                  <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                  Transkriberar fil...
                </div>
                <div className="flex-1 max-w-xs">
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{Math.round(progress)}%</p>
                </div>
              </div>
            ) : (
              <>
                <button
                  onClick={handleStop}
                  className="flex items-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors"
                >
                  <Square className="w-5 h-5" />
                  Avsluta
                </button>

                <button
                  onClick={handlePauseResume}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${status === 'paused'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-yellow-600 hover:bg-yellow-700'
                    }`}
                >
                  {status === 'paused' ? (
                    <>
                      <Play className="w-5 h-5" />
                      Fortsätt
                    </>
                  ) : (
                    <>
                      <Pause className="w-5 h-5" />
                      Pausa
                    </>
                  )}
                </button>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleClear}
              className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              title="Rensa allt"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              title="Exportera noteringar"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TranscriptPanel
            segments={segments}
            interimText={interimText}
            isListening={isListening}
          />

          <CoachingPanel tips={coachingTips} />
        </div>

        {/* Keyboard shortcuts hint */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <span className="inline-flex items-center gap-4">
            <kbd className="px-2 py-1 bg-gray-800 rounded text-xs">Ctrl+Shift+S</kbd>
            <span>Start/Stopp</span>
            <kbd className="px-2 py-1 bg-gray-800 rounded text-xs">Ctrl+Shift+P</kbd>
            <span>Pausa/Fortsätt</span>
          </span>
        </div>
      </main>

      {/* Admin Panels */}
      {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} />}
      {showCoachingAdmin && <CoachingAdminPanel onClose={() => setShowCoachingAdmin(false)} />}
      {showHistory && <HistoryPanel onClose={() => setShowHistory(false)} />}
    </div>
  );
};
