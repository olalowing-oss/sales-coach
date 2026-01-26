import { useCallback, useRef, useState, useEffect } from 'react';
import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk';

interface UseSpeechRecognitionOptions {
  subscriptionKey: string;
  region: string;
  language?: string;
  onInterimResult?: (text: string) => void;
  onFinalResult?: (text: string, confidence: number) => void;
  onError?: (error: string) => void;
  onStatusChange?: (status: 'idle' | 'listening' | 'error') => void;
}

interface UseSpeechRecognitionReturn {
  isListening: boolean;
  status: 'idle' | 'listening' | 'error';
  error: string | null;
  startListening: () => Promise<void>;
  stopListening: () => void;
  interimTranscript: string;
}

/**
 * Custom hook för Azure Speech Services real-time recognition
 * 
 * Användning:
 * ```tsx
 * const { isListening, startListening, stopListening, interimTranscript } = useSpeechRecognition({
 *   subscriptionKey: 'your-key',
 *   region: 'swedencentral',
 *   onFinalResult: (text, confidence) => console.log(text),
 * });
 * ```
 */
export const useSpeechRecognition = ({
  subscriptionKey,
  region,
  language = 'sv-SE',
  onInterimResult,
  onFinalResult,
  onError,
  onStatusChange
}: UseSpeechRecognitionOptions): UseSpeechRecognitionReturn => {
  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState<'idle' | 'listening' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [interimTranscript, setInterimTranscript] = useState('');
  
  const recognizerRef = useRef<SpeechSDK.SpeechRecognizer | null>(null);
  const audioConfigRef = useRef<SpeechSDK.AudioConfig | null>(null);

  // Cleanup vid unmount
  useEffect(() => {
    return () => {
      if (recognizerRef.current) {
        recognizerRef.current.close();
      }
    };
  }, []);

  const updateStatus = useCallback((newStatus: 'idle' | 'listening' | 'error') => {
    setStatus(newStatus);
    onStatusChange?.(newStatus);
  }, [onStatusChange]);

  const startListening = useCallback(async () => {
    // Validera konfiguration
    if (!subscriptionKey || subscriptionKey === 'your-key-here') {
      const errorMsg = 'Azure Speech subscription key saknas. Konfigurera VITE_AZURE_SPEECH_KEY i .env';
      setError(errorMsg);
      updateStatus('error');
      onError?.(errorMsg);
      return;
    }

    try {
      // Skapa speech config
      const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(subscriptionKey, region);
      speechConfig.speechRecognitionLanguage = language;
      speechConfig.enableDictation();
      
      // Förbättra transkriberingskvalitet
      speechConfig.setProperty(
        SpeechSDK.PropertyId.SpeechServiceResponse_PostProcessingOption,
        'TrueText'
      );

      // Skapa audio config från mikrofon
      audioConfigRef.current = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
      
      // Skapa recognizer
      recognizerRef.current = new SpeechSDK.SpeechRecognizer(
        speechConfig, 
        audioConfigRef.current
      );

      // Event handlers
      recognizerRef.current.recognizing = (_, event) => {
        if (event.result.reason === SpeechSDK.ResultReason.RecognizingSpeech) {
          const text = event.result.text;
          setInterimTranscript(text);
          onInterimResult?.(text);
        }
      };

      recognizerRef.current.recognized = (_, event) => {
        if (event.result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
          const text = event.result.text;
          const confidence = calculateConfidence(event.result);
          
          setInterimTranscript('');
          onFinalResult?.(text, confidence);
        } else if (event.result.reason === SpeechSDK.ResultReason.NoMatch) {
          // Tystnad eller ohörbart - ignorera
        }
      };

      recognizerRef.current.canceled = (_, event) => {
        if (event.reason === SpeechSDK.CancellationReason.Error) {
          const errorMsg = `Speech recognition error: ${event.errorDetails}`;
          setError(errorMsg);
          updateStatus('error');
          onError?.(errorMsg);
        }
        setIsListening(false);
      };

      recognizerRef.current.sessionStopped = () => {
        setIsListening(false);
        updateStatus('idle');
      };

      // Starta kontinuerlig igenkänning
      await new Promise<void>((resolve, reject) => {
        recognizerRef.current!.startContinuousRecognitionAsync(
          () => {
            setIsListening(true);
            setError(null);
            updateStatus('listening');
            resolve();
          },
          (err) => {
            const errorMsg = `Failed to start recognition: ${err}`;
            setError(errorMsg);
            updateStatus('error');
            onError?.(errorMsg);
            reject(new Error(errorMsg));
          }
        );
      });

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMsg);
      updateStatus('error');
      onError?.(errorMsg);
    }
  }, [subscriptionKey, region, language, onInterimResult, onFinalResult, onError, updateStatus]);

  const stopListening = useCallback(() => {
    if (recognizerRef.current) {
      recognizerRef.current.stopContinuousRecognitionAsync(
        () => {
          setIsListening(false);
          setInterimTranscript('');
          updateStatus('idle');
        },
        (err) => {
          console.error('Error stopping recognition:', err);
          setIsListening(false);
          updateStatus('idle');
        }
      );
    }
  }, [updateStatus]);

  return {
    isListening,
    status,
    error,
    startListening,
    stopListening,
    interimTranscript
  };
};

