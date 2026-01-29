import React, { useCallback, useEffect, useRef } from 'react';
import { Play, Settings, LogOut, User, GraduationCap, Phone, Mic, Square, Pause, Upload, Beaker } from 'lucide-react';
import { useSessionStore } from '../store/sessionStore';
import { useSpeechRecognition, useMockSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useAudioFileTranscription } from '../hooks/useAudioFileTranscription';
import { TranscriptPanel } from './TranscriptPanel';
import { CoachingPanel } from './CoachingPanel';
import { AdminPanel } from './AdminPanel';
import { CoachingAdminPanel } from './CoachingAdminPanel';
import { ScenariosAdmin } from './ScenariosAdmin';
import { HistoryPanel } from './HistoryPanel';
import { LiveCallAnalysisPanel } from './LiveCallAnalysisPanel';
import { TrainingMode } from './TrainingMode';
import { KundsamtalDropdown } from './KundsamtalDropdown';
import { useAuth } from '../contexts/AuthContext';
import { getAllDemoScripts } from '../data/demoScripts';

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
    liveAnalysis,
    startSession,
    stopSession,
    pauseSession,
    resumeSession,
    addInterimTranscript,
    addFinalTranscript,
    updateLiveAnalysis
  } = useSessionStore();

  const { user, signOut } = useAuth();

  const [showAdmin, setShowAdmin] = React.useState(false);
  const [showCoachingAdmin, setShowCoachingAdmin] = React.useState(false);
  const [showScenariosAdmin, setShowScenariosAdmin] = React.useState(false);
  const [showHistory, setShowHistory] = React.useState(false);
  const [showTraining, setShowTraining] = React.useState(false);
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  const [showTrainingMenu, setShowTrainingMenu] = React.useState(false);
  const [showKundsamtalMenu, setShowKundsamtalMenu] = React.useState(false);
  const [showDemoMenu, setShowDemoMenu] = React.useState(false);

  // Panel visibility toggles (load from localStorage)
  const [showTranscriptPanel, setShowTranscriptPanel] = React.useState(() => {
    const saved = localStorage.getItem('showTranscriptPanel');
    return saved !== null ? saved === 'true' : true;
  });
  const [showCoachingPanel, setShowCoachingPanel] = React.useState(() => {
    const saved = localStorage.getItem('showCoachingPanel');
    return saved !== null ? saved === 'true' : true;
  });
  const [selectedScript, setSelectedScript] = React.useState(() => {
    return localStorage.getItem('selectedDemoScript') || 'copilot-success';
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Läs demo-läge från localStorage för att överleva page reload
  const [forceDemoMode] = React.useState(() => {
    return localStorage.getItem('forceDemoMode') === 'true';
  });

  // Använd mock om ingen Azure-nyckel finns eller om demo-läge är tvingat
  const useMock = !HAS_AZURE_KEY || forceDemoMode;

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
    ? useMockSpeechRecognition({ ...speechHookOptions, scriptId: selectedScript })
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


  // Toggle panel visibility
  const handleToggleTranscript = useCallback(() => {
    setShowTranscriptPanel(prev => {
      const newValue = !prev;
      localStorage.setItem('showTranscriptPanel', String(newValue));
      return newValue;
    });
  }, []);

  const handleToggleCoaching = useCallback(() => {
    setShowCoachingPanel(prev => {
      const newValue = !prev;
      localStorage.setItem('showCoachingPanel', String(newValue));
      return newValue;
    });
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
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
        if (status === 'recording') {
          stopListening();
          pauseSession();
        } else if (status === 'paused') {
          await startListening();
          resumeSession();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status, handleStart, handleStop, stopListening, pauseSession, startListening, resumeSession]);

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

            {/* Samtal menu with dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowKundsamtalMenu(!showKundsamtalMenu);
                  setShowTrainingMenu(false);
                  setShowDemoMenu(false);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                title="Samtal"
              >
                <Phone className="w-4 h-4" />
                <span className="text-sm">Samtal</span>
              </button>

              <KundsamtalDropdown
                isOpen={showKundsamtalMenu}
                onClose={() => setShowKundsamtalMenu(false)}
                showTranscriptPanel={showTranscriptPanel}
                showCoachingPanel={showCoachingPanel}
                onToggleTranscript={handleToggleTranscript}
                onToggleCoaching={handleToggleCoaching}
                onOpenHistory={() => setShowHistory(true)}
                onOpenAdmin={() => setShowAdmin(true)}
                onOpenCoachingAdmin={() => setShowCoachingAdmin(true)}
              />
            </div>

            {/* Demosamtal menu with dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowDemoMenu(!showDemoMenu);
                  setShowKundsamtalMenu(false);
                  setShowTrainingMenu(false);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors"
                title="Demosamtal"
              >
                <Beaker className="w-4 h-4" />
                <span className="text-sm">Demosamtal</span>
              </button>

              {showDemoMenu && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowDemoMenu(false)}
                  />
                  {/* Dropdown menu */}
                  <div className="absolute left-0 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-20">
                    <div className="p-3">
                      <div className="text-xs text-gray-400 mb-2">Välj demo-scenario</div>
                      <select
                        value={selectedScript}
                        onChange={(e) => {
                          setSelectedScript(e.target.value);
                          localStorage.setItem('selectedDemoScript', e.target.value);
                          setShowDemoMenu(false);
                        }}
                        disabled={isListening}
                        className="w-full px-3 py-2 text-sm bg-gray-700 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {getAllDemoScripts().map((script) => (
                          <option key={script.id} value={script.id}>
                            {script.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="border-t border-gray-700" />
                    <button
                      onClick={() => {
                        fileInputRef.current?.click();
                        setShowDemoMenu(false);
                      }}
                      disabled={isListening}
                      className="w-full px-4 py-3 text-left hover:bg-gray-700 rounded-b-lg transition-colors flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Upload className="w-4 h-4 text-teal-400" />
                      <div>
                        <div className="text-sm font-medium text-white">Ladda upp ljudfil</div>
                        <div className="text-xs text-gray-400">Välj en WAV-fil att analysera</div>
                      </div>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Training menu with dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowTrainingMenu(!showTrainingMenu);
                  setShowKundsamtalMenu(false);
                  setShowDemoMenu(false);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                title="Säljträning"
              >
                <GraduationCap className="w-4 h-4" />
                <span className="text-sm">Säljträning</span>
              </button>

              {showTrainingMenu && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowTrainingMenu(false)}
                  />
                  {/* Dropdown menu */}
                  <div className="absolute right-0 mt-2 w-56 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-20">
                    <button
                      onClick={() => {
                        setShowTraining(true);
                        setShowTrainingMenu(false);
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-gray-700 rounded-t-lg transition-colors flex items-center gap-3"
                    >
                      <Play className="w-4 h-4 text-purple-400" />
                      <div>
                        <div className="text-sm font-medium text-white">Starta träning</div>
                        <div className="text-xs text-gray-400">Träna mot AI-kunder</div>
                      </div>
                    </button>
                    <div className="border-t border-gray-700" />
                    <button
                      onClick={() => {
                        setShowScenariosAdmin(true);
                        setShowTrainingMenu(false);
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-gray-700 rounded-b-lg transition-colors flex items-center gap-3"
                    >
                      <Settings className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="text-sm font-medium text-white">Hantera scenarier</div>
                        <div className="text-xs text-gray-400">Skapa och redigera</div>
                      </div>
                    </button>
                  </div>
                </>
              )}
            </div>

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
        {/* Hidden file input for upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".wav,audio/wav,audio/wave"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* Processing indicator */}
        {isProcessing && (
          <div className="bg-gray-800 rounded-xl p-4 mb-6">
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
          </div>
        )}

        {/* Call controls - show above panels */}
        {(showTranscriptPanel || showCoachingPanel) && !isProcessing && (
          <div className="bg-gray-800 rounded-xl p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {!isActive ? (
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
                    </>
                  )}
                </>
              ) : (
                <>
                  <button
                    onClick={handleStop}
                    className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors"
                  >
                    <Square className="w-5 h-5" />
                    Stoppa
                  </button>

                  <button
                    onClick={async () => {
                      if (status === 'recording') {
                        stopListening();
                        pauseSession();
                      } else if (status === 'paused') {
                        await startListening();
                        resumeSession();
                      }
                    }}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                      status === 'paused'
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

            {isActive && (
              <div className="text-sm text-gray-400">
                {status === 'recording' && 'Inspelning pågår...'}
                {status === 'paused' && 'Pausad'}
              </div>
            )}
          </div>
        )}

        {/* Two-column layout - conditional rendering based on panel toggles */}
        <div className={`grid gap-6 ${
          showTranscriptPanel && showCoachingPanel
            ? 'grid-cols-1 lg:grid-cols-2'
            : 'grid-cols-1'
        }`}>
          {showTranscriptPanel && (
            <TranscriptPanel
              segments={segments}
              interimText={interimText}
              isListening={isListening}
            />
          )}

          {showCoachingPanel && (
            <CoachingPanel tips={coachingTips} />
          )}
        </div>

        {/* Empty state when both panels are hidden */}
        {!showTranscriptPanel && !showCoachingPanel && (
          <div className="bg-gray-800 rounded-xl p-12 text-center">
            <Phone className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">Välkommen till Sales Coach AI</h3>
            <p className="text-gray-500 mb-6">
              Starta ett samtal eller aktivera panelerna för att komma igång.
            </p>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={handleToggleTranscript}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Visa transkript
              </button>
              <button
                onClick={handleToggleCoaching}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Visa coaching
              </button>
            </div>
          </div>
        )}

        {/* Live Analysis Panel - shown during active call */}
        {isActive && (
          <div className="mt-6">
            <LiveCallAnalysisPanel
              analysis={liveAnalysis}
              onUpdate={updateLiveAnalysis}
            />
          </div>
        )}

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
      {showScenariosAdmin && <ScenariosAdmin onClose={() => setShowScenariosAdmin(false)} />}
      {showHistory && <HistoryPanel onClose={() => setShowHistory(false)} />}
      {showTraining && <TrainingMode onClose={() => setShowTraining(false)} />}
    </div>
  );
};
