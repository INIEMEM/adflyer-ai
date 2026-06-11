# AdFlyer AI

AI-powered flyer and advertisement generator.

## Setup

1. Clone the repo
2. Run `npm install` in the root, `/client`, and `/server` folders
3. Copy `.env.example` to `.env` inside the `/server` folder
4. Add your API keys to `/server/.env`
5. Run `npm run dev` from the root to start both frontend and backend

## How to swap AI providers

**Research / Copywriting / Prompt services:**
Open `server/services/researchService.js` (or copywriting/prompt) and replace the Gemini API call with your preferred LLM. Keep the function signature and return shape the same.

**Image generation:**
Open `server/services/imageService.js` and replace the Gemini image implementation. The function must remain: `async generateImage(prompt) => string (image URL)`

## API Keys needed

- `GEMINI_API_KEY` — for research, copywriting, and prompt generation using the Gemini API free tier
- `IMAGE_GEN_API_KEY` — for alternative image generation providers (optional; not needed for the Gemini image setup)

## Free API setup

This version does not use OpenAI.

1. Create a free Gemini API key in Google AI Studio.
2. Add it to `server/.env`:

```env
GEMINI_API_KEY=your_google_ai_studio_key_here
GEMINI_MODEL=gemini-3.1-flash-lite
GEMINI_IMAGE_MODEL=gemini-3.1-flash-image
IMAGE_PROVIDER=huggingface
HF_TOKEN=your_huggingface_token_here
HF_MODEL=ByteDance/Hyper-SD
POLLINATIONS_IMAGE_URL=https://image.pollinations.ai
```

Gemini is used for text generation. Image generation tries the configured image provider first, then falls back gracefully.

### Image provider options

Use Hugging Face first:

```env
IMAGE_PROVIDER=huggingface
HF_TOKEN=your_huggingface_token_here
HF_MODEL=ByteDance/Hyper-SD
```

Create a Hugging Face token with Inference Providers permission from your Hugging Face account settings.

Use Pollinations first:

```env
IMAGE_PROVIDER=pollinations
POLLINATIONS_IMAGE_URL=https://image.pollinations.ai
```

Pollinations does not need a key, but it can throttle or return queue-full responses. If Hugging Face, Pollinations, and Gemini image generation all fail, the app returns a local SVG flyer fallback.

## Tech Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- AI: Gemini API text + image generation (swappable)

## Deployment

### Backend on Render

Create a new Render Web Service for the backend.

- Root Directory: `server`
- Build Command: `npm install`
- Start Command: `npm start`

Add these Render environment variables:

- `GEMINI_API_KEY`: your Google AI Studio Gemini API key
- `GEMINI_MODEL`: `gemini-3.1-flash-lite`
- `GEMINI_IMAGE_MODEL`: `gemini-3.1-flash-image`
- `IMAGE_PROVIDER`: `huggingface`
- `HF_TOKEN`: your Hugging Face token
- `HF_MODEL`: `ByteDance/Hyper-SD`
- `POLLINATIONS_IMAGE_URL`: `https://image.pollinations.ai`
- `CLIENT_URL`: your deployed Vercel frontend URL, for example `https://your-app.vercel.app`

After deployment, your backend URL will look like:

```text
https://your-render-service.onrender.com
```

Check the backend with:

```text
https://your-render-service.onrender.com/api/health
```

### Frontend on Vercel

Create a new Vercel project for the frontend.

- Root Directory: `client`
- Framework Preset: Vite
- Build Command: `npm run build`
- Output Directory: `dist`

Add this Vercel environment variable:

- `VITE_API_URL`: your Render backend URL, for example `https://your-render-service.onrender.com`

Redeploy the Vercel app after adding `VITE_API_URL`.
