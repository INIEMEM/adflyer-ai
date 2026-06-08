const OpenAI = require('openai');
const { OPENAI_API_KEY } = require('../config/env');

let openai;

function getOpenAIClient() {
  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set. Add it to server/.env and restart the server.');
  }

  if (!openai) {
    openai = new OpenAI({ apiKey: OPENAI_API_KEY });
  }

  return openai;
}

module.exports = { getOpenAIClient };
