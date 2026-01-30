import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, RotateCcw, Volume2, Mic, Target, TrendingUp, Lightbulb, ThumbsUp, Zap } from 'lucide-react';
import { type TrainingScenario } from '../data/trainingScenarios';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { supabase } from '../lib/supabase';

// Azure Speech Configuration
const SPEECH_CONFIG = {
  subscriptionKey: import.meta.env.VITE_AZURE_SPEECH_KEY || 'demo-mode',
  region: import.meta.env.VITE_AZURE_SPEECH_REGION || 'swedencentral',
  language: 'sv-SE'
};

interface Message {
  role: 'customer' | 'salesperson';
  content: string;
  timestamp: number;
}

interface CoachingFeedback {
  customerReply: string;
  customerSentiment: string;
  interestLevel: number;
  coachingTips: string[];
  whatWentWell: string[];
  whatToImprove: string[];
  nextBestAction: string;
  shouldEndConversation: boolean;
  conversationOutcome: string;
}

interface TrainingModeProps {
  onClose: () => void;
}

type CoachingLevel = 'full' | 'medium' | 'minimal';

export const TrainingMode: React.FC<TrainingModeProps> = ({ onClose }) => {
  // State
  const [scenarios, setScenarios] = useState<TrainingScenario[]>([]);
  const [isLoadingScenarios, setIsLoadingScenarios] = useState(true);
  const [selectedScenario, setSelectedScenario] = useState<TrainingScenario | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Message[]>([]);
  const [currentFeedback, setCurrentFeedback] = useState<CoachingFeedback | null>(null);
  const [interestLevel, setInterestLevel] = useState(50);
  const [isWaitingForAI, setIsWaitingForAI] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [coachingLevel, setCoachingLevel] = useState<CoachingLevel>('full');
  const [prevInterestLevel, setPrevInterestLevel] = useState(50);
  const [interestLevelChanged, setInterestLevelChanged] = useState(false);
  const [feedbackAnimation, setFeedbackAnimation] = useState(false);
  const [interestTrend, setInterestTrend] = useState<'up' | 'down' | 'neutral'>('neutral');

  // Helper function to get color based on interest level
  const getInterestColor = (level: number) => {
    if (level >= 70) return { bg: 'bg-green-600', text: 'text-green-400', border: 'border-green-600', emoji: '😊' };
    if (level >= 40) return { bg: 'bg-yellow-600', text: 'text-yellow-400', border: 'border-yellow-600', emoji: '😐' };
    return { bg: 'bg-red-600', text: 'text-red-400', border: 'border-red-600', emoji: '😠' };
  };

  // Speech recognition hook with proper configuration
  const speechHookOptions = {
    ...SPEECH_CONFIG,
    onFinalResult: (text: string) => {
      setTranscript(text);
    },
    onInterimResult: (text: string) => {
      setTranscript(text);
    }
  };

  const { isListening, startListening, stopListening } = useSpeechRecognition(speechHookOptions);
  const { speak, isSpeaking, stop: stopSpeaking } = useTextToSpeech();

  // Helper to reset transcript
  const resetTranscript = () => setTranscript('');

  const lastTranscriptRef = useRef('');
  const isPausedRef = useRef(false);

  // Keep isPausedRef in sync with isPaused state
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  // Detect interest level changes and trigger animations
  useEffect(() => {
    if (interestLevel !== prevInterestLevel) {
      setInterestLevelChanged(true);

      // Determine trend
      if (interestLevel > prevInterestLevel) {
        setInterestTrend('up');
      } else if (interestLevel < prevInterestLevel) {
        setInterestTrend('down');
      } else {
        setInterestTrend('neutral');
      }

      setPrevInterestLevel(interestLevel);

      // Reset animation after 600ms
      const timer = setTimeout(() => {
        setInterestLevelChanged(false);
      }, 600);

      return () => clearTimeout(timer);
    }
  }, [interestLevel, prevInterestLevel]);

  // Trigger feedback animation when new feedback arrives
  useEffect(() => {
    if (currentFeedback) {
      setFeedbackAnimation(true);
      const timer = setTimeout(() => {
        setFeedbackAnimation(false);
      }, 600);

      return () => clearTimeout(timer);
    }
  }, [currentFeedback]);

  // Fetch training scenarios directly from Supabase (much faster than API proxy)
  useEffect(() => {
    const fetchScenarios = async () => {
      try {
        const { data, error } = await supabase
          .from('training_scenarios')
          .select('*')
          .eq('is_global', true)
          .order('difficulty', { ascending: true })
          .order('name', { ascending: true });

        if (error) {
          console.error('Supabase error:', error);
        } else if (data) {
          // Transform snake_case to camelCase
          const transformedScenarios = data.map((scenario: any) => ({
            id: scenario.id,
            name: scenario.name,
            difficulty: scenario.difficulty,
            description: scenario.description,
            personaName: scenario.persona_name,
            personaRole: scenario.persona_role,
            companyName: scenario.company_name,
            companySize: scenario.company_size,
            industry: scenario.industry,
            painPoints: scenario.pain_points,
            budget: scenario.budget,
            decisionTimeframe: scenario.decision_timeframe,
            personality: scenario.personality,
            objectives: scenario.objectives,
            competitors: scenario.competitors,
            openingLine: scenario.opening_line,
            successCriteria: scenario.success_criteria,
            commonMistakes: scenario.common_mistakes,
            voiceName: scenario.voice_name
          }));
          setScenarios(transformedScenarios);
        }
      } catch (error) {
        console.error('Error fetching scenarios:', error);
      } finally {
        setIsLoadingScenarios(false);
      }
    };

    fetchScenarios();
  }, []);

  // Start training session
  const startTraining = async (scenario: TrainingScenario) => {
    setSelectedScenario(scenario);
    setIsActive(true);
    setConversationHistory([]);
    setCurrentFeedback(null);
    setInterestLevel(50);

    // AI Customer speaks first
    await speak(scenario.openingLine, { voice: scenario.voiceName });

    // Add to history
    setConversationHistory([{
      role: 'customer',
      content: scenario.openingLine,
      timestamp: Date.now()
    }]);

    // Start listening for salesperson
    setTimeout(() => {
      startListening();
    }, 500);
  };

  // Send salesperson's response to AI
  const sendSalesResponse = async () => {
    if (!transcript || isWaitingForAI) return;

    // Stop listening
    stopListening();

    const salesText = transcript;
    lastTranscriptRef.current = salesText;

    // Add salesperson message
    const salesMessage: Message = {
      role: 'salesperson',
      content: salesText,
      timestamp: Date.now()
    };
    setConversationHistory(prev => [...prev, salesMessage]);

    // Reset transcript
    resetTranscript();

    // Get AI customer response - PARALLEL approach for speed
    setIsWaitingForAI(true);

    const requestData = {
      scenario: selectedScenario,
      conversationHistory: [...conversationHistory, salesMessage],
      salesResponse: salesText
    };

    try {
      // 1. QUICK: Get immediate customer response (very fast)
      const quickResponse = await fetch('/api/ai-customer-quick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });

      const quickData = await quickResponse.json();

      if (quickData.success) {
        // Show customer reply immediately
        setInterestLevel(quickData.interestLevel);

        // Speak customer's reply
        await speak(quickData.customerReply, { voice: selectedScenario?.voiceName });

        // Add customer message
        setConversationHistory(prev => [...prev, {
          role: 'customer',
          content: quickData.customerReply,
          timestamp: Date.now()
        }]);

        // Check if conversation should end
        if (quickData.shouldEndConversation) {
          setIsWaitingForAI(false);
          stopTraining();
          return;
        }

        // Continue listening immediately (better UX)
        if (!isPausedRef.current) {
          setTimeout(() => {
            startListening();
          }, 500);
        }

        setIsWaitingForAI(false);

        // 2. BACKGROUND: Get detailed coaching feedback (parallel, shows when ready)
        fetch('/api/ai-customer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestData)
        })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            // Update coaching feedback when ready (user already saw customer reply)
            setCurrentFeedback(data);
            // Update interest level again with full calculation
            setInterestLevel(data.interestLevel);
          }
        })
        .catch(error => {
          console.error('Coaching feedback error:', error);
        });
      }
    } catch (error) {
      console.error('AI Customer error:', error);
      // Restart listening on error only if not paused
      if (!isPausedRef.current) {
        setTimeout(() => {
          startListening();
        }, 500);
      }
      setIsWaitingForAI(false);
    }
  };

  // Keyboard shortcut: Enter to send response
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && isListening && transcript && !isWaitingForAI) {
        e.preventDefault();
        sendSalesResponse();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isListening, transcript, isWaitingForAI]);

  const pauseTraining = () => {
    console.log('🟡 Pausar träning...');
    console.log('   - isListening:', isListening);
    console.log('   - isSpeaking:', isSpeaking);
    setIsPaused(true);
    stopListening();
    stopSpeaking();
    console.log('   ✅ Paus klar');
  };

  const resumeTraining = () => {
    console.log('🟢 Återupptar träning...');
    setIsPaused(false);
    // Only start listening if AI is not speaking or waiting
    if (!isSpeaking && !isWaitingForAI) {
      startListening();
    }
  };

  const stopTraining = () => {
    console.log('🔴 Stoppar träning...');
    stopListening();
    stopSpeaking();
    setIsActive(false);
    setIsPaused(false);
    setSelectedScenario(null);
    resetTranscript();
    setConversationHistory([]);
    setCurrentFeedback(null);

    // Close the entire training mode and go back to main menu
    console.log('🚪 Stänger träningsmodulen...');
    onClose();
  };

  const restartTraining = () => {
    stopTraining();
    if (selectedScenario) {
      setTimeout(() => startTraining(selectedScenario), 500);
    }
  };

  // Render scenario selection
  if (!isActive && !selectedScenario) {
    return (
      <>
        <style>{`
          @keyframes pulse-glow {
            0%, 100% {
              box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
            }
            50% {
              box-shadow: 0 0 20px 8px rgba(59, 130, 246, 0.3);
            }
          }

          @keyframes slide-in-right {
            from {
              transform: translateX(20px);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }

          @keyframes bounce-in {
            0% {
              transform: scale(0.8);
              opacity: 0;
            }
            50% {
              transform: scale(1.05);
            }
            100% {
              transform: scale(1);
              opacity: 1;
            }
          }

          .interest-pulse {
            animation: pulse-glow 0.6s ease-out;
          }

          .feedback-slide {
            animation: slide-in-right 0.4s ease-out;
          }

          .bounce-in {
            animation: bounce-in 0.5s ease-out;
          }
        `}</style>
        <div className="fixed inset-0 bg-gray-900 z-50 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">🎭 AI Säljträning</h1>
              <p className="text-gray-400">Träna mot AI-kunder i realistiska scenarios</p>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center gap-2"
            >
              <X size={18} />
              Stäng
            </button>
          </div>

          {/* Loading state */}
          {isLoadingScenarios && (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-3 text-gray-400">Laddar träningsscenarier...</span>
            </div>
          )}

          {/* Difficulty filters */}
          {!isLoadingScenarios && (
            <>
              <div className="mb-6 flex gap-3">
                {(['easy', 'medium', 'hard'] as const).map(diff => (
                  <button
                    key={diff}
                    className={`px-4 py-2 rounded-lg ${
                      diff === 'easy' ? 'bg-green-600/20 text-green-400' :
                      diff === 'medium' ? 'bg-yellow-600/20 text-yellow-400' :
                      'bg-red-600/20 text-red-400'
                    }`}
                  >
                    {diff === 'easy' ? '😊 Lätt' : diff === 'medium' ? '😐 Medel' : '😰 Svår'}
                  </button>
                ))}
              </div>

              {/* Scenario cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {scenarios.map(scenario => (
              <div
                key={scenario.id}
                className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-colors cursor-pointer"
                onClick={() => startTraining(scenario)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-1">
                      {scenario.name}
                    </h3>
                    <span className={`text-xs px-2 py-1 rounded ${
                      scenario.difficulty === 'easy' ? 'bg-green-600/20 text-green-400' :
                      scenario.difficulty === 'medium' ? 'bg-yellow-600/20 text-yellow-400' :
                      'bg-red-600/20 text-red-400'
                    }`}>
                      {scenario.difficulty === 'easy' ? 'Lätt' : scenario.difficulty === 'medium' ? 'Medel' : 'Svår'}
                    </span>
                  </div>
                </div>

                <p className="text-gray-400 text-sm mb-4">{scenario.description}</p>

                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-gray-500 min-w-[80px]">Persona:</span>
                    <span className="text-white">{scenario.personaName} - {scenario.personaRole}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-gray-500 min-w-[80px]">Företag:</span>
                    <span className="text-white">{scenario.companyName} ({scenario.companySize})</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-gray-500 min-w-[80px]">Mål:</span>
                    <span className="text-gray-300">{scenario.objectives[0]}</span>
                  </div>
                </div>

                <button
                  className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg flex items-center justify-center gap-2"
                >
                  <Play size={18} />
                  Starta träning
                </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      </>
    );
  }

  // Render active training session
  return (
    <>
      <style>{`
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
          }
          50% {
            box-shadow: 0 0 20px 8px rgba(59, 130, 246, 0.3);
          }
        }

        @keyframes slide-in-right {
          from {
            transform: translateX(20px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes bounce-in {
          0% {
            transform: scale(0.8);
            opacity: 0;
          }
          50% {
            transform: scale(1.05);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .interest-pulse {
          animation: pulse-glow 0.6s ease-out;
        }

        .feedback-slide {
          animation: slide-in-right 0.4s ease-out;
        }

        .bounce-in {
          animation: bounce-in 0.5s ease-out;
        }
      `}</style>
    <div className="fixed inset-0 bg-gray-900 z-50 flex">
      {/* Left: Conversation */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-gray-800 border-b border-gray-700 p-4">
          {/* Pause indicator */}
          {isPaused && (
            <div className="mb-3 px-4 py-2 bg-yellow-600/20 border border-yellow-600/50 rounded-lg flex items-center gap-2">
              <Pause className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-yellow-400 font-medium">Träningen är pausad</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">{selectedScenario?.name}</h2>
              <p className="text-sm text-gray-400">{selectedScenario?.personaName} - {selectedScenario?.personaRole}</p>
            </div>
            <div className="flex items-center gap-2">
              {/* Enhanced Interest Level Indicator */}
              <div className={`flex items-center gap-3 px-4 py-2 rounded-lg border-2 ${getInterestColor(interestLevel).border} bg-gray-800/50 transition-all duration-500 ${interestLevelChanged ? 'interest-pulse' : ''}`}>
                <span className="text-2xl">{getInterestColor(interestLevel).emoji}</span>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-400 uppercase font-semibold">Kundintresse</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getInterestColor(interestLevel).bg} transition-all duration-500`}
                        style={{ width: `${interestLevel}%` }}
                      />
                    </div>
                    <span className={`text-sm font-bold ${getInterestColor(interestLevel).text}`}>
                      {interestLevel}%
                    </span>
                  </div>
                </div>
              </div>
              {!isPaused ? (
                <button
                  onClick={(e) => {
                    console.log('🔘 PAUS-KNAPP KLICKAD!', e);
                    pauseTraining();
                  }}
                  className="p-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
                  title="Pausa träningen"
                  aria-label="Pausa träningen"
                  style={{ position: 'relative', zIndex: 100 }}
                >
                  <Pause size={18} />
                </button>
              ) : (
                <button
                  onClick={(e) => {
                    console.log('🔘 ÅTERUPPTA-KNAPP KLICKAD!', e);
                    resumeTraining();
                  }}
                  className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  title="Återuppta träningen"
                  aria-label="Återuppta träningen"
                  style={{ position: 'relative', zIndex: 100 }}
                >
                  <Play size={18} />
                </button>
              )}
              <button
                onClick={(e) => {
                  console.log('🔘 STARTA OM-KNAPP KLICKAD!', e);
                  restartTraining();
                }}
                className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                title="Starta om träningen"
                aria-label="Starta om träningen"
                style={{ position: 'relative', zIndex: 100 }}
              >
                <RotateCcw size={18} />
              </button>
              <button
                onClick={(e) => {
                  console.log('🔘 AVSLUTA-KNAPP KLICKAD!', e);
                  stopTraining();
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                title="Avsluta träningen"
                aria-label="Avsluta träningen"
                style={{ position: 'relative', zIndex: 100 }}
              >
                Avsluta
              </button>
            </div>
          </div>
        </div>

        {/* Conversation */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {conversationHistory.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'salesperson' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-4 ${
                  msg.role === 'salesperson'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-100'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {msg.role === 'customer' ? (
                    <Volume2 className="w-4 h-4" />
                  ) : (
                    <Mic className="w-4 h-4" />
                  )}
                  <span className="text-xs opacity-75">
                    {msg.role === 'customer' ? selectedScenario?.personaName : 'Du'}
                  </span>
                </div>
                <p>{msg.content}</p>
              </div>
            </div>
          ))}

          {(isListening || isWaitingForAI || isSpeaking) && (
            <div className="flex justify-center">
              <div className="bg-gray-800 rounded-lg px-4 py-2 flex items-center gap-2">
                {isListening && (
                  <>
                    <Mic className="w-4 h-4 text-red-500 animate-pulse" />
                    <span className="text-sm text-gray-400">Lyssnar...</span>
                  </>
                )}
                {isWaitingForAI && (
                  <>
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm text-gray-400">AI tänker...</span>
                  </>
                )}
                {isSpeaking && (
                  <>
                    <Volume2 className="w-4 h-4 text-green-500 animate-pulse" />
                    <span className="text-sm text-gray-400">Kunden pratar...</span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Live transcript */}
        {transcript && isListening && (
          <div className="bg-gray-800 border-t border-gray-700 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Mic className="w-4 h-4 text-red-500" />
                <span className="text-sm text-gray-400">Du säger:</span>
              </div>
              <button
                onClick={sendSalesResponse}
                disabled={!transcript || isWaitingForAI}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-colors flex items-center gap-2"
              >
                Skicka svar
                <kbd className="px-1.5 py-0.5 bg-blue-700 rounded text-xs">Enter</kbd>
              </button>
            </div>
            <p className="text-white">{transcript}</p>
          </div>
        )}
      </div>

      {/* Right: Coaching Panel */}
      <div className="w-96 bg-gray-800 border-l border-gray-700 overflow-y-auto">
        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-500" />
              Realtids Coaching
            </h3>

            {/* Coaching Level Selector */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setCoachingLevel('full')}
                className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  coachingLevel === 'full'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                }`}
              >
                🎓 Nybörjare
              </button>
              <button
                onClick={() => setCoachingLevel('medium')}
                className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  coachingLevel === 'medium'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                }`}
              >
                💼 Erfaren
              </button>
              <button
                onClick={() => setCoachingLevel('minimal')}
                className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  coachingLevel === 'minimal'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                }`}
              >
                🏆 Expert
              </button>
            </div>
          </div>

          {currentFeedback && (
            <>
              {/* What went well - Only for Full level */}
              {coachingLevel === 'full' && currentFeedback.whatWentWell && currentFeedback.whatWentWell.length > 0 && (
                <div className={`bg-green-600/10 border border-green-600/30 rounded-lg p-4 ${feedbackAnimation ? 'feedback-slide' : ''}`}>
                  <h4 className="text-sm font-semibold text-green-400 mb-2 flex items-center gap-2">
                    <ThumbsUp className="w-4 h-4" />
                    Bra jobbat!
                    {feedbackAnimation && (
                      <span className="px-1.5 py-0.5 bg-green-500 text-white text-xs rounded-full animate-pulse">NY</span>
                    )}
                  </h4>
                  <ul className="space-y-1">
                    {currentFeedback.whatWentWell.map((item, idx) => (
                      <li key={idx} className="text-sm text-green-300">• {item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* What to improve - For Full and Medium levels */}
              {(coachingLevel === 'full' || coachingLevel === 'medium') && currentFeedback.whatToImprove && currentFeedback.whatToImprove.length > 0 && (
                <div className={`bg-orange-600/10 border border-orange-600/30 rounded-lg p-4 ${feedbackAnimation ? 'feedback-slide' : ''}`}>
                  <h4 className="text-sm font-semibold text-orange-400 mb-2 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" />
                    Förbättra
                    {feedbackAnimation && (
                      <span className="px-1.5 py-0.5 bg-orange-500 text-white text-xs rounded-full animate-pulse">NY</span>
                    )}
                  </h4>
                  <ul className="space-y-1">
                    {currentFeedback.whatToImprove.map((item, idx) => (
                      <li key={idx} className="text-sm text-orange-300">• {item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Next best action - For Full and Medium levels */}
              {(coachingLevel === 'full' || coachingLevel === 'medium') && currentFeedback.nextBestAction && (
                <div className={`bg-blue-600/10 border border-blue-600/30 rounded-lg p-4 ${feedbackAnimation ? 'feedback-slide' : ''}`}>
                  <h4 className="text-sm font-semibold text-blue-400 mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Nästa steg
                    {feedbackAnimation && (
                      <span className="px-1.5 py-0.5 bg-blue-500 text-white text-xs rounded-full animate-pulse">NY</span>
                    )}
                  </h4>
                  <p className="text-sm text-blue-300">{currentFeedback.nextBestAction}</p>
                </div>
              )}

              {/* Coaching tips - Only for Full level */}
              {coachingLevel === 'full' && currentFeedback.coachingTips && currentFeedback.coachingTips.length > 0 && (
                <div className={`bg-purple-600/10 border border-purple-600/30 rounded-lg p-4 ${feedbackAnimation ? 'feedback-slide' : ''}`}>
                  <h4 className="text-sm font-semibold text-purple-400 mb-2 flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Tips
                    {feedbackAnimation && (
                      <span className="px-1.5 py-0.5 bg-purple-500 text-white text-xs rounded-full animate-pulse">NY</span>
                    )}
                  </h4>
                  <ul className="space-y-1">
                    {currentFeedback.coachingTips.map((tip, idx) => (
                      <li key={idx} className="text-sm text-purple-300">• {tip}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Customer sentiment - Always show interest level, sentiment only for Full */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-300 mb-3">📊 Kundens läge</h4>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span className="flex items-center gap-1">
                        Intressenivå
                        {interestTrend === 'up' && (
                          <TrendingUp className="w-3 h-3 text-green-400" />
                        )}
                        {interestTrend === 'down' && (
                          <TrendingUp className="w-3 h-3 text-red-400 rotate-180" />
                        )}
                      </span>
                      <span className="flex items-center gap-1">
                        {currentFeedback.interestLevel}%
                        {interestTrend === 'up' && <span className="text-green-400 text-xs">↑</span>}
                        {interestTrend === 'down' && <span className="text-red-400 text-xs">↓</span>}
                      </span>
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          currentFeedback.interestLevel >= 70 ? 'bg-green-500' :
                          currentFeedback.interestLevel >= 40 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${currentFeedback.interestLevel}%` }}
                      />
                    </div>
                  </div>
                  {coachingLevel === 'full' && (
                    <div className="text-xs text-gray-400">
                      Sentiment: <span className="text-white capitalize">{currentFeedback.customerSentiment.replace('_', ' ')}</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Scenario info - Content varies by coaching level */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-300 mb-3">📋 Scenario-info</h4>
            <div className="space-y-2 text-xs">
              {/* Pain Points - For Full and Medium levels */}
              {(coachingLevel === 'full' || coachingLevel === 'medium') && (
                <div>
                  <span className="text-gray-400">Pain Points:</span>
                  <ul className="mt-1 space-y-1">
                    {selectedScenario?.painPoints.map((point, idx) => (
                      <li key={idx} className="text-gray-300">• {point}</li>
                    ))}
                  </ul>
                </div>
              )}
              {/* Budget - For Full and Minimal levels */}
              {(coachingLevel === 'full' || coachingLevel === 'minimal') && (
                <div>
                  <span className="text-gray-400">Budget:</span>
                  <span className="text-gray-300 ml-2">{selectedScenario?.budget}</span>
                </div>
              )}
              {/* Decision timeframe - For Full and Minimal levels */}
              {(coachingLevel === 'full' || coachingLevel === 'minimal') && (
                <div>
                  <span className="text-gray-400">Beslutshorisonten:</span>
                  <span className="text-gray-300 ml-2">{selectedScenario?.decisionTimeframe}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};
