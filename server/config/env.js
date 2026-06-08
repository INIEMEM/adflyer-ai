const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const config = {
  OPENAI_API_KEY:    process.env.OPENAI_API_KEY,
  IMAGE_GEN_API_KEY: process.env.IMAGE_GEN_API_KEY,
  IMAGE_GEN_API_URL: process.env.IMAGE_GEN_API_URL || 'https://api.openai.com/v1',
};

// ── Startup validation ────────────────────────────────────────────────────────
if (!config.OPENAI_API_KEY) {
  console.warn('⚠️  WARNING: OPENAI_API_KEY is not set. The app will not work.');
}

module.exports = config;
