// TO SWAP IMAGE PROVIDER: replace the implementation below.
// Keep the function signature: async generateImage(prompt) => imageUrl string

const { getOpenAIClient } = require('./openaiClient');

/**
 * Generates an advertising flyer image using DALL-E 3.
 * @param {string} prompt - The detailed image generation prompt
 * @returns {string} imageUrl
 */
async function generateImage(prompt) {
  const response = await getOpenAIClient().images.generate({
    model: 'dall-e-3',
    prompt,
    size: '1024x1024',
    quality: 'standard',
    n: 1,
  });

  return response.data[0].url;
}

module.exports = { generateImage };
