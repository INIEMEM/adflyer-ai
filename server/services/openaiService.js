const { OPENAI_API_KEY, OPENAI_TEXT_MODEL } = require('../config/env');

function cleanJsonText(text) {
  return text
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
}

async function generateText({
  prompt,
  systemInstruction,
  temperature = 0.7,
  responseMimeType,
}) {
  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set. Add it to server/.env and restart the server.');
  }

  const body = {
    model: OPENAI_TEXT_MODEL,
    messages: [
      { role: 'system', content: systemInstruction },
      { role: 'user', content: prompt },
    ],
    temperature,
  };

  if (responseMimeType === 'application/json') {
    body.response_format = { type: 'json_object' };
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = payload.error?.message || `OpenAI API returned ${response.status}`;
    throw new Error(message);
  }

  const text = payload.choices?.[0]?.message?.content?.trim();

  if (!text) {
    throw new Error('OpenAI API returned an empty response.');
  }

  return text;
}

function parseJsonResponse(text) {
  return JSON.parse(cleanJsonText(text));
}

module.exports = {
  generateText,
  parseJsonResponse,
};
