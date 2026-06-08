require('./config/env');
const express = require('express');
const cors = require('cors');
const adController = require('./controller/adController');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5000'],
  methods: ['GET', 'POST'],
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
