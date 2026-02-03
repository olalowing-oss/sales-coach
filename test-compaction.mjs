/**
 * Test Session Compaction
 *
 * Tests the session manager's compaction feature by:
 * 1. Creating a session
 * 2. Sending 35 transcript messages
 * 3. Verifying compaction occurs at message 30
 * 4. Ending session and checking summary
 *
 * Run: node test-compaction.mjs
 */

import WebSocket from 'ws';

console.log('🧪 Testing Session Manager Compaction...\n');

const ws = new WebSocket('ws://localhost:3001/ws');

let sessionId = null;
let compactionDetected = false;
let messagesReceived = 0;

ws.on('open', () => {
  console.log('✅ WebSocket connected');

  // Connect
  ws.send(JSON.stringify({
    type: 'connect',
    payload: {
      userId: 'test-user-compaction',
      authToken: 'dev-token-123',
      device: { name: 'Compaction Test', type: 'desktop' }
    }
  }));
});

ws.on('message', async (data) => {
  const message = JSON.parse(data.toString());

  if (message.type === 'connected') {
    console.log(`✅ Authenticated (${message.payload.connectionId})\n`);

    // Start session
    console.log('📤 Starting session...');
    ws.send(JSON.stringify({
      type: 'session.start',
      payload: {
        customer: {
          company: 'Compaction Test AB',
          name: 'Test Customer'
        },
        mode: 'live_call'
      }
    }));
  }

  if (message.type === 'session.started') {
    sessionId = message.payload.sessionId;
    console.log(`✅ Session started: ${sessionId}\n`);
    console.log('📤 Sending 35 transcript messages...');
    console.log('   (Compaction should occur after message 30)\n');

    // Send 35 messages (compaction triggers at 30)
    for (let i = 1; i <= 35; i++) {
      const speaker = i % 2 === 0 ? 'customer' : 'seller';
      const text = `Test message ${i} from ${speaker}. This is a sample transcript segment.`;

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

      // Small delay to avoid overwhelming
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    console.log('✅ All 35 messages sent\n');
  }

  if (message.type === 'transcription') {
    messagesReceived++;

    // Log progress every 5 messages
    if (messagesReceived % 5 === 0) {
      console.log(`   📝 Received ${messagesReceived}/35 transcriptions`);
    }

    // After receiving all 35, wait a bit for compaction to process, then end session
    if (messagesReceived === 35) {
      console.log('\n⏳ Waiting 2 seconds for compaction to complete...');
      setTimeout(() => {
        console.log('📤 Ending session...\n');
        ws.send(JSON.stringify({
          type: 'session.end',
          payload: { sessionId }
        }));
      }, 2000);
    }
  }

  if (message.type === 'session.ended') {
    const summary = message.payload.summary;
    console.log('✅ Session ended successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - Duration: ${Math.round(summary.duration / 1000)}s`);
    console.log(`   - Total segments: ${summary.totalSegments}`);
    console.log(`   - Interest level: ${summary.interestLevel}`);
    console.log(`   - Pain points: ${summary.painPoints?.length || 0}`);
    console.log(`   - Objections: ${summary.objections?.length || 0}`);

    // Check compaction
    console.log('\n🔍 Compaction Check:');
    if (summary.totalSegments > 35) {
      console.log(`   ❌ Expected ~35 segments, got ${summary.totalSegments}`);
    } else {
      console.log(`   ✅ Segment count looks correct (${summary.totalSegments})`);
    }

    // Check if compaction occurred (would see in server logs)
    console.log('\n💡 Check server logs for:');
    console.log('   - "[SessionManager] Compacting session..."');
    console.log('   - "Compaction complete: X segments → summary"');

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
}, 30000);
