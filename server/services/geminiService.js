const { GEMINI_API_KEY, GEMINI_MODEL } = require('../config/env');

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
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set. Add it to server/.env and restart the server.');
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`;
  const generationConfig = { temperature };

  if (responseMimeType) {
    generationConfig.responseMimeType = responseMimeType;
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: systemInstruction }],
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      generationConfig,
    }),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = payload.error?.message || `Gemini API returned ${response.status}`;
    throw new Error(message);
  }

  const text = payload.candidates?.[0]?.content?.parts
    ?.map(part => part.text || '')
    .join('')
    .trim();

  if (!text) {
    throw new Error('Gemini API returned an empty response.');
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
