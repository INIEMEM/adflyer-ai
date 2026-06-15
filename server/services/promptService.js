const { AI_PROVIDER } = require('../config/env');
const geminiService = require('./geminiService');
const openaiService = require('./openaiService');

const textService = AI_PROVIDER === 'gemini' ? geminiService : openaiService;

/**
 * Creates a detailed image generation prompt for the advertising flyer.
 * @param {Object} businessInfo
 * @param {Object} researchResult
 * @param {Object} copyResult
 * @returns {string} flyerPrompt
 */
async function createFlyerPrompt(businessInfo, researchResult, copyResult) {
  const userPrompt = `Create a detailed image generation prompt for an advertising flyer based on the following context.

Business Details:
${JSON.stringify(businessInfo, null, 2)}

Market Research:
${JSON.stringify(researchResult, null, 2)}

Ad Copy:
${JSON.stringify(copyResult, null, 2)}

Write a single, detailed image generation prompt (plain text, NOT JSON) that describes:
1. Layout and composition of the flyer
2. Color scheme matching the business type and advertising style: "${researchResult.advertisingStyle}"
3. Typography style (font mood, not specific fonts)
4. Imagery and visual elements that resonate with the target audience
5. The headline text to be displayed: "${copyResult.headline}"
6. Any special offer text if provided: "${businessInfo.specialOffer || 'N/A'}"
7. Contact info placement: "${businessInfo.contactInfo}"
8. Overall mood and marketing style

End the prompt with: "professional advertising flyer, high resolution, print quality"

Return ONLY the image generation prompt as plain text.`;

  return textService.generateText({
    systemInstruction:
      'You are an expert graphic designer and art director who writes detailed prompts for AI image generation.',
    prompt: userPrompt,
    temperature: 0.7,
  });
}

module.exports = { createFlyerPrompt };
