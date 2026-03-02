# Development Guide

## Project Structure Overview

```
klaritylab-seo-studio/
├── app/                          # Next.js 14 App Router
│   ├── api/
│   │   └── agent/
│   │       └── ask/              # Main API endpoint (POST/GET)
│   │           └── route.ts      # Request handling, validation, provider switching
│   ├── layout.tsx                # Root layout with metadata
│   ├── page.tsx                  # Home page (renders AgentInterface)
│   └── globals.css               # Tailwind CSS + global styles
├── components/
│   └── AgentInterface.tsx         # Main React component (client-side form)
├── lib/
│   └── llm/
│       ├── types.ts              # LLMProvider interface, LLMResponse, ProviderError
│       ├── gemini.ts             # GeminiProvider implementation
│       ├── openai-compatible.ts  # OpenAICompatibleProvider implementation
│       └── provider-manager.ts   # ProviderManager (singleton) for provider switching
├── public/                       # Static assets
├── package.json                  # Dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
├── tailwind.config.ts            # Tailwind CSS config
├── postcss.config.js             # PostCSS configuration
├── next.config.js                # Next.js configuration
├── .env.example                  # Example environment variables
├── .gitignore                    # Git ignore rules
├── .eslintrc.json                # ESLint configuration
├── .prettierrc.json              # Prettier configuration
├── README.md                     # Full documentation
├── QUICK_START.md                # Quick start guide
└── DEVELOPMENT.md                # This file
```

## Architecture Patterns

### 1. LLM Provider Abstraction

The application uses a **provider pattern** to support multiple LLM services:

**Interface**: `LLMProvider` (lib/llm/types.ts)
```typescript
interface LLMProvider {
  sendMessage(prompt, options?): Promise<LLMResponse>;
  sendChat(messages, options?): Promise<LLMResponse>;
  getName(): string;
  isConfigured(): boolean;
}
```

**Implementations**:
- `GeminiProvider` - Google Gemini API
- `OpenAICompatibleProvider` - OpenAI API or compatible services

**Manager**: `ProviderManager` (singleton pattern)
- Manages provider instances
- Handles provider switching
- Validates provider configuration

### 2. API Design

**Endpoint**: `POST /api/agent/ask`

Request:
```typescript
interface AgentRequest {
  prompt: string;                    // Required: User question
  systemPrompt?: string;             // Optional: AI context/role
  maxTokens?: number;                // Optional: Response length limit
  temperature?: number;              // Optional: Creativity (0-2)
  provider?: 'gemini' | 'openai-compatible'; // Optional: LLM provider
}
```

Response:
```typescript
interface AgentResponse {
  success: boolean;
  data?: {
    content: string;               // AI-generated response
    model: string;                 // Model name
    usage?: TokenUsage;            // Token count (if available)
  };
  error?: {
    message: string;               // Error description
    code?: string;                 // Error code
    provider?: string;             // Provider name
  };
}
```

### 3. Client-Server Split

**Server-Side (Safe)**:
- API key handling (`lib/llm/gemini.ts`, `openai-compatible.ts`)
- Provider switching (`lib/llm/provider-manager.ts`)
- Request validation (`app/api/agent/ask/route.ts`)
- Never expose API keys to browser

**Client-Side (UI)**:
- Form inputs (`components/AgentInterface.tsx`)
- Response rendering
- Provider selection (determines which server-side provider to use)

## Adding a New LLM Provider

### Step 1: Create Provider Implementation

Create `lib/llm/anthropic.ts`:
```typescript
import { LLMProvider, LLMResponse, LLMMessage, ProviderError } from './types';

export class AnthropicProvider implements LLMProvider {
  private apiKey: string;
  private model: string = 'claude-3-opus-20240229';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.ANTHROPIC_API_KEY || '';
  }

  getName(): string {
    return 'anthropic';
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }

  async sendMessage(
    message: string,
    options?: { systemPrompt?: string; maxTokens?: number; temperature?: number }
  ): Promise<LLMResponse> {
    // Implementation here
  }

  async sendChat(
    messages: LLMMessage[],
    options?: { maxTokens?: number; temperature?: number }
  ): Promise<LLMResponse> {
    // Implementation here
  }
}
```

### Step 2: Register in ProviderManager

