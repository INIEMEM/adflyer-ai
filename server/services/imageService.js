// TO SWAP IMAGE PROVIDER: replace the implementation below.
// Keep the function signature: async generateImage(prompt) => imageUrl string

const { InferenceClient } = require('@huggingface/inference');
const { HF_TOKEN, HF_MODEL } = require('../config/env');

// ── Helpers ───────────────────────────────────────────────────────────────────

function escapeXml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function wrapText(text = '', maxChars = 26, maxLines = 4) {
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let current = '';
  words.forEach(word => {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) { lines.push(current); current = word; }
    else { current = next; }
  });
  if (current) lines.push(current);
  return lines.slice(0, maxLines);
}

/**
 * SVG fallback flyer — used only when all image providers fail.
 */
function createFallbackFlyer({ businessInfo = {}, copyResult = {}, researchResult = {} }) {
  const businessName = escapeXml(businessInfo.businessName || 'Your Business');
  const businessType = escapeXml(businessInfo.businessType || 'Premium Service');
  const headline     = wrapText(copyResult.headline || businessName, 24, 3).map(escapeXml);
  const adText       = wrapText(copyResult.adText || '', 42, 4).map(escapeXml);
  const offer        = escapeXml(businessInfo.specialOffer || copyResult.callToAction || 'Limited Offer');
  const contact      = escapeXml(businessInfo.contactInfo || 'Contact us today');
  const cta          = escapeXml(copyResult.callToAction || 'Book Now');
  const target       = escapeXml(businessInfo.targetLocation || '');

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#111827"/>
      <stop offset="48%" stop-color="#243b53"/>
      <stop offset="100%" stop-color="#f59e0b"/>
    </linearGradient>
    <radialGradient id="glow" cx="70%" cy="18%" r="70%">
      <stop offset="0%" stop-color="#fde68a" stop-opacity="0.7"/>
      <stop offset="100%" stop-color="#fde68a" stop-opacity="0"/>
    </radialGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="18" stdDeviation="18" flood-color="#000000" flood-opacity="0.28"/>
    </filter>
  </defs>
  <rect width="1024" height="1024" fill="url(#bg)"/>
  <rect width="1024" height="1024" fill="url(#glow)"/>
  <circle cx="872" cy="128" r="180" fill="#ffffff" opacity="0.08"/>
  <circle cx="142" cy="850" r="240" fill="#ffffff" opacity="0.06"/>
  <g filter="url(#shadow)">
    <rect x="72" y="76" width="880" height="872" rx="34" fill="#fffaf0" opacity="0.97"/>
  </g>
  <rect x="72" y="76" width="880" height="218" rx="34" fill="#111827"/>
  <text x="118" y="146" fill="#fbbf24" font-family="Arial,Helvetica,sans-serif" font-size="36" font-weight="800" letter-spacing="2">${businessName}</text>
  <text x="118" y="196" fill="#f9fafb" font-family="Arial,Helvetica,sans-serif" font-size="24" font-weight="600">${businessType}${target ? ` • ${target}` : ''}</text>
  <g>${headline.map((l, i) => `<text x="118" y="${212 + i * 66}" fill="#111827" font-family="Arial,Helvetica,sans-serif" font-size="58" font-weight="900">${l}</text>`).join('')}</g>
  <rect x="118" y="392" width="788" height="90" rx="45" fill="#f59e0b"/>
  <text x="512" y="451" fill="#111827" font-family="Arial,Helvetica,sans-serif" font-size="34" font-weight="900" text-anchor="middle">${offer}</text>
  <g>${adText.map((l, i) => `<text x="118" y="${484 + i * 42}" fill="#374151" font-family="Arial,Helvetica,sans-serif" font-size="30" font-weight="600">${l}</text>`).join('')}</g>
  <rect x="118" y="710" width="788" height="104" rx="26" fill="#111827"/>
  <text x="512" y="777" fill="#ffffff" font-family="Arial,Helvetica,sans-serif" font-size="42" font-weight="900" text-anchor="middle">${cta}</text>
  <rect x="118" y="846" width="788" height="64" rx="32" fill="#e5e7eb"/>
  <text x="512" y="888" fill="#111827" font-family="Arial,Helvetica,sans-serif" font-size="28" font-weight="800" text-anchor="middle">${contact}</text>
</svg>`;

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

// ── Hugging Face image generation (via official SDK) ──────────────────────────

/**
 * Generates an advertising flyer image using Hugging Face Inference API.
 * Uses the official @huggingface/inference SDK.
 *
 * @param {string} prompt - Detailed image generation prompt from promptService
 * @param {object} fallbackData - { businessInfo, copyResult, researchResult } for SVG fallback
 * @returns {string} A base64 data URL (data:image/...) or SVG data URL on total failure
 */
async function generateImage(prompt, fallbackData = {}) {
  if (!HF_TOKEN) {
    console.warn('[imageService] HF_TOKEN is not set — using SVG fallback flyer.');
    return createFallbackFlyer(fallbackData);
  }

  const fullPrompt = `${prompt}

Do not include fake brand names. Make this look like a polished, modern advertisement flyer.`;

  const client = new InferenceClient(HF_TOKEN);

  try {
    console.log(`[imageService] Generating image with HF model: ${HF_MODEL}`);

    const imageBlob = await client.textToImage({
      model: HF_MODEL,
      inputs: fullPrompt,
      parameters: {
        width: 1024,
        height: 1024,
        num_inference_steps: 25,
        guidance_scale: 7.5,
        negative_prompt: 'blurry, low quality, misspelled words, distorted text, extra fingers, watermark, nsfw',
      },
    });

    // SDK returns a Blob — convert to base64 data URL
    const arrayBuffer = await imageBlob.arrayBuffer();
    const buffer      = Buffer.from(arrayBuffer);
    const mimeType    = imageBlob.type || 'image/jpeg';
    const dataUrl     = `data:${mimeType};base64,${buffer.toString('base64')}`;

    console.log(`[imageService] ✅ Image generated successfully (${buffer.length} bytes)`);
    return dataUrl;
  } catch (err) {
    console.warn(`[imageService] HuggingFace generation failed: ${err.message}`);
    console.warn('[imageService] Falling back to SVG flyer.');
    return createFallbackFlyer(fallbackData);
  }
}

module.exports = { generateImage };
