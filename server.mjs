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
}

mountVercelFunctions().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 API Server running on http://localhost:${PORT}`);
    console.log(`   - POST http://localhost:${PORT}/api/ai-customer`);
    console.log(`   - POST http://localhost:${PORT}/api/ai-customer-quick`);
    console.log(`   - POST http://localhost:${PORT}/api/analyze-call`);
    console.log(`   - GET  http://localhost:${PORT}/api/training-scenarios`);
    console.log(`   - POST http://localhost:${PORT}/api/training-scenarios`);
  });
}).catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
