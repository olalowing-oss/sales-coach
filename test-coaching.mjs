/**
 * Test Real-time Coaching Events
 *
 * Tests the coaching engine by sending customer messages with:
 * - Price objection → coaching.objection event
 * - Competitor mention → coaching.tip (battlecard)
 * - Buying signal → coaching.tip (suggestion)
 * - Silence (>20s) → analysis.silence event
 * - Sentiment analysis → analysis.sentiment event
 *
 * Run: node test-coaching.mjs
 */

import WebSocket from 'ws';

console.log('🧪 Testing Real-time Coaching Engine...\n');

const ws = new WebSocket('ws://localhost:3001/ws');

let sessionId = null;
const eventsReceived = [];

ws.on('open', () => {
  console.log('✅ WebSocket connected\n');

  // Connect
  ws.send(JSON.stringify({
    type: 'connect',
    payload: {
      userId: 'test-user-coaching',
      authToken: 'dev-token-123',
      device: { name: 'Coaching Test', type: 'desktop' }
    }
  }));
});

ws.on('message', async (data) => {
  const message = JSON.parse(data.toString());

  // Track all events
  if (message.type !== 'transcription') {
    eventsReceived.push(message.type);
  }

  if (message.type === 'connected') {
    console.log(`✅ Authenticated\n`);

    // Start session
    console.log('📤 Starting session...');
    ws.send(JSON.stringify({
      type: 'session.start',
      payload: {
        customer: {
          company: 'Test Företag AB',
          name: 'Test Kund'
        },
        mode: 'live_call'
      }
    }));
  }

  if (message.type === 'session.started') {
    sessionId = message.payload.sessionId;
    console.log(`✅ Session started: ${sessionId}\n`);

    // Run test sequence
    await runTestSequence(sessionId);
  }

  // Log coaching events
  if (message.type === 'coaching.tip') {
    const tip = message.payload.tip;
    console.log(`\n🎯 COACHING TIP:`);
    console.log(`   Type: ${tip.type}`);
    console.log(`   Priority: ${tip.priority}`);
    console.log(`   Title: ${tip.title}`);
    console.log(`   Content: ${tip.content}`);
    if (tip.talkingPoints && tip.talkingPoints.length > 0) {
      console.log(`   Talking points:`);
      tip.talkingPoints.slice(0, 2).forEach(tp => console.log(`     - ${tp}`));
    }
  }

  if (message.type === 'coaching.objection') {
    const obj = message.payload.objection;
    console.log(`\n❗ OBJECTION DETECTED:`);
    console.log(`   Category: ${obj.category}`);
    console.log(`   Type: ${obj.type}`);
    console.log(`   Response: ${obj.responseShort}`);
    if (obj.followupQuestions && obj.followupQuestions.length > 0) {
      console.log(`   Follow-up questions:`);
      obj.followupQuestions.slice(0, 2).forEach(q => console.log(`     - ${q}`));
    }
  }

  if (message.type === 'analysis.sentiment') {
    const sentiment = message.payload;
    console.log(`\n💭 SENTIMENT ANALYSIS:`);
    console.log(`   Sentiment: ${sentiment.sentiment}`);
    console.log(`   Interest level: ${sentiment.interestLevel}%`);
    console.log(`   Confidence: ${Math.round(sentiment.confidence * 100)}%`);
  }

  if (message.type === 'analysis.silence') {
    const silence = message.payload;
    console.log(`\n🔇 SILENCE DETECTED:`);
    console.log(`   Duration: ${silence.duration}s`);
    console.log(`   Suggestion: ${silence.suggestion}`);
    if (silence.examples && silence.examples.length > 0) {
      console.log(`   Examples:`);
      silence.examples.slice(0, 2).forEach(ex => console.log(`     - ${ex}`));
    }
  }

  if (message.type === 'session.ended') {
    console.log('\n✅ Session ended\n');

    // Summary
    console.log('📊 Test Results:');
    console.log(`   Total events received: ${eventsReceived.length}`);
    console.log(`   Event types: ${[...new Set(eventsReceived)].join(', ')}`);

    console.log('\n🔍 Expected events:');
    const expected = ['coaching.objection', 'coaching.tip', 'analysis.sentiment'];
    expected.forEach(evt => {
      const received = eventsReceived.includes(evt);
      console.log(`   ${received ? '✅' : '❌'} ${evt}`);
    });

    console.log('\n🎉 Test complete!');

    setTimeout(() => {
      ws.close();
      process.exit(0);
    }, 1000);
  }

  if (message.type === 'error') {
    console.error('\n❌ Error:', message.payload);
    ws.close();
    process.exit(1);
  }
});

async function runTestSequence(sessionId) {
  console.log('🎬 Running test sequence:\n');

  await sleep(500);

  // Test 1: Price objection
  console.log('1️⃣ Testing price objection...');
  sendTranscript(sessionId, 'Det här låter intressant men det är för dyrt för oss.', 'customer');

  await sleep(3000); // Wait for sentiment analysis

  // Test 2: Competitor mention
  console.log('2️⃣ Testing competitor battlecard...');
  sendTranscript(sessionId, 'Vi har faktiskt pratat med Atea också.', 'customer');

  await sleep(3000);

  // Test 3: Buying signal
  console.log('3️⃣ Testing buying signal...');
  sendTranscript(sessionId, 'Det låter intressant. Hur mycket kostar det egentligen?', 'customer');

  await sleep(3000);

  // Test 4: Multiple triggers
  console.log('4️⃣ Testing multiple triggers...');
  sendTranscript(
    sessionId,
    'Vi har redan avtal med CGI men de är för dyra och vi behöver inte allt de erbjuder.',
    'customer'
  );

  await sleep(3000);

  // Test 5: Positive sentiment
  console.log('5️⃣ Testing positive sentiment...');
  sendTranscript(
    sessionId,
    'Det här verkar verkligen lösa våra problem! Kan vi boka en demo?',
    'customer'
  );

  await sleep(3000);

  // End session
  console.log('\n📤 Ending session...');
  ws.send(JSON.stringify({
    type: 'session.end',
    payload: { sessionId }
  }));
}

function sendTranscript(sessionId, text, speaker) {
  ws.send(JSON.stringify({
    type: 'session.transcript',
    payload: {
      sessionId,
      text,
      isFinal: true,
      speaker,
      confidence: 0.95
    }
  }));
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

ws.on('close', () => {
  console.log('\n🔌 Connection closed');
});

ws.on('error', (error) => {
  console.error('\n❌ WebSocket error:', error.message);
  process.exit(1);
});

// Timeout
setTimeout(() => {
  console.error('\n❌ Test timeout');
  ws.close();
  process.exit(1);
}, 60000);
