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

export function useTextToSpeech(customVoiceName?: string) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const synthesizerRef = useRef<sdk.SpeechSynthesizer | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cancelledRef = useRef(false);

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
      cancelledRef.current = false; // Reset cancellation flag

      // Configure speech
      const speechConfig = sdk.SpeechConfig.fromSubscription(speechKey, speechRegion);

      // Use Swedish Neural Voice (more natural)
      // Priority: options.voice > customVoiceName > default Sofie
      const voice = options.voice || customVoiceName || 'sv-SE-SofieNeural';
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

      // Create a dummy pull stream to prevent Azure SDK from playing audio to speakers
      // We'll get the audio data from the result and play it ourselves with HTML Audio
      const pullStream = sdk.AudioOutputStream.createPullStream();
      const audioConfig = sdk.AudioConfig.fromStreamOutput(pullStream);
      const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);
      synthesizerRef.current = synthesizer;

      // Synthesize speech
      return new Promise((resolve, reject) => {
        synthesizer.speakSsmlAsync(
          ssml,
          (result) => {
            // Check if speech was cancelled during synthesis
            if (cancelledRef.current) {
              console.log('ℹ️ Speech was cancelled, ignoring completion');
              synthesizer.close();
              synthesizerRef.current = null;
              setIsSpeaking(false);
              resolve(); // Resolve instead of reject to avoid errors
              return;
            }

            if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
              console.log('✅ TTS: Speech synthesis succeeded');

              // Get audio data and play it with HTML Audio element
              const audioData = result.audioData;
              const blob = new Blob([audioData], { type: 'audio/wav' });
              const url = URL.createObjectURL(blob);

              const audio = new Audio(url);
              audioRef.current = audio;

              audio.onended = () => {
                console.log('🔊 Audio playback finished');
                URL.revokeObjectURL(url);
                audioRef.current = null;
                setIsSpeaking(false);
                resolve();
              };

              audio.onerror = (err) => {
                console.error('❌ Audio playback error:', err);
                URL.revokeObjectURL(url);
                audioRef.current = null;
                setIsSpeaking(false);
                setError('Audio playback failed');
                reject(new Error('Audio playback failed'));
              };

              // Play the audio
              audio.play().catch((err) => {
                console.error('❌ Audio play error:', err);
                URL.revokeObjectURL(url);
                audioRef.current = null;
                setIsSpeaking(false);
                setError('Audio playback failed');
                reject(err);
              });

              synthesizer.close();
              synthesizerRef.current = null;
            } else {
              const error = `TTS failed: ${result.errorDetails}`;
              console.error('❌', error);
              setError(error);
              setIsSpeaking(false);
              synthesizer.close();
              synthesizerRef.current = null;
              reject(new Error(error));
            }
          },
          (error) => {
            // Check if this error is due to cancellation
            if (cancelledRef.current) {
              console.log('ℹ️ Error due to cancellation, ignoring');
              setIsSpeaking(false);
              resolve(); // Resolve instead of reject
              return;
            }

            console.error('❌ TTS error:', error);
            setError(error);
            setIsSpeaking(false);
            synthesizer.close();
            synthesizerRef.current = null;
            reject(error);
          }
        );
      });

    } catch (err: any) {
      console.error('❌ TTS error:', err);
      setError(err.message || 'Text-to-speech failed');
      setIsSpeaking(false);
    }
  }, [customVoiceName]);

  const stop = useCallback(() => {
    console.log('🛑 Stopping TTS immediately...');

    // Set cancellation flag to abort any ongoing synthesis
    cancelledRef.current = true;
    setIsSpeaking(false);

    // Stop and cleanup audio playback immediately
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        // Revoke object URL if it exists
        if (audioRef.current.src) {
          URL.revokeObjectURL(audioRef.current.src);
        }
        audioRef.current = null;
        console.log('✅ Audio stopped immediately');
      }
    } catch (err) {
      console.log('ℹ️ Audio stop error (safe to ignore):', err);
    }

    // Cleanup synthesizer
    try {
      if (synthesizerRef.current) {
        try {
          synthesizerRef.current.close();
          console.log('✅ Synthesizer closed');
        } catch (closeError) {
          console.log('ℹ️ Synthesizer close error (safe to ignore):', closeError);
        }
        synthesizerRef.current = null;
      }
    } catch (err) {
      console.log('ℹ️ General stop error (safe to ignore):', err);
    }
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
