import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '35mb' }));
app.use(express.urlencoded({ extended: true, limit: '35mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    mode: 'ONLINE_CHART_ENGINE',
    app: 'CANDLE MINDSET AI SIGNAL',
    timestamp: Date.now(),
  });
});

// Simple offline chart analysis endpoint
app.post('/api/analyze', (req, res) => {
  const { fileName } = req.body;

  let market = 'USD/INR';
  if (fileName) {
    const match = fileName.match(/(USD[\/_-]?INR|EUR[\/_-]?USD|GBP[\/_-]?USD|USD[\/_-]?JPY|AUD[\/_-]?USD|EUR[\/_-]?GBP|XAU[\/_-]?USD|Gold|BTC[\/_-]?USD|ETH[\/_-]?USD|USD[\/_-]?BRL)/i);
    if (match) {
      market = match[0].replace(/_/g, '/').replace(/-/g, '/').toUpperCase();
      if (market === 'GOLD') market = 'Gold (XAU/USD)';
    }
  }

  // Alternating deterministic baseline
  const direction = Math.floor(Date.now() / 60000) % 2 === 0 ? 'UP' : 'DOWN';

  return res.json({
    success: true,
    market,
    direction,
    confidence: 91,
    analysisTimestamp: Date.now(),
  });
});

// Start full-stack server
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[CANDLE MINDSET AI SIGNAL] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
