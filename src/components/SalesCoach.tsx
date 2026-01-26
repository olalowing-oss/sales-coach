import React, { useCallback, useEffect } from 'react';
import { Mic, Square, Pause, Play, Trash2, Download, Settings } from 'lucide-react';
import { useSessionStore } from '../store/sessionStore';
import { useSpeechRecognition, useMockSpeechRecognition } from '../hooks/useSpeechRecognition';
import { TranscriptPanel } from './TranscriptPanel';
import { CoachingPanel } from './CoachingPanel';
import { AdminPanel } from './AdminPanel';

// Konfiguration - byt ut mot riktiga nycklar i produktion
const SPEECH_CONFIG = {
  subscriptionKey: import.meta.env.VITE_AZURE_SPEECH_KEY || 'demo-mode',
  region: import.meta.env.VITE_AZURE_SPEECH_REGION || 'swedencentral',
  language: 'sv-SE'
};

// Använd mock i demo-läge
const USE_MOCK = !import.meta.env.VITE_AZURE_SPEECH_KEY || import.meta.env.VITE_AZURE_SPEECH_KEY === 'demo-mode';

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

  const [showAdmin, setShowAdmin] = React.useState(false);

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

  const speechRecognition = USE_MOCK
    ? useMockSpeechRecognition(speechHookOptions)
    : useSpeechRecognition(speechHookOptions);

  const { isListening, startListening, stopListening, error: speechError } = speechRecognition;

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
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold">
                B3
              </div>
              <h1 className="text-xl font-semibold">Sales Coach AI</h1>
            </div>

            {USE_MOCK && (
              <span className="px-2 py-1 bg-yellow-600/20 text-yellow-400 text-xs rounded-full">
                Demo-läge
              </span>
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
              onClick={() => setShowAdmin(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              title="Hantera erbjudanden"
            >
              <Settings className="w-4 h-4" />
              <span className="text-sm">Admin</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto p-6">
        {/* Control bar */}
        <div className="bg-gray-800 rounded-xl p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {!isActive ? (
              <button
                onClick={handleStart}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors"
              >
                <Mic className="w-5 h-5" />
                Starta samtal
              </button>
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

      {/* Admin Panel */}
      {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} />}
    </div>
  );
};
