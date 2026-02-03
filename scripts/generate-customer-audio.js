/**
 * Generate Customer Audio for Speaker Diarization Testing
 *
 * This script creates audio files with synthetic customer voice that you can
 * play through speakers while testing the speaker diarization feature.
 *
 * Usage:
 *   node scripts/generate-customer-audio.js
 *
 * Output:
 *   customer-simulation.wav - Audio file to play during testing
 */

import * as sdk from 'microsoft-cognitiveservices-speech-sdk';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Customer dialog with pauses between lines
const customerDialog = [
  { text: "Hej! Tack för att du ringer.", pauseAfter: 3000 },
  { text: "Jo, vi är intresserade av Microsoft Teams för vårt företag.", pauseAfter: 4000 },
  { text: "Men priset verkar ganska högt för oss.", pauseAfter: 5000 },
  { text: "Vi har redan avtal med Atea, men vi funderar på att byta.", pauseAfter: 4000 },
  { text: "Vad kan Teams erbjuda som är bättre än vårt nuvarande system?", pauseAfter: 5000 },
  { text: "Okej, det låter intressant. Hur mycket kostar det egentligen?", pauseAfter: 4000 },
  { text: "Har ni någon demo vi kan titta på först?", pauseAfter: 5000 },
  { text: "Ja, det här verkar kunna lösa våra problem. Jag är intresserad!", pauseAfter: 3000 },
];

async function generateCustomerAudio() {
  const subscriptionKey = process.env.VITE_AZURE_SPEECH_KEY;
  const region = process.env.VITE_AZURE_SPEECH_REGION || 'swedencentral';

  if (!subscriptionKey || subscriptionKey === 'demo-mode') {
    console.error('❌ Azure Speech Key saknas!');
    console.error('Lägg till VITE_AZURE_SPEECH_KEY i .env filen');
    process.exit(1);
  }

  const speechConfig = sdk.SpeechConfig.fromSubscription(subscriptionKey, region);

  // Use Swedish female voice for realistic customer simulation
  // Options: sv-SE-SofieNeural (female), sv-SE-MattiasNeural (male)
  speechConfig.speechSynthesisVoiceName = 'sv-SE-SofieNeural';

  // Set audio output format to MP3
  speechConfig.speechSynthesisOutputFormat = sdk.SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3;

  // Output to file
  const outputFile = path.join(__dirname, '..', 'customer-simulation.mp3');
  const audioConfig = sdk.AudioConfig.fromAudioFileOutput(outputFile);

  const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);

  console.log('🎤 Genererar kundrepliker...\n');

  // Build SSML with pauses between lines
  const ssml = `
    <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="sv-SE">
      <voice name="sv-SE-SofieNeural">
        ${customerDialog.map(line => `
          <prosody rate="0.95" pitch="+2%">
            ${line.text}
          </prosody>
          <break time="${line.pauseAfter}ms"/>
        `).join('\n')}
      </voice>
    </speak>
  `;

  return new Promise((resolve, reject) => {
    synthesizer.speakSsmlAsync(
      ssml,
      result => {
        if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
          console.log('✅ Ljudfil skapad:', outputFile);
          console.log('\n📝 Kundens repliker:');
          customerDialog.forEach((line, i) => {
            console.log(`   ${i + 1}. "${line.text}" (${line.pauseAfter/1000}s paus)`);
          });

          console.log('\n🧪 Test-instruktioner:');
          console.log('   1. Öppna Sales Coach appen i browsern');
          console.log('   2. Starta ett samtal');
          console.log('   3. Spela upp customer-simulation.mp3 i högtalare');
          console.log('   4. Prata till "kunden" när det är din tur (under pauserna)');
          console.log('   5. Kontrollera att speaker diarization fungerar i konsolen\n');

          synthesizer.close();
          resolve();
        } else {
          const error = `Speech synthesis failed: ${result.errorDetails}`;
          console.error('❌', error);
          synthesizer.close();
          reject(new Error(error));
        }
      },
      error => {
        console.error('❌ Error:', error);
        synthesizer.close();
        reject(error);
      }
    );
  });
}

// Run
generateCustomerAudio()
  .then(() => {
    console.log('✨ Klart!');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Failed:', err.message);
    process.exit(1);
  });
