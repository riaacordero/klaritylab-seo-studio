# klaritylab-seo-studio

A web-based AI agent for automating SEO interlinking and content review/development on marketing websites. Built with Next.js, TypeScript, and powered by Google's Gemini API (with support for other LLM providers).

## Features

- 🤖 **AI-Powered Content Analysis**: Leverage Gemini's advanced language model for intelligent SEO suggestions
- 🔄 **Provider Flexibility**: Switch between Gemini and OpenAI-compatible providers with ease
- 🛡️ **Type-Safe**: Built entirely in TypeScript for robust development
- ⚡ **Fast & Lightweight**: Optimized Next.js app for quick interactions
- 🎨 **Modern UI**: Tailwind CSS styling for a clean, responsive interface
- 📡 **REST API**: Simple POST endpoint for programmatic access

## Project Structure

```
.
├── app/
│   ├── api/
│   │   └── agent/
│   │       └── ask/
│   │           └── route.ts          # Main agent API endpoint
│   ├── layout.tsx                     # Root layout with metadata
│   ├── page.tsx                       # Home page
│   └── globals.css                    # Global styles & Tailwind
├── lib/
│   └── llm/
│       ├── types.ts                   # LLM interface & types
│       ├── gemini.ts                  # Gemini provider implementation
│       ├── openai-compatible.ts       # OpenAI-compatible provider
│       └── provider-manager.ts        # Provider switching logic
├── public/                             # Static assets
├── package.json                        # Dependencies
├── tsconfig.json                       # TypeScript configuration
├── tailwind.config.ts                 # Tailwind CSS config
├── next.config.js                     # Next.js configuration
├── .env.example                        # Example environment variables
└── README.md                           # This file
```

## Getting Started

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm or yarn
- Gemini API key (free from [Google AI Studio](https://aistudio.google.com/app/apikey))

### Installation

1. **Clone the repository:**
   ```bash
   cd /Users/riaacordero/Documents/Dev/klaritylab-seo-studio
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and add your Gemini API key:
   ```
   GEMINI_API_KEY=your_actual_gemini_api_key
   ```

### Development

Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

Build for production:
```bash
npm run build
npm start
```

## API Usage

### Endpoint: POST `/api/agent/ask`

Send a prompt to the SEO agent and receive AI-generated insights.

**Request:**
```bash
curl -X POST http://localhost:3000/api/agent/ask \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Analyze the interlinking strategy for my SEO blog.",
    "systemPrompt": "You are an expert SEO consultant.",
    "maxTokens": 2048,
    "temperature": 0.7,
    "provider": "gemini"
  }'
```

**Request Body Schema:**
```typescript
{
  // Required: The user's question or prompt
  "prompt": string;
  
  // Optional: System context for the AI
  "systemPrompt"?: string;
  
  // Optional: Maximum tokens in response (default: 2048)
  "maxTokens"?: number;
  
  // Optional: Temperature for creativity (0-2, default: 0.7)
  "temperature"?: number;
  
  // Optional: LLM provider to use (default: gemini)
  "provider"?: "gemini" | "openai-compatible";
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "content": "Based on your site structure, I recommend...",
    "model": "gemini-1.5-flash",
    "usage": {
      "promptTokens": 0,
      "completionTokens": 0,
      "totalTokens": 0
    }
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": {
    "message": "Gemini API key not configured",
    "code": "PROVIDER_NOT_CONFIGURED",
    "provider": "gemini"
  }
}
```

### Endpoint: GET `/api/agent/ask`

Check available providers and current configuration.

**Request:**
```bash
curl http://localhost:3000/api/agent/ask
```

**Response:**
```json
{
  "success": true,
  "data": {
    "availableProviders": [
      {
        "type": "gemini",
        "name": "gemini",
        "configured": true
      },
      {
        "type": "openai-compatible",
        "name": "openai-compatible",
        "configured": false
      }
    ],
    "currentProvider": "gemini"
  }
}
```

## Switching LLM Providers

### Using Gemini (Default)

Ensure your `.env.local` has:
```
GEMINI_API_KEY=your_key_here
```

### Using OpenAI or Compatible Provider

Ensure your `.env.local` has:
```
OPENAI_API_KEY=your_key_here
```

Then in your request, specify the provider:
```bash
curl -X POST http://localhost:3000/api/agent/ask \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Your question here",
    "provider": "openai-compatible"
  }'
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes* | API key from [Google AI Studio](https://aistudio.google.com/app/apikey) |
| `OPENAI_API_KEY` | No | API key from [OpenAI](https://platform.openai.com/account/api-keys) |
| `NODE_ENV` | No | Set to `production` for production builds |

*At least one API key is required for the application to function.

## Available Scripts

- `npm run dev` – Start development server (hot reload)
- `npm run build` – Build for production
- `npm start` – Start production server
- `npm run lint` – Run ESLint checks
- `npm run type-check` – Run TypeScript type checking
- `npm run format` – Format code with Prettier
- `npm run format:check` – Check code formatting

## Architecture Overview

### LLM Provider Abstraction

The application uses a provider abstraction pattern to support multiple LLM services:

1. **Interface**: `LLMProvider` defines the contract (sendMessage, sendChat, getName, isConfigured)
2. **Implementations**: GeminiProvider, OpenAICompatibleProvider
3. **Manager**: ProviderManager handles provider creation, switching, and availability checks

Adding a new provider:
1. Create a new class implementing `LLMProvider` in `lib/llm/`
2. Register it in `ProviderManager`
3. Update the `ProviderType` union in `provider-manager.ts`

### API Design

The `/api/agent/ask` endpoint:
- Validates incoming requests
- Manages provider switching
- Forwards requests to the active provider
- Handles errors gracefully with typed responses
- Returns standardized JSON responses

## Security & Best Practices

- **API Keys**: Never commit `.env.local` to version control (it's in `.gitignore`)
- **Server-Side Only**: API keys are handled only on the server, never exposed to the browser
- **Rate Limiting**: Implement rate limiting in production (consider using middleware)
- **Error Messages**: Avoid exposing sensitive details in error responses
- **HTTPS**: Use HTTPS in production to protect API communication

## Troubleshooting

### "Provider not configured" error
- Check that your API key is set correctly in `.env.local`
- Ensure the file is named `.env.local` (not `.env`)
- Restart the dev server after changing environment variables

### "API key not valid" error
- Verify your API key from the provider's dashboard
- Ensure there are no extra spaces or quotes in the `.env.local` file

### Module not found errors
- Run `npm install` to ensure all dependencies are installed
- Delete `node_modules/` and `.next/` then reinstall if issues persist

## Next Steps

- [ ] Build complete frontend UI with multi-step agent workflow
- [ ] Add support for URL crawling and sitemap analysis
- [ ] Implement content recommendation system
- [ ] Add user authentication and API key management
- [ ] Create dashboard for historical analyses
- [ ] Add webhook support for integration with CMS platforms
- [ ] Implement caching and result persistence

## Contributing

Contributions are welcome! Please follow the existing code structure and TypeScript conventions.

## License

MIT

## Support

For issues or questions, please open a GitHub issue or contact the maintainers.
