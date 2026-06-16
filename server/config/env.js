const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const config = {
  OPENAI_API_KEY:    process.env.OPENAI_API_KEY,
  OPENAI_TEXT_MODEL: process.env.OPENAI_TEXT_MODEL || 'gpt-4o',
  OPENAI_IMAGE_MODEL: process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1',
  GEMINI_API_KEY:    process.env.GEMINI_API_KEY,
  GEMINI_MODEL:      process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite',
  GEMINI_IMAGE_MODEL: process.env.GEMINI_IMAGE_MODEL || 'gemini-3.1-flash-image',
  AI_PROVIDER:       process.env.AI_PROVIDER || 'huggingface',
  IMAGE_PROVIDER:    process.env.IMAGE_PROVIDER || 'huggingface',
  IMAGE_GEN_API_KEY: process.env.IMAGE_GEN_API_KEY,
  HF_TOKEN:          process.env.HF_TOKEN,
  HF_TEXT_MODEL:     process.env.HF_TEXT_MODEL || 'meta-llama/Llama-3.3-70B-Instruct',
  HF_MODEL:          process.env.HF_MODEL || 'black-forest-labs/FLUX.1-dev',
  POLLINATIONS_IMAGE_URL: process.env.POLLINATIONS_IMAGE_URL || 'https://image.pollinations.ai',
};

// ── Startup validation ────────────────────────────────────────────────────────
if (config.AI_PROVIDER === 'gemini' && !config.GEMINI_API_KEY) {
  console.warn('⚠️  WARNING: GEMINI_API_KEY is not set. Gemini text generation will not work.');
}

if ((config.AI_PROVIDER === 'openai' || config.IMAGE_PROVIDER === 'openai') && !config.OPENAI_API_KEY) {
  console.warn('⚠️  WARNING: OPENAI_API_KEY is not set. OpenAI generation will not work.');
}

if (config.IMAGE_PROVIDER === 'huggingface' && !config.HF_TOKEN) {
  console.warn('⚠️  WARNING: HF_TOKEN is not set. Hugging Face image generation will not work.');
}

module.exports = config;