Update `lib/llm/provider-manager.ts`:
```typescript
export type ProviderType = 'gemini' | 'openai-compatible' | 'anthropic';

// In ProviderManager constructor:
this.providers.set('anthropic', new AnthropicProvider());
```

### Step 3: Add Environment Variable

Update `.env.example`:
```
ANTHROPIC_API_KEY=your_key_here
```

### Step 4: Test

Update UI dropdown in `components/AgentInterface.tsx` if needed, or the server handles it automatically.

## Running Commands

### Development
```bash
npm run dev              # Start dev server (http://localhost:3000)
```

### Production
```bash
npm run build            # Build for production
npm start               # Start production server
```

### Code Quality
```bash
npm run lint             # Run ESLint
npm run type-check       # TypeScript type checking
npm run format           # Format with Prettier
npm run format:check     # Check formatting without modifying
```

## Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `GEMINI_API_KEY` | Yes* | Google Gemini API key | `AIzaSy...` |
| `OPENAI_API_KEY` | No | OpenAI API key | `sk-...` |
| `ANTHROPIC_API_KEY` | No | Anthropic API key | `sk-ant-...` |
| `NODE_ENV` | No | Environment | `production` |

\* At least one API key is required

## Error Handling

The application handles errors gracefully:

1. **Configuration Errors**: Check if API key is set
2. **Provider Errors**: Custom `ProviderError` class with status codes
3. **API Errors**: Proper HTTP status codes (400, 401, 429, 500)
4. **Client Errors**: User-friendly error messages in UI

## Performance Considerations

1. **Code Splitting**: Next.js automatic code splitting
2. **Server-Side Rendering**: API routes are optimized
3. **Client Components**: Uses `'use client'` directive where needed
4. **Caching**: Leverage Next.js caching (data revalidation)

## Security Best Practices

1. ✅ **API Keys**: Stored in `.env.local` (server-side only)
2. ✅ **Client-Side**: No sensitive data exposed to browser
3. ✅ **Validation**: All requests validated on server
4. ✅ **Error Messages**: Safe error messages (no key leaks)
5. ⚠️ **TODO**: Add rate limiting middleware in production
6. ⚠️ **TODO**: Add authentication if needed
7. ⚠️ **TODO**: HTTPS enforced in production

## Testing Strategy

Current testing setup is minimal. For production, add:

1. **Unit Tests**: Jest for provider logic
2. **API Tests**: Testing API endpoints and responses
3. **E2E Tests**: Playwright for UI interactions
4. **Integration Tests**: Testing provider switching

## Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel                  # Deploy with CLI
```

Set environment variables in Vercel project settings:
- `GEMINI_API_KEY`
- `OPENAI_API_KEY` (optional)

### Self-Hosted

```bash
npm run build
npm start              # Runs on port 3000
```

Use process manager (PM2, systemd) to keep running.

## Common Development Tasks

### Add a New Feature
1. Create component in `components/`
2. Add any new API routes in `app/api/`
3. Update types in `lib/llm/types.ts` if needed
4. Run `npm run build` to verify
5. Test with `npm run dev`

### Modify API Response Format
1. Update `AgentResponse` interface in `app/api/agent/ask/route.ts`
2. Update `AgentInterface.tsx` to handle new format
3. Run build to ensure no type errors

### Add New LLM Provider
1. Follow "Adding a New LLM Provider" section above
2. Add environment variable
3. Register in ProviderManager
4. Test with different requests

## Debugging

### Enable Verbose Logging
Add to `lib/llm/gemini.ts` or `route.ts`:
```typescript
console.error('[Debug]', message);
```

### Browser DevTools
- Network tab: Watch API calls
- Console: Check for client-side errors
- Application tab: Check cookies/storage

### VS Code Debugging
Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js",
      "type": "node",
      "runtimeVersion": "18",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/next",
      "args": ["dev"],
      "console": "integratedTerminal"
    }
  ]
}
```

## Resources

- [Next.js 14 Docs](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Google Gemini API](https://ai.google.dev/)
- [OpenAI API](https://platform.openai.com/docs)

## Support & Contributing

For issues or improvements:
1. Check existing docs
2. Review code comments
3. Test locally before changes
4. Keep code consistent with existing style
5. Update documentation with changes

---

**Last Updated**: March 2, 2026
