// TO SWAP IMAGE PROVIDER: replace the implementation below.
// Keep the function signature: async generateImage(prompt) => imageUrl string

const {
  GEMINI_API_KEY,
  GEMINI_IMAGE_MODEL,
  IMAGE_PROVIDER,
  HF_TOKEN,
  HF_MODEL,
  POLLINATIONS_IMAGE_URL,
} = require('../config/env');

const IMAGE_PROVIDERS = {
  GEMINI: 'gemini',
  HUGGINGFACE: 'huggingface',
  POLLINATIONS: 'pollinations',
};

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
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  });

  if (current) lines.push(current);
  return lines.slice(0, maxLines);
}

function createFallbackFlyer({ businessInfo = {}, copyResult = {}, researchResult = {} }) {
  const businessName = escapeXml(businessInfo.businessName || 'Your Business');
  const businessType = escapeXml(businessInfo.businessType || 'Premium Service');
  const headline = wrapText(copyResult.headline || businessName, 24, 3).map(escapeXml);
  const adText = wrapText(copyResult.adText || researchResult.advertisingStyle || '', 42, 4).map(escapeXml);
  const offer = escapeXml(businessInfo.specialOffer || copyResult.callToAction || 'Limited Offer');
  const contact = escapeXml(businessInfo.contactInfo || 'Contact us today');
  const cta = escapeXml(copyResult.callToAction || 'Book Now');
  const target = escapeXml(businessInfo.targetLocation || '');
  const headlineStart = 212;
  const adStart = 484;

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
  <text x="118" y="146" fill="#fbbf24" font-family="Arial, Helvetica, sans-serif" font-size="36" font-weight="800" letter-spacing="2">${businessName}</text>
  <text x="118" y="196" fill="#f9fafb" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="600">${businessType}${target ? ` • ${target}` : ''}</text>

  <g>
    ${headline.map((line, index) => `<text x="118" y="${headlineStart + index * 66}" fill="#111827" font-family="Arial, Helvetica, sans-serif" font-size="58" font-weight="900">${line}</text>`).join('')}
  </g>

  <rect x="118" y="392" width="788" height="90" rx="45" fill="#f59e0b"/>
  <text x="512" y="451" fill="#111827" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="900" text-anchor="middle">${offer}</text>

  <g>
    ${adText.map((line, index) => `<text x="118" y="${adStart + index * 42}" fill="#374151" font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="600">${line}</text>`).join('')}
  </g>

  <rect x="118" y="710" width="788" height="104" rx="26" fill="#111827"/>
  <text x="512" y="777" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-size="42" font-weight="900" text-anchor="middle">${cta}</text>

  <rect x="118" y="846" width="788" height="64" rx="32" fill="#e5e7eb"/>
  <text x="512" y="888" fill="#111827" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="800" text-anchor="middle">${contact}</text>
</svg>`;

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

async function responseToDataUrl(response, providerName) {
  const contentType = response.headers.get('content-type') || '';

  if (!response.ok) {
    const message = contentType.includes('application/json')
      ? JSON.stringify(await response.json().catch(() => ({})))
      : await response.text().catch(() => `${providerName} returned ${response.status}`);
    throw new Error(`${providerName} returned ${response.status}: ${message}`);
  }

  if (!contentType.startsWith('image/')) {
    const text = await response.text().catch(() => '');
    throw new Error(`${providerName} returned ${contentType || 'non-image response'}: ${text.slice(0, 220)}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  return `data:${contentType};base64,${buffer.toString('base64')}`;
}

async function generateWithHuggingFace(imagePrompt) {
  if (!HF_TOKEN) {
    throw new Error('HF_TOKEN is not set.');
  }

  const modelPath = HF_MODEL.split('/').map(encodeURIComponent).join('/');
  const endpoint = `https://api-inference.huggingface.co/models/${modelPath}`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${HF_TOKEN}`,
      'Content-Type': 'application/json',
      Accept: 'image/png',
    },
    body: JSON.stringify({
      inputs: imagePrompt,
      parameters: {
        width: 1024,
        height: 1024,
        num_inference_steps: 8,
        guidance_scale: 7.5,
        seed: Math.floor(Math.random() * 1_000_000_000),
        negative_prompt: 'blurry, low quality, misspelled words, distorted text, extra fingers, watermark',
      },
      options: {
        wait_for_model: true,
      },
    }),
  });

  return responseToDataUrl(response, 'Hugging Face');
}

async function generateWithPollinations(imagePrompt) {
  const encodedPrompt = encodeURIComponent(`${imagePrompt}

Unique layout, varied composition, no watermark, polished commercial flyer, readable headline.`);
  const seed = Math.floor(Math.random() * 1_000_000_000);
  const baseUrl = POLLINATIONS_IMAGE_URL.replace(/\/$/, '');
  const response = await fetch(`${baseUrl}/prompt/${encodedPrompt}?width=1024&height=1024&model=flux&nologo=true&enhance=true&seed=${seed}`);

  return responseToDataUrl(response, 'Pollinations');
}

async function generateWithGemini(imagePrompt) {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set.');
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1/models/${GEMINI_IMAGE_MODEL}:generateContent`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': GEMINI_API_KEY,
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: imagePrompt }],
        },
      ],
    }),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = payload.error?.message || `Gemini image API returned ${response.status}`;
    throw new Error(message);
  }

  const imagePart = payload.candidates?.[0]?.content?.parts?.find(part => part.inlineData?.data);

  if (!imagePart) {
    throw new Error('Gemini image API did not return image data.');
  }

  const mimeType = imagePart.inlineData.mimeType || 'image/png';
  return `data:${mimeType};base64,${imagePart.inlineData.data}`;
}

/**
 * Generates an advertising flyer image.
 * Tries the configured free/low-cost provider first, then falls back gracefully.
 * @param {string} prompt - The detailed image generation prompt
 * @returns {string} imageUrl
 */
async function generateImage(prompt, fallbackData = {}) {
  const imagePrompt = `${prompt}

Do not include fake brand names. Make this look like a polished, modern advertisement flyer.`;
  const preferredProvider = IMAGE_PROVIDER.toLowerCase();
  const providerOrder = [
    preferredProvider,
    IMAGE_PROVIDERS.HUGGINGFACE,
    IMAGE_PROVIDERS.POLLINATIONS,
    IMAGE_PROVIDERS.GEMINI,
  ].filter((provider, index, providers) => provider && providers.indexOf(provider) === index);

  for (const provider of providerOrder) {
    try {
      if (provider === IMAGE_PROVIDERS.HUGGINGFACE) {
        return await generateWithHuggingFace(imagePrompt);
      }

      if (provider === IMAGE_PROVIDERS.POLLINATIONS) {
        return await generateWithPollinations(imagePrompt);
      }

      if (provider === IMAGE_PROVIDERS.GEMINI) {
        return await generateWithGemini(imagePrompt);
      }
    } catch (error) {
      console.warn(`[Image provider failed: ${provider}] ${error.message}`);
    }
  }

  console.warn('[Image fallback] All image providers failed. Returning local SVG flyer.');
  return createFallbackFlyer(fallbackData);
}

module.exports = { generateImage };
