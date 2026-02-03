import React, { useCallback, useEffect, useRef } from 'react';
import { Play, Settings, LogOut, User, GraduationCap, Phone, Mic, Square, Pause, Upload, Beaker, HelpCircle, Database, Wand2, ClipboardList } from 'lucide-react';
import { useSessionStore } from '../store/sessionStore';
import { useSpeechRecognition, useMockSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useAudioFileTranscription } from '../hooks/useAudioFileTranscription';
import { TranscriptPanel } from './TranscriptPanel';
import { CoachingPanel } from './CoachingPanel';
import { AdminPanel } from './AdminPanel';
import { CoachingAdminPanel } from './CoachingAdminPanel';
import { ScenariosAdmin } from './ScenariosAdmin';
import { UserProductsAdmin } from './UserProductsAdmin';
import { DemoAdminPanel } from './DemoAdminPanel';
import { DemoMode } from './DemoMode';
import { RAGTester } from './RAGTester';
import { ScenarioGenerator } from './ScenarioGenerator';
import { HistoryPanel } from './HistoryPanel';
import { LiveCallAnalysisPanel } from './LiveCallAnalysisPanel';
import { TrainingMode } from './TrainingMode';
import { KundsamtalDropdown } from './KundsamtalDropdown';
import { Dashboard } from './Dashboard';
import { HelpPanel } from './HelpPanel';
import { KnowledgeBaseManager } from './KnowledgeBaseManager';
import { ImportTranscriptModal } from './ImportTranscriptModal';
import { PostCallQuestionnaire } from './PostCallQuestionnaire';
import { AccountsList } from './AccountsList';
import { StartSessionModal } from './StartSessionModal';
import { MeetingAssistant } from './MeetingAssistant';
import { StartMeetingAssistantModal } from './StartMeetingAssistantModal';
import { useMeetingAssistantStore } from '../store/meetingAssistantStore';
import { useAuth } from '../contexts/AuthContext';
import { getAllDemoScripts } from '../data/demoScripts';
import { findOrCreateAccount, linkSessionToAccount } from '../lib/accountOperations';
import { supabase } from '../lib/supabase';

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
    isGatewayEnabled,
    isGatewayConnected,
    startSession,
    stopSession,
    pauseSession,
    resumeSession,
    addInterimTranscript,
    addFinalTranscript,
    updateLiveAnalysis,
    initGateway,
    disconnectGateway
  } = useSessionStore();

  const { user, signOut } = useAuth();

  const [showAdmin, setShowAdmin] = React.useState(false);
  const [showCoachingAdmin, setShowCoachingAdmin] = React.useState(false);
  const [showScenariosAdmin, setShowScenariosAdmin] = React.useState(false);
  const [showUserProductsAdmin, setShowUserProductsAdmin] = React.useState(false);
  const [showDemoAdmin, setShowDemoAdmin] = React.useState(false);
  const [showDemoMode, setShowDemoMode] = React.useState(false);
  const [showRAGTester, setShowRAGTester] = React.useState(false);
  const [showScenarioGenerator, setShowScenarioGenerator] = React.useState(false);
  const [showHistory, setShowHistory] = React.useState(false);
  const [showTraining, setShowTraining] = React.useState(false);
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  const [showTrainingMenu, setShowTrainingMenu] = React.useState(false);
  const [showKundsamtalMenu, setShowKundsamtalMenu] = React.useState(false);
  const [showDemoMenu, setShowDemoMenu] = React.useState(false);
  const [showHelp, setShowHelp] = React.useState(false);
  const [showKnowledgeBase, setShowKnowledgeBase] = React.useState(false);
  const [showImportTranscript, setShowImportTranscript] = React.useState(false);
  const [showAccountsList, setShowAccountsList] = React.useState(false);
  const [showStartSessionModal, setShowStartSessionModal] = React.useState(false);
  const [showMeetingAssistant, setShowMeetingAssistant] = React.useState(false);
  const [showStartMeetingAssistantModal, setShowStartMeetingAssistantModal] = React.useState(false);

  // Meeting Assistant store
  const { isActive: meetingAssistantActive } = useMeetingAssistantStore();

  // Panel visibility toggles (load from localStorage)
  const [showTranscriptPanel, setShowTranscriptPanel] = React.useState(() => {
    const saved = localStorage.getItem('showTranscriptPanel');
    return saved !== null ? saved === 'true' : false; // Default to false to show Dashboard
  });
  const [showCoachingPanel, setShowCoachingPanel] = React.useState(() => {
    const saved = localStorage.getItem('showCoachingPanel');
    return saved !== null ? saved === 'true' : false; // Default to false to show Dashboard
  });
  const [showQuestionnairePanel, setShowQuestionnairePanel] = React.useState(() => {
    const saved = localStorage.getItem('showQuestionnairePanel');
    return saved !== null ? saved === 'true' : false;
  });
  const [questionnaireAnswers, setQuestionnaireAnswers] = React.useState<Record<string, string>>({});
  const [aiFilledQuestions, setAiFilledQuestions] = React.useState<Set<string>>(new Set());
  const [lastExtractedSegmentCount, setLastExtractedSegmentCount] = React.useState(0);

  // Customer Register state
  const [currentAccountId, setCurrentAccountId] = React.useState<string | null>(null);
  const [questionnaireMetadata, setQuestionnaireMetadata] = React.useState<Record<string, {
    source: 'manual' | 'ai_auto_fill' | 'live_analysis';
    confidence?: 'high' | 'medium' | 'low';
    sourceQuote?: string;
  }>>({});

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

  // Funktion för att byta till riktigt samtal-läge (Azure)
  // Kräver reload eftersom vi byter mellan olika React hooks
  const switchToRealCallMode = useCallback(() => {
    localStorage.setItem('forceDemoMode', 'false');
    window.location.reload();
  }, []);

  // Välj rätt speech hook
  const speechHookOptions = {
    ...SPEECH_CONFIG,
    enableDiarization: true, // Enable automatic speaker diarization
    onInterimResult: (text: string, speaker?: string) => {
      addInterimTranscript(text);
      if (speaker) {
        console.log(`🎤 Interim [${speaker}]: ${text.substring(0, 50)}...`);
      }
    },
    onFinalResult: (text: string, confidence: number, speaker?: string) => {
      const mappedSpeaker = speaker as 'seller' | 'customer' | undefined;
      console.log(`🎤 Final [${speaker || 'unknown'}]: ${text}`);
      addFinalTranscript(text, confidence, mappedSpeaker);
    },
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
  const handleStart = useCallback(() => {
    // Visa modal för att samla in kundinfo
    setShowStartSessionModal(true);
  }, []);

  // Starta session med kundinfo från modalen
  const handleStartWithCustomer = useCallback(async (customerInfo: { company: string; name?: string; role?: string }) => {
    setShowStartSessionModal(false);
    startSession(customerInfo);
    await startListening();
  }, [startSession, startListening]);

  // Starta Meeting Assistant - called after modal starts the meeting
  const handleMeetingStarted = useCallback(() => {
    setShowStartMeetingAssistantModal(false);
    setShowMeetingAssistant(true);
  }, []);

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

  const handleToggleQuestionnaire = useCallback(() => {
    setShowQuestionnairePanel(prev => {
      const newValue = !prev;
      localStorage.setItem('showQuestionnairePanel', String(newValue));
      return newValue;
    });
  }, []);

  const handleShowCallView = useCallback(() => {
    // Byt till riktigt samtal-läge (Azure)
    switchToRealCallMode();
    // Visa båda panelerna
    setShowTranscriptPanel(true);
    setShowCoachingPanel(true);
    localStorage.setItem('showTranscriptPanel', 'true');
    localStorage.setItem('showCoachingPanel', 'true');
  }, [switchToRealCallMode]);

  // Initialize Gateway WebSocket connection
  useEffect(() => {
    if (user && !isGatewayEnabled) {
      console.log('🔌 Initializing Gateway for user:', user.id);

      // Get auth token from Supabase
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.access_token) {
          initGateway(session.access_token, user.id);
        }
      });
    }

    // Cleanup on unmount
    return () => {
      if (isGatewayEnabled) {
        console.log('🔌 Disconnecting Gateway');
        disconnectGateway();
      }
    };
  }, [user, isGatewayEnabled, initGateway, disconnectGateway]);

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

  // Real-time AI questionnaire extraction
  useEffect(() => {
    console.log('[AI Auto-fill Debug] Segments count:', segments.length, 'Panel visible:', showQuestionnairePanel);

    const extractQuestionnaireAnswers = async () => {
      // Only extract if:
      // 1. Questionnaire panel is visible
      // 2. We have new segments since last extraction
      // 3. We have at least 3 segments (enough context)
      if (!showQuestionnairePanel || segments.length < 3 || segments.length === lastExtractedSegmentCount) {
        console.log('[AI Auto-fill] Skipping extraction:', {
          panelVisible: showQuestionnairePanel,
          segmentsCount: segments.length,
          lastExtracted: lastExtractedSegmentCount
        });
        return;
      }

      console.log('[AI Auto-fill] ✅ Starting extraction for', segments.length, 'segments');

      // Build transcript text from segments
      const transcriptText = segments
        .map(seg => `${seg.speaker === 'customer' ? 'Kund' : 'Säljare'}: ${seg.text}`)
        .join('\n');

      console.log('[AI Auto-fill] Transcript preview:', transcriptText.substring(0, 200) + '...');

      try {
        console.log('[AI Auto-fill] Calling API endpoint...');
        const response = await fetch('/api/extract-questionnaire-answers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transcriptText,
            existingAnswers: questionnaireAnswers
          })
        });

        console.log('[AI Auto-fill] API response status:', response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('[AI Auto-fill] API error:', response.status, errorText);
          return;
        }

        const data = await response.json();
        console.log('[AI Auto-fill] API response data:', data);

        if (data.extractedAnswers && data.extractedAnswers.length > 0) {
          console.log('[AI Auto-fill] ✅ Extracted', data.extractedAnswers.length, 'answers');

          // Update answers with AI-extracted content and metadata
          const newAnswers = { ...questionnaireAnswers };
          const newAiFilled = new Set(aiFilledQuestions);
          const newMetadata = { ...questionnaireMetadata };

          data.extractedAnswers.forEach((extracted: any) => {
            // Only fill if not already answered manually
            if (!questionnaireAnswers[extracted.questionId]?.trim()) {
              console.log('[AI Auto-fill] Filling question:', extracted.questionId, '->', extracted.answer);
              newAnswers[extracted.questionId] = extracted.answer;
              newAiFilled.add(extracted.questionId);

              // Store metadata for auto-save
              newMetadata[extracted.questionId] = {
                source: 'ai_auto_fill',
                confidence: extracted.confidence || 'medium',
                sourceQuote: extracted.sourceQuote
              };
            }
          });

          setQuestionnaireAnswers(newAnswers);
          setAiFilledQuestions(newAiFilled);
          setQuestionnaireMetadata(newMetadata);
        } else {
          console.log('[AI Auto-fill] No answers extracted from this segment');
        }

        setLastExtractedSegmentCount(segments.length);
      } catch (error) {
        console.error('[AI Auto-fill] ❌ Error extracting questionnaire answers:', error);
      }
    };

    // Debounce: only extract every 5 new segments to avoid too many API calls
    if (segments.length > 0 && segments.length % 5 === 0) {
      console.log('[AI Auto-fill] 🚀 Triggering extraction (segment count is multiple of 5)');
      extractQuestionnaireAnswers();
    } else {
      console.log('[AI Auto-fill] Waiting for next trigger point. Current:', segments.length, 'Next trigger at:', Math.ceil(segments.length / 5) * 5);
    }
  }, [segments, showQuestionnairePanel, questionnaireAnswers, lastExtractedSegmentCount, aiFilledQuestions]);

  // ============================================================================
  // CUSTOMER REGISTER: Auto-create account when session starts
  // ============================================================================
  useEffect(() => {
    const createAccountForSession = async () => {
      const session = useSessionStore.getState().session;

      if (!session || !session.customer?.company || !user?.id) {
        return;
      }

      // Only create account once per session
      if (currentAccountId) {
        return;
      }

      console.log('[Customer Register] Creating/finding account for:', session.customer.company);

      const result = await findOrCreateAccount(
        session.customer.company,
        user.id,
        {
          industry: liveAnalysis.industry || undefined,
          companySize: liveAnalysis.companySize || undefined,
          contactName: session.customer.name || undefined,
          contactRole: session.customer.role || undefined
        }
      );

      if (result) {
        setCurrentAccountId(result.accountId);
        console.log(`[Customer Register] ${result.isNew ? 'Created new' : 'Found existing'} account: ${result.accountId}`);

        // Link session to account
        if (session.id) {
          await linkSessionToAccount(session.id, result.accountId);
        }

        // Load previous questionnaire answers for this account
        loadPreviousQuestionnaireAnswers(result.accountId);
      }
    };

    if (status === 'recording') {
      createAccountForSession();
    }
  }, [status, user, liveAnalysis.industry, liveAnalysis.companySize, currentAccountId]);

  // ============================================================================
  // CUSTOMER REGISTER: Load previous questionnaire answers
  // ============================================================================
  const loadPreviousQuestionnaireAnswers = async (accountId: string) => {
    if (!user) return;

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      if (!token) {
        console.error('[Questionnaire] No auth token available');
        return;
      }

      console.log('[Questionnaire] Loading previous answers for account:', accountId);

      const response = await fetch(`/api/load-questionnaire-answers?accountId=${accountId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        console.error('[Questionnaire] Failed to load answers:', response.statusText);
        return;
      }

      const data = await response.json();

      if (data.answers && Object.keys(data.answers).length > 0) {
        console.log(`[Questionnaire] ✅ Loaded ${data.count} previous answers`);

        // Merge with existing answers (don't overwrite manual inputs during current call)
        const mergedAnswers: Record<string, string> = { ...questionnaireAnswers };
        const mergedMetadata: Record<string, {
          source: 'manual' | 'ai_auto_fill' | 'live_analysis';
          confidence?: 'high' | 'medium' | 'low';
          sourceQuote?: string;
        }> = { ...questionnaireMetadata };
        const aiFilledSet = new Set(aiFilledQuestions);

        Object.entries(data.answers).forEach(([questionId, answerData]: [string, any]) => {
          // Only load if not already answered in current session
          if (!mergedAnswers[questionId]?.trim()) {
            mergedAnswers[questionId] = answerData.answer;
            mergedMetadata[questionId] = {
              source: answerData.source,
              confidence: answerData.confidence,
              sourceQuote: answerData.sourceQuote
            };

            if (answerData.source === 'ai_auto_fill') {
              aiFilledSet.add(questionId);
            }
          }
        });

        setQuestionnaireAnswers(mergedAnswers);
        setQuestionnaireMetadata(mergedMetadata);
        setAiFilledQuestions(aiFilledSet);
      }
    } catch (error) {
      console.error('[Questionnaire] Error loading previous answers:', error);
    }
  };

  // ============================================================================
  // CUSTOMER REGISTER: Auto-save questionnaire answers to database
  // ============================================================================
  useEffect(() => {
    const saveQuestionnaireAnswers = async () => {
      if (!currentAccountId || !user) {
        return;
      }

      const answersToSave = Object.keys(questionnaireAnswers).filter(
        key => questionnaireAnswers[key]?.trim()
      );

      if (answersToSave.length === 0) {
        return;
      }

      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;

        if (!token) {
          console.error('[Questionnaire] No auth token available');
          return;
        }

        const session = useSessionStore.getState().session;

        // Transform answers to API format with metadata
        const answersWithMetadata: Record<string, {
          answer: string;
          source: 'manual' | 'ai_auto_fill' | 'live_analysis';
          confidence?: 'high' | 'medium' | 'low';
          sourceQuote?: string;
          questionText: string;
        }> = {};

        // Question texts mapping (from PostCallQuestionnaire)
        const QUESTION_TEXTS: Record<string, string> = {
          current_challenges: 'Vilka är de 3 största utmaningarna kunden har idag?',
          cost_of_problems: 'Vad kostar dessa problem kunden idag? (tid, pengar, resurser)',
          problem_duration: 'Hur länge har problemet funnits?',
          previous_attempts: 'Vad har de provat tidigare för att lösa det?',
          ideal_solution: 'Vad är den ideala lösningen enligt kunden?',
          success_metrics: 'Vilka KPI:er använder de för att mäta framgång?',
          must_have_features: 'Vilka funktioner är absolut nödvändiga?',
          nice_to_have_features: 'Vilka funktioner är önskvärda men inte kritiska?',
          deal_breakers: 'Finns det något som skulle stoppa affären helt?',
          final_decision_maker: 'Vem fattar det slutliga beslutet?',
          approval_stakeholders: 'Vilka andra behöver godkänna?',
          procurement_steps: 'Vilka steg ingår i deras inköpsprocess?',
          budget_status: 'Finns det budget avsatt redan?',
          decision_timeline: 'Vad driver tidslinjen för beslutet?',
          alternatives_evaluated: 'Vilka alternativ utvärderar de?',
          vendor_selection_criteria: 'Vad är viktigast vid val av leverantör?',
          previous_vendor_experience: 'Har de arbetat med liknande leverantörer tidigare?',
          biggest_concerns: 'Vad är deras största farhågor/tveksamheter?',
          integration_requirements: 'Vilka system måste lösningen integreras med?',
          user_count: 'Hur många användare kommer att använda systemet?',
          departments_affected: 'Vilka avdelningar kommer att påverkas?',
          compliance_requirements: 'Finns det specifika compliance- eller säkerhetskrav?',
          rollout_plan: 'Hur planerar de att rulla ut lösningen?',
          implementation_timeline: 'Vilken tidslinje har de för implementering?',
          training_requirements: 'Vilka träningsbehov finns?'
        };

        answersToSave.forEach(questionId => {
          const metadata = questionnaireMetadata[questionId];
          answersWithMetadata[questionId] = {
            answer: questionnaireAnswers[questionId],
            source: metadata?.source || 'manual',
            confidence: metadata?.confidence,
            sourceQuote: metadata?.sourceQuote,
            questionText: QUESTION_TEXTS[questionId] || questionId
          };
        });

        console.log('[Questionnaire] Saving', answersToSave.length, 'answers to database...');

        const response = await fetch('/api/save-questionnaire-answers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            accountId: currentAccountId,
            sessionId: session?.id,
            answers: answersWithMetadata
          })
        });

        if (!response.ok) {
          console.error('[Questionnaire] Failed to save answers:', response.statusText);
          return;
        }

        const result = await response.json();
        console.log(`[Questionnaire] ✅ Saved ${result.savedCount} answers to database`);

      } catch (error) {
        console.error('[Questionnaire] Error saving answers:', error);
      }
    };

    // Debounce: save 3 seconds after last change
    const timeoutId = setTimeout(() => {
      saveQuestionnaireAnswers();
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, [questionnaireAnswers, questionnaireMetadata, currentAccountId, user]);

  // Handler for manual answer changes (tracks metadata)
  const handleQuestionnaireAnswersChange = useCallback((newAnswers: Record<string, string>) => {
    // Detect which answers changed
    const updatedMetadata = { ...questionnaireMetadata };

    Object.keys(newAnswers).forEach(questionId => {
      const oldAnswer = questionnaireAnswers[questionId];
      const newAnswer = newAnswers[questionId];

      // If answer changed and it's not already marked as AI-filled
      if (oldAnswer !== newAnswer && newAnswer?.trim()) {
        // If this was an AI-filled answer and user changed it, mark as manual
        if (aiFilledQuestions.has(questionId)) {
          updatedMetadata[questionId] = { source: 'manual' };
          // Remove from AI-filled set
          const newAiFilled = new Set(aiFilledQuestions);
          newAiFilled.delete(questionId);
          setAiFilledQuestions(newAiFilled);
        } else if (!updatedMetadata[questionId]) {
          // New manual entry
          updatedMetadata[questionId] = { source: 'manual' };
        }
      }
    });

    setQuestionnaireAnswers(newAnswers);
    setQuestionnaireMetadata(updatedMetadata);
  }, [questionnaireAnswers, questionnaireMetadata, aiFilledQuestions]);

  const isActive = status === 'recording' || status === 'paused';

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                // Hide panels to show Dashboard
                setShowTranscriptPanel(false);
                setShowCoachingPanel(false);
                localStorage.setItem('showTranscriptPanel', 'false');
                localStorage.setItem('showCoachingPanel', 'false');
                // Clear demo mode
                localStorage.setItem('forceDemoMode', 'false');
              }}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
              title="Tillbaka till Dashboard"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-sm">
                SC
              </div>
              <h1 className="text-xl font-semibold">Sales Coach AI</h1>
            </button>

            {useMock && (showTranscriptPanel || showCoachingPanel) && (
              <span className="px-3 py-1 bg-teal-600/20 text-teal-400 text-xs rounded-full">
                {getAllDemoScripts().find(s => s.id === selectedScript)?.name || 'Demo'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* Gateway Connection Status */}
            {isGatewayEnabled && (
              <div className="flex items-center gap-2">
                <span className={`relative flex h-2 w-2 ${isGatewayConnected ? '' : 'opacity-50'}`}>
                  {isGatewayConnected && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  )}
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${isGatewayConnected ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                </span>
                <span className="text-xs text-gray-500" title={isGatewayConnected ? 'Gateway connected' : 'Gateway connecting...'}>
                  {isGatewayConnected ? 'Live' : 'Connecting...'}
                </span>
              </div>
            )}

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

            {/* Help button */}
            <button
              onClick={() => setShowHelp(true)}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              title="Hjälp"
            >
              <HelpCircle className="w-5 h-5 text-gray-400" />
            </button>

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
                showQuestionnairePanel={showQuestionnairePanel}
                onToggleTranscript={handleToggleTranscript}
                onToggleCoaching={handleToggleCoaching}
                onToggleQuestionnaire={handleToggleQuestionnaire}
                onShowCallView={handleShowCallView}
                onOpenHistory={() => setShowHistory(true)}
                onOpenAccountsList={() => setShowAccountsList(true)}
                onOpenAdmin={() => setShowAdmin(true)}
                onOpenCoachingAdmin={() => setShowCoachingAdmin(true)}
                onOpenImport={() => setShowImportTranscript(true)}
                onOpenMeetingAssistant={() => setShowStartMeetingAssistantModal(true)}
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
                          localStorage.setItem('forceDemoMode', 'true');
                          // Show panels for demo
                          localStorage.setItem('showTranscriptPanel', 'true');
                          localStorage.setItem('showCoachingPanel', 'true');
                          setShowDemoMenu(false);
                          // Reload för att aktivera demo-läge med rätt hooks
                          window.location.reload();
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
                        setShowDemoMode(true);
                        setShowDemoMenu(false);
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors flex items-center gap-3"
                    >
                      <Play className="w-4 h-4 text-teal-400" />
                      <div>
                        <div className="text-sm font-medium text-white">Starta interaktiv demo</div>
                        <div className="text-xs text-gray-400">Guidning steg-för-steg för produktdemos</div>
                      </div>
                    </button>
                    <div className="border-t border-gray-700" />
                    <button
                      onClick={() => {
                        setShowDemoAdmin(true);
                        setShowDemoMenu(false);
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors flex items-center gap-3"
                    >
                      <Settings className="w-4 h-4 text-teal-400" />
                      <div>
                        <div className="text-sm font-medium text-white">Hantera demo-scripts</div>
                        <div className="text-xs text-gray-400">Skapa och redigera interaktiva demos</div>
                      </div>
                    </button>
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
                      className="w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors flex items-center gap-3"
                    >
                      <Settings className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="text-sm font-medium text-white">Hantera scenarier</div>
                        <div className="text-xs text-gray-400">Skapa och redigera</div>
                      </div>
                    </button>
                    <div className="border-t border-gray-700" />
                    <button
                      onClick={() => {
                        setShowScenarioGenerator(true);
                        setShowTrainingMenu(false);
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors flex items-center gap-3"
                    >
                      <Wand2 className="w-4 h-4 text-purple-400" />
                      <div>
                        <div className="text-sm font-medium text-white">Generera scenarier</div>
                        <div className="text-xs text-gray-400">AI skapar från kunskapsbasen</div>
                      </div>
                    </button>
                    <div className="border-t border-gray-700" />
                    <button
                      onClick={() => {
                        setShowKnowledgeBase(true);
                        setShowTrainingMenu(false);
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-gray-700 rounded-b-lg transition-colors flex items-center gap-3"
                    >
                      <Database className="w-4 h-4 text-blue-400" />
                      <div>
                        <div className="text-sm font-medium text-white">Kunskapsbas</div>
                        <div className="text-xs text-gray-400">Ladda upp material för AI</div>
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
                  <div className="absolute right-0 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-20">
                    <div className="p-2">
                      <div className="px-3 py-2 text-sm text-gray-400 border-b border-gray-700">
                        {user?.email}
                      </div>
                      <button
                        onClick={() => {
                          setShowRAGTester(true);
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 mt-1 text-sm text-white hover:bg-gray-700 rounded transition-colors"
                      >
                        <Beaker className="w-4 h-4" />
                        Testa RAG-funktion
                      </button>
                      <button
                        onClick={() => {
                          setShowUserProductsAdmin(true);
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white hover:bg-gray-700 rounded transition-colors"
                      >
                        <Database className="w-4 h-4" />
                        Hantera produktåtkomst
                      </button>
                      <button
                        onClick={async () => {
                          await signOut();
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-gray-700 rounded transition-colors"
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

                  {/* Speaker diarization aktiv - visas automatiskt via Azure */}
                  {HAS_AZURE_KEY && (
                    <div className="ml-4 pl-4 border-l border-gray-700">
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span>Speaker diarization aktiv</span>
                      </div>
                    </div>
                  )}
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

        {/* Multi-panel layout - conditional rendering based on panel toggles */}
        <div className={`grid gap-6 ${
          [showTranscriptPanel, showCoachingPanel, showQuestionnairePanel].filter(Boolean).length === 3
            ? 'grid-cols-1 xl:grid-cols-3 lg:grid-cols-2'
            : [showTranscriptPanel, showCoachingPanel, showQuestionnairePanel].filter(Boolean).length === 2
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

          {showQuestionnairePanel && (
            <div className="bg-gray-800 rounded-xl overflow-hidden flex flex-col h-[600px]">
              <div className="px-4 py-3 border-b border-gray-700 flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-teal-400" />
                <h2 className="font-semibold">Kundfrågor</h2>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <PostCallQuestionnaire
                  onAnswersChange={handleQuestionnaireAnswersChange}
                  initialAnswers={questionnaireAnswers}
                  aiFilledQuestions={aiFilledQuestions}
                />
              </div>
            </div>
          )}
        </div>

        {/* Dashboard - shown when all panels are hidden */}
        {!showTranscriptPanel && !showCoachingPanel && !showQuestionnairePanel && (
          <Dashboard
            onStartTraining={() => setShowTraining(true)}
            onSelectDemoScript={(scriptId) => {
              setSelectedScript(scriptId);
              localStorage.setItem('selectedDemoScript', scriptId);
              localStorage.setItem('forceDemoMode', 'true');
              // Show panels for demo
              setShowTranscriptPanel(true);
              setShowCoachingPanel(true);
              localStorage.setItem('showTranscriptPanel', 'true');
              localStorage.setItem('showCoachingPanel', 'true');
              // Reload to activate demo mode with correct hooks
              window.location.reload();
            }}
            onOpenHistory={() => setShowHistory(true)}
          />
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
      {showUserProductsAdmin && <UserProductsAdmin onClose={() => setShowUserProductsAdmin(false)} />}
      {showDemoAdmin && <DemoAdminPanel onClose={() => setShowDemoAdmin(false)} />}
      {showDemoMode && <DemoMode onClose={() => setShowDemoMode(false)} />}
      {showRAGTester && <RAGTester onClose={() => setShowRAGTester(false)} />}
      {showScenarioGenerator && <ScenarioGenerator onClose={() => setShowScenarioGenerator(false)} />}
      {showHistory && <HistoryPanel onClose={() => setShowHistory(false)} />}
      {showAccountsList && (
        <div className="fixed inset-0 bg-gray-900 z-50 overflow-y-auto">
          <div className="min-h-screen p-6">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-white">Kundregister</h1>
                <button
                  onClick={() => setShowAccountsList(false)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Stäng
                </button>
              </div>
              <AccountsList />
            </div>
          </div>
        </div>
      )}
      {showTraining && <TrainingMode onClose={() => setShowTraining(false)} />}
      {showHelp && <HelpPanel onClose={() => setShowHelp(false)} />}
      {showKnowledgeBase && <KnowledgeBaseManager onClose={() => setShowKnowledgeBase(false)} />}
      {showImportTranscript && (
        <ImportTranscriptModal
          onClose={() => setShowImportTranscript(false)}
          onImportSuccess={() => {
            setShowImportTranscript(false);
            setShowHistory(true);
          }}
        />
      )}
      {showStartSessionModal && (
        <StartSessionModal
          onStart={handleStartWithCustomer}
          onClose={() => setShowStartSessionModal(false)}
        />
      )}

      {/* Meeting Assistant Modal */}
      {showStartMeetingAssistantModal && (
        <StartMeetingAssistantModal
          onMeetingStarted={handleMeetingStarted}
          onClose={() => setShowStartMeetingAssistantModal(false)}
        />
      )}

      {/* Meeting Assistant Interface */}
      {showMeetingAssistant && meetingAssistantActive && (
        <MeetingAssistant
          onClose={() => setShowMeetingAssistant(false)}
        />
      )}
    </div>
  );
};