/**
 * Beräknar konfidens från recognition result
 */
const calculateConfidence = (result: SpeechSDK.SpeechRecognitionResult): number => {
  // Azure Speech SDK ger inte alltid confidence direkt
  // Vi kan använda best av NBest om tillgängligt
  try {
    const json = result.properties.getProperty(
      SpeechSDK.PropertyId.SpeechServiceResponse_JsonResult
    );
    if (json) {
      const parsed = JSON.parse(json);
      if (parsed.NBest && parsed.NBest.length > 0) {
        return parsed.NBest[0].Confidence || 0.9;
      }
    }
  } catch {
    // Ignorera parse-fel
  }
  return 0.9; // Default confidence
};

/**
 * Hook för simulerad speech recognition (för utveckling utan Azure)
 */
export const useMockSpeechRecognition = ({
  onInterimResult,
  onFinalResult,
  onStatusChange
}: Omit<UseSpeechRecognitionOptions, 'subscriptionKey' | 'region'>): UseSpeechRecognitionReturn => {
  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState<'idle' | 'listening' | 'error'>('idle');
  const [interimTranscript, setInterimTranscript] = useState('');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Simulerade fraser för demo
  const mockPhrases = [
    "Ja, vi använder Teams idag men det är lite rörigt",
    "Vi har redan avtal med Atea faktiskt",
    "Det låter intressant, men det är för dyrt",
    "Kan du berätta mer om Copilot?",
    "Vi har problem med att hitta dokument",
    "Ring tillbaka senare, har inte tid nu",
    "Vad kostar det?",
    "Vi har ungefär 500 användare",
  ];

  const startListening = useCallback(async () => {
    setIsListening(true);
    setStatus('listening');
    onStatusChange?.('listening');
    
    let phraseIndex = 0;
    
    // Simulera transkribering var 5:e sekund
    intervalRef.current = setInterval(() => {
      const phrase = mockPhrases[phraseIndex % mockPhrases.length];
      
      // Simulera interim results
      const words = phrase.split(' ');
      let interim = '';
      
      words.forEach((word, i) => {
        setTimeout(() => {
          interim += (i > 0 ? ' ' : '') + word;
          setInterimTranscript(interim);
          onInterimResult?.(interim);
          
          // När alla ord är "transkriberade", trigga final result
          if (i === words.length - 1) {
            setTimeout(() => {
              setInterimTranscript('');
              onFinalResult?.(phrase, 0.95);
            }, 200);
          }
        }, i * 150);
      });
      
      phraseIndex++;
    }, 5000);
    
  }, [onInterimResult, onFinalResult, onStatusChange]);

  const stopListening = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setIsListening(false);
    setInterimTranscript('');
    setStatus('idle');
    onStatusChange?.('idle');
  }, [onStatusChange]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    isListening,
    status,
    error: null,
    startListening,
    stopListening,
    interimTranscript
  };
};
