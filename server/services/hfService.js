// HuggingFace text generation service
// Uses InferenceClient.chatCompletion (OpenAI-compatible interface)

const { InferenceClient } = require('@huggingface/inference');
const { HF_TOKEN, HF_TEXT_MODEL } = require('../config/env');

function cleanJsonText(text) {
  return text
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
}

/**
 * Generates text using a HuggingFace chat model.
 * Implements the same interface as openaiService.generateText().
 */
async function generateText({ prompt, systemInstruction, temperature = 0.7 }) {
  if (!HF_TOKEN) {
    throw new Error('HF_TOKEN is not set. Add it to server/.env and restart the server.');
  }

  const client = new InferenceClient(HF_TOKEN);

  const response = await client.chatCompletion({
    model: HF_TEXT_MODEL,
    messages: [
      { role: 'system', content: systemInstruction },
      { role: 'user',   content: prompt },
    ],
    temperature,
    max_tokens: 1500,
  });

  const text = response.choices?.[0]?.message?.content?.trim();

  if (!text) {
    throw new Error('HuggingFace text API returned an empty response.');
  }

  return text;
}

function parseJsonResponse(text) {
  return JSON.parse(cleanJsonText(text));
}

module.exports = { generateText, parseJsonResponse };
