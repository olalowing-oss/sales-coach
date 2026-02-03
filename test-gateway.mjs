/**
 * Test WebSocket Gateway Connection
 *
 * Run this script to verify the Gateway server is working:
 * node test-gateway.mjs
 */

import WebSocket from 'ws';

console.log('🧪 Testing WebSocket Gateway...\n');

const ws = new WebSocket('ws://localhost:3001/ws');

let connectionId = null;

ws.on('open', () => {
  console.log('✅ WebSocket connection opened');

  // Send connect message
  console.log('📤 Sending connect message...');
  ws.send(JSON.stringify({
    type: 'connect',
    payload: {
      userId: 'test-user-123',
      authToken: 'dev-token-123',
      device: {
        name: 'Test Client',
        type: 'desktop'
      }
    }
  }));
});

ws.on('message', (data) => {
  const message = JSON.parse(data.toString());
  console.log('📥 Received:', message.type);
  console.log('   Payload:', JSON.stringify(message.payload, null, 2));

  if (message.type === 'connected') {
    connectionId = message.payload.connectionId;
    console.log('\n✅ Successfully authenticated!');
    console.log(`   Connection ID: ${connectionId}\n`);

    // Test session.start
    console.log('📤 Testing session.start...');
    ws.send(JSON.stringify({
      type: 'session.start',
      payload: {
        customer: {
          company: 'Test Company AB',
          name: 'Test Customer',
          role: 'CEO'
        },
        mode: 'live_call',
        productId: 'test-product'
      }
    }));
  }

  if (message.type === 'session.started') {
    const sessionId = message.payload.sessionId;
    console.log('\n✅ Session started successfully!');
    console.log(`   Session ID: ${sessionId}\n`);

    // Test transcript
    console.log('📤 Testing session.transcript...');
    ws.send(JSON.stringify({
      type: 'session.transcript',
      payload: {
        sessionId,
        text: 'Hej, kan du berätta mer om era utmaningar?',
        isFinal: true,
        speaker: 'seller',
        confidence: 0.95
      }
    }));
  }

  if (message.type === 'transcription') {
    console.log('\n✅ Transcription received!');
    console.log(`   Text: "${message.payload.segment.text}"\n`);

    // Test session.end
    console.log('📤 Testing session.end...');
    ws.send(JSON.stringify({
      type: 'session.end',
      payload: {
        sessionId: message.payload.sessionId
      }
    }));
  }

  if (message.type === 'session.ended') {
    console.log('\n✅ Session ended successfully!');
    console.log('\n🎉 All tests passed!\n');

    // Close connection
    setTimeout(() => {
      ws.close();
      process.exit(0);
    }, 1000);
  }

  if (message.type === 'error') {
    console.error('\n❌ Error received:', message.payload);
    ws.close();
    process.exit(1);
  }
});

ws.on('close', (code, reason) => {
  console.log(`\n🔌 Connection closed: ${code} - ${reason || 'No reason'}`);
});

ws.on('error', (error) => {
  console.error('\n❌ WebSocket error:', error.message);
  process.exit(1);
});

// Timeout after 10 seconds
setTimeout(() => {
  console.error('\n❌ Test timeout - no response from server');
  ws.close();
  process.exit(1);
}, 10000);
