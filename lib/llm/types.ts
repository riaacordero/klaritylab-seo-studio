/**
 * LLM Provider Interface & Types
 * Defines the contract for all LLM providers (Gemini, OpenAI, etc.)
 */

export interface LLMMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface LLMResponse {
  content: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface LLMProvider {
  /**
   * Send a message to the LLM and get a response
   */
  sendMessage(
    message: string,
    options?: {
      systemPrompt?: string;
      maxTokens?: number;
      temperature?: number;
    }
  ): Promise<LLMResponse>;

  /**
   * Send a conversation with multiple messages
   */
  sendChat(
    messages: LLMMessage[],
    options?: {
      maxTokens?: number;
      temperature?: number;
    }
  ): Promise<LLMResponse>;

  /**
   * Get provider name
   */
  getName(): string;

  /**
   * Check if provider is properly configured
   */
  isConfigured(): boolean;
}

export class ProviderError extends Error {
  constructor(
    public provider: string,
    message: string,
    public statusCode?: number
  ) {
    super(`[${provider}] ${message}`);
    this.name = 'ProviderError';
  }
}
