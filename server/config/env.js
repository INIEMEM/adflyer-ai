const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const config = {
  GEMINI_API_KEY:    process.env.GEMINI_API_KEY,
  GEMINI_MODEL:      process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite',
  GEMINI_IMAGE_MODEL: process.env.GEMINI_IMAGE_MODEL || 'gemini-3.1-flash-image',
  IMAGE_GEN_API_KEY: process.env.IMAGE_GEN_API_KEY,
};

// ── Startup validation ────────────────────────────────────────────────────────
if (!config.GEMINI_API_KEY) {
  console.warn('⚠️  WARNING: GEMINI_API_KEY is not set. Text generation will not work.');
}

module.exports = config;
