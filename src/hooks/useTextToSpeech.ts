import { useState, useRef, useCallback } from 'react';
import * as sdk from 'microsoft-cognitiveservices-speech-sdk';

/**
 * Azure Text-to-Speech Hook
 * Converts AI customer's text responses to natural Swedish speech
 */

interface TextToSpeechOptions {
  voice?: string; // Default: sv-SE-SofieNeural
  rate?: string; // Default: 1.0 (normal speed)
  pitch?: string; // Default: default
}

export function useTextToSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const synthesizerRef = useRef<sdk.SpeechSynthesizer | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const speak = useCallback(async (
    text: string,
    options: TextToSpeechOptions = {}
  ): Promise<void> => {
    const speechKey = import.meta.env.VITE_AZURE_SPEECH_KEY;
    const speechRegion = import.meta.env.VITE_AZURE_SPEECH_REGION || 'swedencentral';

    if (!speechKey) {
      setError('Azure Speech key not configured');
      console.error('Azure Speech TTS: Missing API key');
      return;
    }

    try {
      setIsSpeaking(true);
      setError(null);

      // Configure speech
      const speechConfig = sdk.SpeechConfig.fromSubscription(speechKey, speechRegion);

      // Use Swedish Neural Voice (more natural)
      const voice = options.voice || 'sv-SE-SofieNeural'; // Female voice, can also use sv-SE-MattiasNeural for male
      const rate = options.rate || '1.0';
      const pitch = options.pitch || 'default';

      // Build SSML for natural speech
      const ssml = `
        <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="sv-SE">
          <voice name="${voice}">
            <prosody rate="${rate}" pitch="${pitch}">
              ${text}
            </prosody>
          </voice>
        </speak>
      `;

      // Use audio output
      const audioConfig = sdk.AudioConfig.fromDefaultSpeakerOutput();

      // Create synthesizer
      const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);
      synthesizerRef.current = synthesizer;

      // Synthesize speech
      return new Promise((resolve, reject) => {
        synthesizer.speakSsmlAsync(
          ssml,
          (result) => {
            if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
              console.log('✅ TTS: Speech synthesis succeeded');
              setIsSpeaking(false);
              synthesizer.close();
              resolve();
            } else {
              const error = `TTS failed: ${result.errorDetails}`;
              console.error('❌', error);
              setError(error);
              setIsSpeaking(false);
              synthesizer.close();
              reject(new Error(error));
            }
          },
          (error) => {
            console.error('❌ TTS error:', error);
            setError(error);
            setIsSpeaking(false);
            synthesizer.close();
            reject(error);
          }
        );
      });

    } catch (err: any) {
      console.error('❌ TTS error:', err);
      setError(err.message || 'Text-to-speech failed');
      setIsSpeaking(false);
    }
  }, []);

  const stop = useCallback(() => {
    if (synthesizerRef.current) {
      synthesizerRef.current.close();
      synthesizerRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsSpeaking(false);
  }, []);

  return {
    speak,
    stop,
    isSpeaking,
    error
  };
}

/**
 * Get available Swedish voices
 */
export const SWEDISH_VOICES = {
  SOFIE: 'sv-SE-SofieNeural', // Female, friendly
  MATTIAS: 'sv-SE-MattiasNeural', // Male, professional
  HILLEVI: 'sv-SE-HilleviNeural' // Female, clear
} as const;

/**
 * Speech rate presets
 */
export const SPEECH_RATES = {
  SLOW: '0.8',
  NORMAL: '1.0',
  FAST: '1.2'
} as const;
