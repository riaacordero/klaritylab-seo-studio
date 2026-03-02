import { LLMProvider, LLMResponse, LLMMessage, ProviderError } from './types';

/**
 * OpenAI Compatible Provider (Stub for future implementation)
 * Can be used with OpenAI API or any OpenAI-compatible service
 */
export class OpenAICompatibleProvider implements LLMProvider {
  private apiKey: string;
  private model: string;
  private baseUrl: string;

  constructor(
    apiKey?: string,
    model: string = 'gpt-3.5-turbo',
    baseUrl: string = 'https://api.openai.com/v1'
  ) {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY || '';
    this.model = model;
    this.baseUrl = baseUrl;
  }

  getName(): string {
    return 'openai-compatible';
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }

  async sendMessage(
    message: string,
    options?: {
      systemPrompt?: string;
      maxTokens?: number;
      temperature?: number;
    }
  ): Promise<LLMResponse> {
    if (!this.isConfigured()) {
      throw new ProviderError(
        this.getName(),
        'OpenAI API key not configured. Set OPENAI_API_KEY environment variable.'
      );
    }

    const messages: LLMMessage[] = [];

    if (options?.systemPrompt) {
      messages.push({
        role: 'system',
        content: options.systemPrompt,
      });
    }

    messages.push({
      role: 'user',
      content: message,
    });

    return this.sendChat(messages, options);
  }

  async sendChat(
    messages: LLMMessage[],
    options?: {
      maxTokens?: number;
      temperature?: number;
    }
  ): Promise<LLMResponse> {
    if (!this.isConfigured()) {
      throw new ProviderError(
        this.getName(),
        'OpenAI API key not configured. Set OPENAI_API_KEY environment variable.'
      );
    }

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          max_tokens: options?.maxTokens || 2048,
          temperature: options?.temperature ?? 0.7,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new ProviderError(
          this.getName(),
          error.error?.message || 'OpenAI API error',
          response.status
        );
      }

      const data = await response.json();

      return {
        content: data.choices[0]?.message?.content || 'No response generated',
        model: this.model,
        usage: {
          promptTokens: data.usage?.prompt_tokens || 0,
          completionTokens: data.usage?.completion_tokens || 0,
          totalTokens: data.usage?.total_tokens || 0,
        },
      };
    } catch (error) {
      if (error instanceof ProviderError) {
        throw error;
      }

      throw new ProviderError(
        this.getName(),
        `Failed to generate response: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
