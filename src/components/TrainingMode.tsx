import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, RotateCcw, Volume2, Mic, Trophy, Target, TrendingUp, MessageSquare } from 'lucide-react';
import { TRAINING_SCENARIOS, type TrainingScenario } from '../data/trainingScenarios';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useTextToSpeech } from '../hooks/useTextToSpeech';

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

export const TrainingMode: React.FC<TrainingModeProps> = ({ onClose }) => {
  // State
  const [selectedScenario, setSelectedScenario] = useState<TrainingScenario | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Message[]>([]);
  const [currentFeedback, setCurrentFeedback] = useState<CoachingFeedback | null>(null);
  const [interestLevel, setInterestLevel] = useState(50);
  const [isWaitingForAI, setIsWaitingForAI] = useState(false);
  const [hasSpokenCustomerReply, setHasSpokenCustomerReply] = useState(false);

  // Hooks
  const { transcript, isListening, startListening, stopListening, resetTranscript } = useSpeechRecognition();
  const { speak, isSpeaking, stop: stopSpeaking } = useTextToSpeech();

  const lastTranscriptRef = useRef('');

  // Start training session
  const startTraining = async (scenario: TrainingScenario) => {
    setSelectedScenario(scenario);
    setIsActive(true);
    setConversationHistory([]);
    setCurrentFeedback(null);
    setInterestLevel(50);

    // AI Customer speaks first
    await speak(scenario.openingLine);

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

  // Handle salesperson's response
  useEffect(() => {
    if (!isActive || isPaused || isListening || !transcript) return;
    if (transcript === lastTranscriptRef.current) return;

    const handleSalesResponse = async () => {
      lastTranscriptRef.current = transcript;

      // Add salesperson message
      const salesMessage: Message = {
        role: 'salesperson',
        content: transcript,
        timestamp: Date.now()
      };
      setConversationHistory(prev => [...prev, salesMessage]);

      // Get AI customer response
      setIsWaitingForAI(true);
      try {
        const response = await fetch('/api/ai-customer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            scenario: selectedScenario,
            conversationHistory: [...conversationHistory, salesMessage],
            salesResponse: transcript
          })
        });

        const data = await response.json();

        if (data.success) {
          setCurrentFeedback(data);
          setInterestLevel(data.interestLevel);

          // Speak customer's reply
          setHasSpokenCustomerReply(false);
          await speak(data.customerReply);
          setHasSpokenCustomerReply(true);

          // Add customer message
          setConversationHistory(prev => [...prev, {
            role: 'customer',
            content: data.customerReply,
            timestamp: Date.now()
          }]);

          // Check if conversation should end
          if (data.shouldEndConversation) {
            stopTraining();
            return;
          }

          // Continue listening
          resetTranscript();
          setTimeout(() => {
            startListening();
          }, 500);
        }
      } catch (error) {
        console.error('AI Customer error:', error);
      } finally {
        setIsWaitingForAI(false);
      }
    };

    // Debounce - wait for pause in speech
    const timeout = setTimeout(handleSalesResponse, 2000);
    return () => clearTimeout(timeout);
  }, [transcript, isListening, isActive]);

  const pauseTraining = () => {
    setIsPaused(true);
    stopListening();
    stopSpeaking();
  };

  const resumeTraining = () => {
    setIsPaused(false);
    startListening();
  };

  const stopTraining = () => {
    setIsActive(false);
    setIsPaused(false);
    stopListening();
    stopSpeaking();
    resetTranscript();
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

          {/* Difficulty filters */}
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
            {TRAINING_SCENARIOS.map(scenario => (
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
        </div>
      </div>
    );
  }

  // Render active training session
  return (
    <div className="fixed inset-0 bg-gray-900 z-50 flex">
      {/* Left: Conversation */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-gray-800 border-b border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">{selectedScenario?.name}</h2>
              <p className="text-sm text-gray-400">{selectedScenario?.personaName} - {selectedScenario?.personaRole}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1 bg-gray-700 rounded-lg">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-white">{interestLevel}% intresse</span>
              </div>
              {!isPaused ? (
                <button
                  onClick={pauseTraining}
                  className="p-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg"
                >
                  <Pause size={18} />
                </button>
              ) : (
                <button
                  onClick={resumeTraining}
                  className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                >
                  <Play size={18} />
                </button>
              )}
              <button
                onClick={restartTraining}
                className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
              >
                <RotateCcw size={18} />
              </button>
              <button
                onClick={stopTraining}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
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
            <div className="flex items-center gap-2 mb-2">
              <Mic className="w-4 h-4 text-red-500" />
              <span className="text-sm text-gray-400">Du säger:</span>
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
          </div>

          {currentFeedback && (
            <>
              {/* What went well */}
              {currentFeedback.whatWentWell && currentFeedback.whatWentWell.length > 0 && (
                <div className="bg-green-600/10 border border-green-600/30 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-green-400 mb-2">✅ Bra jobbat!</h4>
                  <ul className="space-y-1">
                    {currentFeedback.whatWentWell.map((item, idx) => (
                      <li key={idx} className="text-sm text-green-300">• {item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* What to improve */}
              {currentFeedback.whatToImprove && currentFeedback.whatToImprove.length > 0 && (
                <div className="bg-orange-600/10 border border-orange-600/30 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-orange-400 mb-2">💡 Förbättra</h4>
                  <ul className="space-y-1">
                    {currentFeedback.whatToImprove.map((item, idx) => (
                      <li key={idx} className="text-sm text-orange-300">• {item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Next best action */}
              {currentFeedback.nextBestAction && (
                <div className="bg-blue-600/10 border border-blue-600/30 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-blue-400 mb-2">🎯 Nästa steg</h4>
                  <p className="text-sm text-blue-300">{currentFeedback.nextBestAction}</p>
                </div>
              )}

              {/* Coaching tips */}
              {currentFeedback.coachingTips && currentFeedback.coachingTips.length > 0 && (
                <div className="bg-purple-600/10 border border-purple-600/30 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-purple-400 mb-2">💬 Tips</h4>
                  <ul className="space-y-1">
                    {currentFeedback.coachingTips.map((tip, idx) => (
                      <li key={idx} className="text-sm text-purple-300">• {tip}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Customer sentiment */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-300 mb-3">📊 Kundens läge</h4>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Intressenivå</span>
                      <span>{currentFeedback.interestLevel}%</span>
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
                  <div className="text-xs text-gray-400">
                    Sentiment: <span className="text-white capitalize">{currentFeedback.customerSentiment.replace('_', ' ')}</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Scenario info */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-300 mb-3">📋 Scenario-info</h4>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-gray-400">Pain Points:</span>
                <ul className="mt-1 space-y-1">
                  {selectedScenario?.painPoints.map((point, idx) => (
                    <li key={idx} className="text-gray-300">• {point}</li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="text-gray-400">Budget:</span>
                <span className="text-gray-300 ml-2">{selectedScenario?.budget}</span>
              </div>
              <div>
                <span className="text-gray-400">Beslutshorisonten:</span>
                <span className="text-gray-300 ml-2">{selectedScenario?.decisionTimeframe}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
