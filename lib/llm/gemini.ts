import { LLMProvider, LLMResponse, LLMMessage, ProviderError } from './types';

/**
 * Gemini LLM Provider
 * Integrates with Google's Gemini API
 */
export class GeminiProvider implements LLMProvider {
  private apiKey: string;
  private model: string = 'gemini-2.5-flash'; // Latest and best available model
  private readonly availableModels: string[] = [
    'gemini-2.5-flash',
    'gemini-2.5-pro',
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-1.5-pro',
  ];

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY || '';
  }

  getName(): string {
    return 'gemini';
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
        'Gemini API key not configured. Set GEMINI_API_KEY environment variable.'
      );
    }

    try {
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
    } catch (error) {
      if (error instanceof ProviderError) {
        throw error;
      }

      throw new ProviderError(
        this.getName(),
        `Failed to send message: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async sendChat(
    messages: LLMMessage[],
    _options?: {
      maxTokens?: number;
      temperature?: number;
    }
  ): Promise<LLMResponse> {
    if (!this.isConfigured()) {
      throw new ProviderError(
        this.getName(),
        'Gemini API key not configured. Set GEMINI_API_KEY environment variable.'
      );
    }

    try {
      // Dynamically import @google/generative-ai only when needed (server-side)
      const { GoogleGenerativeAI } = await import('@google/generative-ai');

      const client = new GoogleGenerativeAI(this.apiKey);
      
      // Try to find an available model
      let model = null;
      let lastError = null;
      
      for (const modelName of this.availableModels) {
        try {
          const testModel = client.getGenerativeModel({ model: modelName });
          // Test with a simple message to see if the model is actually available
          await testModel.generateContent('test');
          model = testModel;
          this.model = modelName;
          console.log(`[Gemini] Using model: ${modelName}`);
          break;
        } catch (err) {
          lastError = err;
          console.log(`[Gemini] Model ${modelName} not available, trying next...`);
          continue;
        }
      }
      
      if (!model) {
        throw new ProviderError(
          this.getName(),
          `No available Gemini models found. Last error: ${lastError instanceof Error ? lastError.message : 'Unknown'}`
        );
      }

      // Filter out system messages and build the prompt
      const userMessages = messages.filter((msg) => msg.role !== 'system');
      const systemContext = messages
        .filter((msg) => msg.role === 'system')
        .map((msg) => msg.content)
        .join('\n');

      // Build the full prompt with system context if available
      let fullPrompt = '';
      if (systemContext) {
        fullPrompt = `${systemContext}\n\n`;
      }
      fullPrompt += userMessages.map((msg) => msg.content).join('\n');

      const response = await model.generateContent(fullPrompt);

      const text =
        response.response.text() ||
        'No response generated from Gemini API';

      return {
        content: text,
        model: this.model,
        usage: {
          promptTokens: 0, // Gemini API doesn't expose token counts in free tier
          completionTokens: 0,
          totalTokens: 0,
        },
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown error';

      // Log full error for debugging
      console.error('[Gemini API Raw Error]', {
        message,
        fullError: error,
        model: this.model,
      });

      if (message.includes('API_KEY') || message.includes('authentication')) {
        throw new ProviderError(
          this.getName(),
          'Invalid Gemini API key. Check your GEMINI_API_KEY.',
          401
        );
      }

      if (message.includes('quota') || message.includes('rate limit')) {
        throw new ProviderError(
          this.getName(),
          'Gemini API rate limit exceeded. Please try again later.',
          429
        );
      }

      throw new ProviderError(
        this.getName(),
        `Failed to generate response: ${message}`
      );
    }
  }
}
