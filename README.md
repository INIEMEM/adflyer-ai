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
Open `server/services/researchService.js` (or copywriting/prompt) and replace the OpenAI API call with your preferred LLM. Keep the function signature and return shape the same.

**Image generation:**
Open `server/services/imageService.js` and replace the DALL-E 3 implementation. The function must remain: `async generateImage(prompt) => string (image URL)`

## API Keys needed

- `OPENAI_API_KEY` — for research, copywriting, prompt generation, and image generation (DALL-E 3)
- `IMAGE_GEN_API_KEY` — for alternative image generation providers (optional)

## Tech Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- AI: OpenAI GPT-4o + DALL-E 3 (swappable)
