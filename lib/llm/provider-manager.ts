import { LLMProvider } from './types';
import { GeminiProvider } from './gemini';
import { OpenAICompatibleProvider } from './openai-compatible';

export type ProviderType = 'gemini' | 'openai-compatible';

/**
 * LLM Provider Manager
 * Handles creation and switching between different LLM providers
 */
export class ProviderManager {
  private static instance: ProviderManager;
  private currentProvider: LLMProvider;
  private providers: Map<ProviderType, LLMProvider> = new Map();

  private constructor() {
    // Initialize all available providers
    this.providers.set('gemini', new GeminiProvider());
    this.providers.set(
      'openai-compatible',
      new OpenAICompatibleProvider()
    );

    // Default to Gemini
    this.currentProvider = this.providers.get('gemini')!;
  }

  static getInstance(): ProviderManager {
    if (!ProviderManager.instance) {
      ProviderManager.instance = new ProviderManager();
    }
    return ProviderManager.instance;
  }

  /**
   * Get the current active provider
   */
  getProvider(): LLMProvider {
    return this.currentProvider;
  }

  /**
   * Switch to a different provider
   */
  switchProvider(type: ProviderType): LLMProvider {
    const provider = this.providers.get(type);
    if (!provider) {
      throw new Error(`Unknown provider type: ${type}`);
    }

    if (!provider.isConfigured()) {
      throw new Error(
        `Provider ${type} is not properly configured. Check required environment variables.`
      );
    }

    this.currentProvider = provider;
    return this.currentProvider;
  }

  /**
   * Get all available providers
   */
  getAvailableProviders(): { type: ProviderType; name: string; configured: boolean }[] {
    const providers: { type: ProviderType; name: string; configured: boolean }[] = [];

    this.providers.forEach((provider, type) => {
      providers.push({
        type,
        name: provider.getName(),
        configured: provider.isConfigured(),
      });
    });

    return providers;
  }

  /**
   * Register a custom provider
   */
  registerProvider(type: ProviderType, provider: LLMProvider): void {
    this.providers.set(type, provider);
  }
}

export const providerManager = ProviderManager.getInstance();
