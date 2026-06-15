const { AI_PROVIDER } = require('../config/env');
const geminiService = require('./geminiService');
const openaiService = require('./openaiService');

const textService = AI_PROVIDER === 'gemini' ? geminiService : openaiService;

/**
 * Analyzes business info and returns market research data.
 * @param {Object} businessInfo
 * @returns {Object} researchResult
 */
async function analyze(businessInfo) {
  const { businessName, businessType, productOrService, targetLocation, specialOffer, contactInfo } = businessInfo;

  const userPrompt = `Analyze the following business and return a JSON object with exactly these keys:
{
  "painPoints": ["string", "string", "string"],
  "desires": ["string", "string", "string"],
  "marketingAngles": ["string", "string", "string"],
  "advertisingStyle": "string",
  "targetAudience": "string"
}

Business Details:
- Business Name: ${businessName}
- Business Type: ${businessType}
- Product/Service: ${productOrService}
- Target Location: ${targetLocation}
- Special Offer: ${specialOffer || 'None'}
- Contact Info: ${contactInfo}

Return ONLY valid JSON, no markdown, no extra text.`;

  const content = await textService.generateText({
    systemInstruction: 'You are an expert market research analyst and advertising strategist.',
    prompt: userPrompt,
    temperature: 0.7,
    responseMimeType: 'application/json',
  });

  return textService.parseJsonResponse(content);
}

module.exports = { analyze };
