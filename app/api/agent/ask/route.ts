import { NextRequest, NextResponse } from 'next/server';
import { providerManager } from '@/lib/llm/provider-manager';
import { ProviderError } from '@/lib/llm/types';

/**
 * Request/Response types for the agent API
 */
export interface AgentRequest {
  prompt: string;
  systemPrompt?: string;
  maxTokens?: number;
  temperature?: number;
  provider?: 'gemini' | 'openai-compatible';
}

export interface AgentResponse {
  success: boolean;
  data?: {
    content: string;
    model: string;
    usage?: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    };
  };
  error?: {
    message: string;
    code?: string;
    provider?: string;
  };
}

/**
 * POST /api/agent/ask
 * Main endpoint for the SEO agent
 */
export async function POST(request: NextRequest): Promise<NextResponse<AgentResponse>> {
  try {
    const body = (await request.json()) as AgentRequest;

    // Validate required fields
    if (!body.prompt || typeof body.prompt !== 'string' || body.prompt.trim() === '') {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Missing or invalid "prompt" field',
            code: 'INVALID_REQUEST',
          },
        },
        { status: 400 }
      );
    }

    // Switch provider if requested
    if (body.provider) {
      try {
        providerManager.switchProvider(body.provider);
      } catch (error) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: `Failed to switch provider: ${error instanceof Error ? error.message : 'Unknown error'}`,
              code: 'PROVIDER_ERROR',
              provider: body.provider,
            },
          },
          { status: 400 }
        );
      }
    }

    // Get current provider
    const provider = providerManager.getProvider();

    // Check if provider is configured
    if (!provider.isConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: `Provider ${provider.getName()} is not configured`,
            code: 'PROVIDER_NOT_CONFIGURED',
            provider: provider.getName(),
          },
        },
        { status: 503 }
      );
    }

    // Send request to LLM provider
    const response = await provider.sendMessage(body.prompt, {
      systemPrompt: body.systemPrompt,
      maxTokens: body.maxTokens,
      temperature: body.temperature,
    });

    return NextResponse.json({
      success: true,
      data: {
        content: response.content,
        model: response.model,
        usage: response.usage,
      },
    });
  } catch (error) {
    console.error('[Agent API Error]', error);

    if (error instanceof ProviderError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: error.message,
            code: 'PROVIDER_ERROR',
            provider: error.provider,
          },
        },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error occurred',
          code: 'INTERNAL_ERROR',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/agent/ask
 * Returns available providers and configuration info
 */
export async function GET(): Promise<NextResponse> {
  try {
    const providers = providerManager.getAvailableProviders();

    return NextResponse.json({
      success: true,
      data: {
        availableProviders: providers,
        currentProvider: providerManager.getProvider().getName(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error occurred',
          code: 'INTERNAL_ERROR',
        },
      },
      { status: 500 }
    );
  }
}
