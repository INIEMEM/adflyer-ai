const { getOpenAIClient } = require('./openaiClient');

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

  const response = await getOpenAIClient().chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: 'You are a world-class advertising copywriter who creates high-converting marketing copy.',
      },
      {
        role: 'user',
        content: userPrompt,
      },
    ],
    temperature: 0.8,
  });

  const content = response.choices[0].message.content.trim();
  return JSON.parse(content);
}

module.exports = { generate };
