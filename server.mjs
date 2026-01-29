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
  // AI Customer endpoint
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
}

mountVercelFunctions().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 API Server running on http://localhost:${PORT}`);
    console.log(`   - POST http://localhost:${PORT}/api/ai-customer`);
    console.log(`   - POST http://localhost:${PORT}/api/analyze-call`);
  });
}).catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
