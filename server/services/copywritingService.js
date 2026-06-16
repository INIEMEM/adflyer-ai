const { AI_PROVIDER } = require('../config/env');
const geminiService = require('./geminiService');
const openaiService = require('./openaiService');
const hfService     = require('./hfService');

const textService =
  AI_PROVIDER === 'gemini'      ? geminiService :
  AI_PROVIDER === 'huggingface' ? hfService :
  openaiService;

/**
 * Generates advertising copy based on business info and research results.
 * @param {Object} businessInfo
 * @param {Object} researchResult
 * @returns {Object} copyResult
 */
async function generate(businessInfo, researchResult) {
  const userPrompt = `You are creating ad copy for the following business. Use the market research provided to craft highly targeted copy.

Business Details:
${JSON.stringify(businessInfo, null, 2)}

Market Research:
${JSON.stringify(researchResult, null, 2)}

Return a JSON object with exactly these keys:
{
  "headline": "string",
  "adText": "string",
  "callToAction": "string",
  "facebookCaption": "string",
  "whatsappCaption": "string"
}

Guidelines:
- headline: powerful, attention-grabbing, max 10 words
- adText: 2-3 sentences of persuasive advertising body text
- callToAction: strong CTA phrase (e.g. "Call Now", "Order Today", "Visit Us")
- facebookCaption: ready-to-post Facebook caption with relevant emojis, include contact info
- whatsappCaption: ready-to-forward WhatsApp message with emojis and contact info

Return ONLY valid JSON, no markdown, no extra text.`;

  const content = await textService.generateText({
    systemInstruction: 'You are a world-class advertising copywriter who creates high-converting marketing copy.',
    prompt: userPrompt,
    temperature: 0.8,
    responseMimeType: 'application/json',
  });

  return textService.parseJsonResponse(content);
}

module.exports = { generate };
