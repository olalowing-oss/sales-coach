import * as sdk from 'microsoft-cognitiveservices-speech-sdk';
import * as fs from 'fs';

// Read .env file manually
const envContent = fs.readFileSync('.env', 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^VITE_(\w+)=(.+)$/);
  if (match) {
    envVars[match[1]] = match[2];
  }
});

const SPEECH_KEY = envVars.AZURE_SPEECH_KEY;
const SPEECH_REGION = envVars.AZURE_SPEECH_REGION;

// Svenskt säljsamtal mellan säljare och kund
const conversation = `
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="sv-SE">
  <voice name="sv-SE-MattiasNeural">
    Hej! Det är Mattias från B3 Digital. Jag ringde för att följa upp vårt möte förra veckan om er digitala transformation.
    <break time="800ms"/>
  </voice>
  <voice name="sv-SE-SofieNeural">
    Ja hej! Tack för att du hör av dig. Vi har faktiskt diskuterat det internt efter mötet.
    <break time="600ms"/>
  </voice>
  <voice name="sv-SE-MattiasNeural">
    Toppen! Vad är era tankar? Ni nämnde att ni hade utmaningar med era nuvarande system.
    <break time="700ms"/>
  </voice>
  <voice name="sv-SE-SofieNeural">
    Ja precis. Vi har problem med integrationer mellan våra system, och det tar mycket tid från IT-avdelningen. Men priset ni nämnde känns lite högt för vårt budget.
    <break time="600ms"/>
  </voice>
  <voice name="sv-SE-MattiasNeural">
    Jag förstår att budget är viktigt. Men låt mig ställa en fråga - hur mycket kostar det er idag när IT-teamet lägger timmar varje vecka på att hantera dessa problem?
    <break time="800ms"/>
  </voice>
  <voice name="sv-SE-SofieNeural">
    Det är en bra poäng. Vi har beräknat att det tar ungefär tjugo timmar i veckan totalt. Det är mycket.
    <break time="600ms"/>
  </voice>
  <voice name="sv-SE-MattiasNeural">
    Exakt. Med vår lösning kan ni frigöra den tiden och låta teamet fokusera på strategiska projekt istället. Vi har flera kunder i liknande situation som sett avkastning inom sex månader.
  </voice>
</speak>
`;

async function generateTestAudio() {
  console.log('🎤 Genererar test-ljudfil med Azure Speech Service...');

  const speechConfig = sdk.SpeechConfig.fromSubscription(SPEECH_KEY, SPEECH_REGION);
  const audioConfig = sdk.AudioConfig.fromAudioFileOutput('test-conversation.wav');

  const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);

  return new Promise((resolve, reject) => {
    synthesizer.speakSsmlAsync(
      conversation,
      result => {
        if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
          console.log('✅ Ljudfil skapad: test-conversation.wav');
          console.log(`📊 Storlek: ${result.audioData.byteLength} bytes`);
          console.log('\n🎧 Så här testar du:');
          console.log('1. Öppna appen i webbläsaren');
          console.log('2. Starta ett nytt samtal');
          console.log('3. Spela upp test-conversation.wav i dina hörlurar/högtalare');
          console.log('4. Se hur appen transkriberar och ger coaching i realtid\n');
          synthesizer.close();
          resolve();
        } else {
          console.error('❌ Fel vid generering:', result.errorDetails);
          synthesizer.close();
          reject(new Error(result.errorDetails));
        }
      },
      error => {
        console.error('❌ Fel:', error);
        synthesizer.close();
        reject(error);
      }
    );
  });
}

generateTestAudio().catch(console.error);
