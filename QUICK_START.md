# Quick Start Guide

## 1. Get Your Gemini API Key (Free)

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click "Create API Key"
3. Copy your API key

## 2. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local` and paste your API key:
```
GEMINI_API_KEY=your_actual_key_here
```

## 3. Install Dependencies

```bash
npm install
```

## 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 5. Try It Out

### Via Web UI
1. Enter your SEO question or request in the text area
2. Optionally customize the system prompt
3. Click "Get AI Recommendations"
4. View and copy the AI-generated response

### Via API (curl)

```bash
curl -X POST http://localhost:3000/api/agent/ask \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Create an interlinking strategy for a B2B SaaS blog",
    "systemPrompt": "You are an expert SEO consultant",
    "provider": "gemini"
  }'
```

## Next Steps

- [ ] Customize the system prompt for your specific use case
- [ ] Add site configuration (URL, keywords, target audience)
- [ ] Integrate with your CMS or content management system
- [ ] Add more advanced features (URL crawling, sitemap analysis, etc.)
- [ ] Deploy to production (Vercel, Netlify, etc.)

## Troubleshooting

**"Provider not configured" error?**
- Check `.env.local` has the correct API key
- Restart the dev server after adding env variables
- Ensure no extra spaces around the key value

**"No response generated" error?**
- Your prompt might be too vague—be more specific
- Check Gemini API status at [status.ai.google.dev](https://status.ai.google.dev)
- Verify your API key is active

**Want to use a different LLM?**
- Set `OPENAI_API_KEY` in `.env.local`
- In the web UI, select "OpenAI Compatible" from the provider dropdown
- Or pass `"provider": "openai-compatible"` in API requests

## Need Help?

- Read the full [README.md](./README.md) for detailed documentation
- Check [lib/llm](./lib/llm) to understand provider architecture
- Review API route implementation in [app/api/agent/ask](./app/api/agent/ask)
