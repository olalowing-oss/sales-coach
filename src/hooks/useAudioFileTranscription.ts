import { useCallback, useState } from 'react';
import * as sdk from 'microsoft-cognitiveservices-speech-sdk';

interface UseAudioFileTranscriptionOptions {
  subscriptionKey: string;
  region: string;
  language?: string;
  onInterimResult?: (text: string, confidence: number) => void;
  onFinalResult?: (text: string, confidence: number) => void;
  onError?: (error: string) => void;
  onComplete?: () => void;
}

export const useAudioFileTranscription = ({
  subscriptionKey,
  region,
  language = 'sv-SE',
  onInterimResult,
  onFinalResult,
  onError,
  onComplete
}: UseAudioFileTranscriptionOptions) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const transcribeFile = useCallback(async (file: File) => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      // Skapa Azure Speech config
      const speechConfig = sdk.SpeechConfig.fromSubscription(subscriptionKey, region);
      speechConfig.speechRecognitionLanguage = language;

      // Konvertera File till ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();

      // Skapa audio config från filen
      const audioFormat = sdk.AudioStreamFormat.getWaveFormatPCM(16000, 16, 1);
      const pushStream = sdk.AudioInputStream.createPushStream(audioFormat);

      // Push audio data
      pushStream.write(arrayBuffer);
      pushStream.close();

      const audioConfig = sdk.AudioConfig.fromStreamInput(pushStream);

      // Skapa recognizer
      const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

      let processedChunks = 0;
      const totalEstimatedChunks = Math.ceil(arrayBuffer.byteLength / (16000 * 2 * 3)); // ~3 sekunder per chunk

      // Recognizing event - interim results
      recognizer.recognizing = (_s, e) => {
        if (e.result.reason === sdk.ResultReason.RecognizingSpeech && onInterimResult) {
          const confidence = e.result.properties?.getProperty(sdk.PropertyId.SpeechServiceResponse_JsonResult)
            ? 0.8 // Interim results don't have confidence, use default
            : 0.8;
          onInterimResult(e.result.text, confidence);
        }
      };

      // Recognized event - final results
      recognizer.recognized = (_s, e) => {
        processedChunks++;
        setProgress(Math.min(95, (processedChunks / totalEstimatedChunks) * 100));

        if (e.result.reason === sdk.ResultReason.RecognizedSpeech && onFinalResult) {
          // Azure Speech SDK provides confidence in the result
          const confidence = 0.95; // Default high confidence for file-based transcription
          onFinalResult(e.result.text, confidence);
        } else if (e.result.reason === sdk.ResultReason.NoMatch && onError) {
          console.warn('No speech could be recognized');
        }
      };

      // Canceled event - errors
      recognizer.canceled = (_s, e) => {
        console.error(`Recognition canceled: ${e.reason}`);

        if (e.reason === sdk.CancellationReason.Error && onError) {
          onError(`Error: ${e.errorDetails}`);
        }

        recognizer.stopContinuousRecognitionAsync();
        setIsProcessing(false);
      };

      // Session stopped event
      recognizer.sessionStopped = (_s, _e) => {
        console.log('Session stopped');
        recognizer.stopContinuousRecognitionAsync();
        setProgress(100);
        setIsProcessing(false);

        if (onComplete) {
          onComplete();
        }
      };

      // Start continuous recognition
      recognizer.startContinuousRecognitionAsync(
        () => {
          console.log('Recognition started for file:', file.name);
        },
        (err) => {
          console.error('Error starting recognition:', err);
          if (onError) {
            onError(`Failed to start recognition: ${err}`);
          }
          setIsProcessing(false);
        }
      );

    } catch (error) {
      console.error('Error transcribing file:', error);
      if (onError) {
        onError(`Failed to process file: ${error}`);
      }
      setIsProcessing(false);
    }
  }, [subscriptionKey, region, language, onInterimResult, onFinalResult, onError, onComplete]);

  return {
    transcribeFile,
    isProcessing,
    progress
  };
};
