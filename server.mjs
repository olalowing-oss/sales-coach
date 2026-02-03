import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Import and mount Vercel Functions
async function mountVercelFunctions() {
  // AI Customer endpoint (full response with coaching)
  const aiCustomer = await import('./api/ai-customer.ts');
  app.post('/api/ai-customer', async (req, res) => {
    const vercelReq = { ...req, method: req.method, body: req.body };
    const vercelRes = {
      status: (code) => {
        res.status(code);
        return vercelRes;
      },
      json: (data) => res.json(data),
      end: () => res.end(),
      setHeader: (key, value) => res.setHeader(key, value)
    };

    try {
      await aiCustomer.default(vercelReq, vercelRes);
    } catch (error) {
      console.error('AI Customer error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // AI Customer Quick endpoint (fast response, no coaching)
  const aiCustomerQuick = await import('./api/ai-customer-quick.ts');
  app.post('/api/ai-customer-quick', async (req, res) => {
    const vercelReq = { ...req, method: req.method, body: req.body };
    const vercelRes = {
      status: (code) => {
        res.status(code);
        return vercelRes;
      },
      json: (data) => res.json(data),
      end: () => res.end(),
      setHeader: (key, value) => res.setHeader(key, value)
    };

    try {
      await aiCustomerQuick.default(vercelReq, vercelRes);
    } catch (error) {
      console.error('AI Customer Quick error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Analyze Call endpoint
  const analyzeCall = await import('./api/analyze-call.ts');
  app.post('/api/analyze-call', async (req, res) => {
    const vercelReq = { ...req, method: req.method, body: req.body };
    const vercelRes = {
      status: (code) => {
        res.status(code);
        return vercelRes;
      },
      json: (data) => res.json(data),
      end: () => res.end(),
      setHeader: (key, value) => res.setHeader(key, value)
    };

    try {
      await analyzeCall.default(vercelReq, vercelRes);
    } catch (error) {
      console.error('Analyze Call error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Extract Questionnaire Answers endpoint (AI auto-fill)
  const extractQuestionnaireAnswers = await import('./api/extract-questionnaire-answers.ts');
  app.post('/api/extract-questionnaire-answers', async (req, res) => {
    const vercelReq = { ...req, method: req.method, body: req.body };
    const vercelRes = {
      status: (code) => {
        res.status(code);
        return vercelRes;
      },
      json: (data) => res.json(data),
      end: () => res.end(),
      setHeader: (key, value) => res.setHeader(key, value)
    };

    try {
      await extractQuestionnaireAnswers.default(vercelReq, vercelRes);
    } catch (error) {
      console.error('Extract Questionnaire Answers error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Save Questionnaire Answers endpoint (persist to database)
  const saveQuestionnaireAnswers = await import('./api/save-questionnaire-answers.ts');
  app.post('/api/save-questionnaire-answers', async (req, res) => {
    const vercelReq = { ...req, method: req.method, body: req.body, headers: req.headers };
    const vercelRes = {
      status: (code) => {
        res.status(code);
        return vercelRes;
      },
      json: (data) => res.json(data),
      end: () => res.end(),
      setHeader: (key, value) => res.setHeader(key, value)
    };

    try {
      await saveQuestionnaireAnswers.default(vercelReq, vercelRes);
    } catch (error) {
      console.error('Save Questionnaire Answers error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Load Questionnaire Answers endpoint (load from database)
  const loadQuestionnaireAnswers = await import('./api/load-questionnaire-answers.ts');
  app.get('/api/load-questionnaire-answers', async (req, res) => {
    const vercelReq = { ...req, method: req.method, query: req.query, headers: req.headers };
    const vercelRes = {
      status: (code) => {
        res.status(code);
        return vercelRes;
      },
      json: (data) => res.json(data),
      end: () => res.end(),
      setHeader: (key, value) => res.setHeader(key, value)
    };

    try {
      await loadQuestionnaireAnswers.default(vercelReq, vercelRes);
    } catch (error) {
      console.error('Load Questionnaire Answers error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Accounts List endpoint (customer register)
  const accountsList = await import('./api/accounts-list.ts');
  app.get('/api/accounts-list', async (req, res) => {
    const vercelReq = { ...req, method: req.method, query: req.query, headers: req.headers };
    const vercelRes = {
      status: (code) => {
        res.status(code);
        return vercelRes;
      },
      json: (data) => res.json(data),
      end: () => res.end(),
      setHeader: (key, value) => res.setHeader(key, value)
    };

    try {
      await accountsList.default(vercelReq, vercelRes);
    } catch (error) {
      console.error('Accounts List error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Training Scenarios endpoint
  const trainingScenarios = await import('./api/training-scenarios.ts');
  app.get('/api/training-scenarios', async (req, res) => {
    const vercelReq = { ...req, method: req.method, query: req.query };
    const vercelRes = {
      status: (code) => {
        res.status(code);
        return vercelRes;
      },
      json: (data) => res.json(data),
      end: () => res.end(),
      setHeader: (key, value) => res.setHeader(key, value)
    };

    try {
      await trainingScenarios.default(vercelReq, vercelRes);
    } catch (error) {
      console.error('Training Scenarios error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/training-scenarios', async (req, res) => {
    const vercelReq = { ...req, method: req.method, body: req.body };
    const vercelRes = {
      status: (code) => {
        res.status(code);
        return vercelRes;
      },
      json: (data) => res.json(data),
      end: () => res.end(),
      setHeader: (key, value) => res.setHeader(key, value)
    };

    try {
      await trainingScenarios.default(vercelReq, vercelRes);
    } catch (error) {
      console.error('Training Scenarios error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Process Document endpoint
  const processDocument = await import('./api/process-document.ts');
  app.post('/api/process-document', async (req, res) => {
    const vercelReq = { ...req, method: req.method, body: req.body };
    const vercelRes = {
      status: (code) => {
        res.status(code);
        return vercelRes;
      },
      json: (data) => res.json(data),
      end: () => res.end(),
      setHeader: (key, value) => res.setHeader(key, value)
    };

    try {
      await processDocument.default(vercelReq, vercelRes);
    } catch (error) {
      console.error('Process Document error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Generate Scenarios endpoint
  const generateScenarios = await import('./api/generate-scenarios.ts');
  app.post('/api/generate-scenarios', async (req, res) => {
    const vercelReq = { ...req, method: req.method, body: req.body };
    const vercelRes = {
      status: (code) => {
        res.status(code);
        return vercelRes;
      },
      json: (data) => res.json(data),
      end: () => res.end(),
      setHeader: (key, value) => res.setHeader(key, value)
    };

    try {
      await generateScenarios.default(vercelReq, vercelRes);
    } catch (error) {
      console.error('Generate Scenarios error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Update Scenario endpoint (uses service role to bypass RLS)
  const updateScenario = await import('./api/update-scenario.ts');
  app.put('/api/update-scenario', async (req, res) => {
    const vercelReq = { ...req, method: req.method, body: req.body };
    const vercelRes = {
      status: (code) => {
        res.status(code);
        return vercelRes;
      },
      json: (data) => res.json(data),
      end: () => res.end(),
      setHeader: (key, value) => res.setHeader(key, value)
    };

    try {
      await updateScenario.default(vercelReq, vercelRes);
    } catch (error) {
      console.error('Update Scenario error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Test RAG endpoint (streaming)
  const testRagStream = await import('./api/test-rag-stream.ts');
  app.post('/api/test-rag-stream', async (req, res) => {
    const vercelReq = { ...req, method: req.method, body: req.body };
    const vercelRes = {
      status: (code) => {
        res.status(code);
        return vercelRes;
      },
      json: (data) => res.json(data),
      end: () => res.end(),
      write: (data) => res.write(data),
      setHeader: (key, value) => res.setHeader(key, value)
    };

    try {
      await testRagStream.default(vercelReq, vercelRes);
    } catch (error) {
      console.error('Test RAG Stream error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Generate Offers endpoint
  const generateOffers = await import('./api/generate-offers.ts');
  app.post('/api/generate-offers', async (req, res) => {
    const vercelReq = { ...req, method: req.method, body: req.body };
    const vercelRes = {
      status: (code) => {
        res.status(code);
        return vercelRes;
      },
      json: (data) => res.json(data),
      end: () => res.end(),
      setHeader: (key, value) => res.setHeader(key, value)
    };

    try {
      await generateOffers.default(vercelReq, vercelRes);
    } catch (error) {
      console.error('Generate Offers error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Test RAG endpoint (non-streaming)
  const testRag = await import('./api/test-rag.ts');
  app.post('/api/test-rag', async (req, res) => {
    const vercelReq = { ...req, method: req.method, body: req.body };
    const vercelRes = {
      status: (code) => {
        res.status(code);
        return vercelRes;
      },
      json: (data) => res.json(data),
      end: () => res.end(),
      setHeader: (key, value) => res.setHeader(key, value)
    };

    try {
      await testRag.default(vercelReq, vercelRes);
    } catch (error) {
      console.error('Test RAG error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Generate Triggers endpoint
  const generateTriggers = await import('./api/generate-triggers.ts');
  app.post('/api/generate-triggers', async (req, res) => {
    const vercelReq = { ...req, method: req.method, body: req.body };
    const vercelRes = {
      status: (code) => {
        res.status(code);
        return vercelRes;
      },
      json: (data) => res.json(data),
      end: () => res.end(),
      setHeader: (key, value) => res.setHeader(key, value)
    };

    try {
      await generateTriggers.default(vercelReq, vercelRes);
    } catch (error) {
      console.error('Generate Triggers error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Generate Battlecards endpoint
  const generateBattlecards = await import('./api/generate-battlecards.ts');
  app.post('/api/generate-battlecards', async (req, res) => {
    const vercelReq = { ...req, method: req.method, body: req.body };
    const vercelRes = {
      status: (code) => {
        res.status(code);
        return vercelRes;
      },
      json: (data) => res.json(data),
      end: () => res.end(),
      setHeader: (key, value) => res.setHeader(key, value)
    };

    try {
      await generateBattlecards.default(vercelReq, vercelRes);
    } catch (error) {
      console.error('Generate Battlecards error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Generate Objections endpoint
  const generateObjections = await import('./api/generate-objections.ts');
  app.post('/api/generate-objections', async (req, res) => {
    const vercelReq = { ...req, method: req.method, body: req.body };
    const vercelRes = {
      status: (code) => {
        res.status(code);
        return vercelRes;
      },
      json: (data) => res.json(data),
      end: () => res.end(),
      setHeader: (key, value) => res.setHeader(key, value)
    };

    try {
      await generateObjections.default(vercelReq, vercelRes);
    } catch (error) {
      console.error('Generate Objections error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Generate Cases endpoint
  const generateCases = await import('./api/generate-cases.ts');
  app.post('/api/generate-cases', async (req, res) => {
    const vercelReq = { ...req, method: req.method, body: req.body };
    const vercelRes = {
      status: (code) => {
        res.status(code);
        return vercelRes;
      },
      json: (data) => res.json(data),
      end: () => res.end(),
      setHeader: (key, value) => res.setHeader(key, value)
    };

    try {
      await generateCases.default(vercelReq, vercelRes);
    } catch (error) {
      console.error('Generate Cases error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Generate Demo Script endpoint
  const generateDemoScript = await import('./api/generate-demo-script.ts');
  app.post('/api/generate-demo-script', async (req, res) => {
    const vercelReq = { ...req, method: req.method, body: req.body };
    const vercelRes = {
      status: (code) => {
        res.status(code);
        return vercelRes;
      },
      json: (data) => res.json(data),
      end: () => res.end(),
      setHeader: (key, value) => res.setHeader(key, value)
    };

    try {
      await generateDemoScript.default(vercelReq, vercelRes);
    } catch (error) {
      console.error('Generate Demo Script error:', error);
      res.status(500).json({ error: error.message });
    }
  });
}

mountVercelFunctions().then(async () => {
  // Import Gateway Server
  const { GatewayServer } = await import('./gateway/server.ts');

  // Create HTTP server
  const httpServer = app.listen(PORT, () => {
    console.log(`🚀 API Server running on http://localhost:${PORT}`);
    console.log(`   - POST http://localhost:${PORT}/api/ai-customer`);
    console.log(`   - POST http://localhost:${PORT}/api/ai-customer-quick`);
    console.log(`   - POST http://localhost:${PORT}/api/analyze-call`);
    console.log(`   - POST http://localhost:${PORT}/api/extract-questionnaire-answers`);
    console.log(`   - POST http://localhost:${PORT}/api/save-questionnaire-answers`);
    console.log(`   - GET  http://localhost:${PORT}/api/load-questionnaire-answers`);
    console.log(`   - GET  http://localhost:${PORT}/api/accounts-list`);
    console.log(`   - GET  http://localhost:${PORT}/api/training-scenarios`);
    console.log(`   - POST http://localhost:${PORT}/api/training-scenarios`);
    console.log(`   - POST http://localhost:${PORT}/api/process-document`);
    console.log(`   - POST http://localhost:${PORT}/api/generate-scenarios`);
    console.log(`   - PUT  http://localhost:${PORT}/api/update-scenario`);
    console.log(`   - POST http://localhost:${PORT}/api/test-rag-stream`);
    console.log(`   - POST http://localhost:${PORT}/api/generate-offers`);
    console.log(`   - POST http://localhost:${PORT}/api/test-rag`);
    console.log(`   - POST http://localhost:${PORT}/api/generate-triggers`);
    console.log(`   - POST http://localhost:${PORT}/api/generate-battlecards`);
    console.log(`   - POST http://localhost:${PORT}/api/generate-objections`);
    console.log(`   - POST http://localhost:${PORT}/api/generate-cases`);
    console.log(`   - POST http://localhost:${PORT}/api/generate-demo-script`);
  });

  // Initialize WebSocket Gateway
  const gateway = new GatewayServer(httpServer, {
    authToken: process.env.GATEWAY_AUTH_TOKEN,
  });

  console.log(`🔌 WebSocket Gateway running on ws://localhost:${PORT}/ws`);
  console.log(`   - Real-time coaching events`);
  console.log(`   - Session management`);
  console.log(`   - Live transcription`);

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully...');
    await gateway.close();
    httpServer.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
}).catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
