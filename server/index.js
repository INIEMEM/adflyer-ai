require('./config/env');
const express = require('express');
const cors = require('cors');
const adController = require('./controller/adController');

const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5000',
  'https://adflyer-ai.vercel.app',
  process.env.CLIENT_URL,
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
].filter(Boolean);

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin(origin, callback) {
    if (!origin) {
      return callback(null, true);
    }

    const isAllowedOrigin =
      allowedOrigins.includes(origin) ||
      /^https:\/\/adflyer-ai.*\.vercel\.app$/.test(origin);

    if (isAllowedOrigin) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked origin: ${origin}`));
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));
app.use(express.json());

// ── Request logger ────────────────────────────────────────────────────────────
app.use('/api/generate', (req, res, next) => {
  if (req.method === 'POST') {
    const ts = new Date().toISOString();
    const name = req.body?.businessName || '(unknown)';
    console.log(`[${ts}] POST /api/generate  businessName="${name}"`);
  }
  next();
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/generate', adController.generate);

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// ── Global error handler ──────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('[Global Error]', err);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ AdFlyer AI server running on http://localhost:${PORT}`);
});
