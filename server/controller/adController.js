const researchService = require('../services/researchService');
const copywritingService = require('../services/copywritingService');
const promptService = require('../services/promptService');
const imageService = require('../services/imageService');

/**
 * Main orchestration controller for ad generation.
 * Step 1: Market research
 * Step 2: Generate ad copy
 * Step 3: Create flyer image prompt
 * Step 4: Generate flyer image
 * Step 5: Return combined result
 */
async function generate(req, res, next) {
  try {
    const businessInfo = req.body;

    // Step 1: Market Research
    const researchResult = await researchService.analyze(businessInfo);

    // Step 2: Generate Ad Copy
    const copyResult = await copywritingService.generate(businessInfo, researchResult);

    // Step 3: Create Flyer Image Prompt
    const flyerPrompt = await promptService.createFlyerPrompt(businessInfo, researchResult, copyResult);

    // Step 4: Generate Flyer Image
    const imageUrl = await imageService.generateImage(flyerPrompt, {
      businessInfo,
      copyResult,
      researchResult,
    });

    // Step 5: Return combined result
    return res.json({
      success: true,
      data: {
        imageUrl,
        headline: copyResult.headline,
        adText: copyResult.adText,
        callToAction: copyResult.callToAction,
        facebookCaption: copyResult.facebookCaption,
        whatsappCaption: copyResult.whatsappCaption,
        flyerPrompt, // included for debugging
      },
    });
  } catch (error) {
    console.error('AdController error:', error);
    return next(error);
  }
}

module.exports = { generate };
