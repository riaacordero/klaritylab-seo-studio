'use client';

import { useState } from 'react';
import { AgentResponse } from '@/app/api/agent/ask/route';

export default function AgentInterface() {
  const [prompt, setPrompt] = useState('');
  const [systemPrompt, setSystemPrompt] = useState(
    'You are an expert SEO consultant specializing in interlinking strategies and content optimization.'
  );
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AgentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<'gemini' | 'openai-compatible'>('gemini');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch('/api/agent/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          systemPrompt,
          provider: selectedProvider,
          maxTokens: 2048,
          temperature: 0.7,
        }),
      });

      const data = (await res.json()) as AgentResponse;
      setResponse(data);

      if (!data.success) {
        setError(data.error?.message || 'An error occurred');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            SEO Studio by Klarity Lab
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            AI-powered interlinking and content optimization studio
          </p>
          <p className="text-sm text-gray-500">
            Ask for SEO recommendations, content analysis, interlinking strategies, and more
          </p>
        </header>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Section */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Provider Selector */}
              <div className="card p-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  LLM Provider
                </label>
                <select
                  value={selectedProvider}
                  onChange={(e) =>
                    setSelectedProvider(e.target.value as 'gemini' | 'openai-compatible')
                  }
                  className="input-field"
                  disabled={loading}
                >
                  <option value="gemini">Gemini (Google)</option>
                  <option value="openai-compatible">OpenAI Compatible</option>
                </select>
                <p className="text-xs text-gray-500 mt-2">
                  Make sure the selected provider is configured in your environment
                </p>
              </div>

              {/* System Prompt */}
              <div className="card p-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  System Context
                </label>
                <textarea
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  placeholder="System context for the AI..."
                  rows={4}
                  className="input-field resize-none"
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Define the AI&apos;s role and expertise area
                </p>
              </div>

              {/* User Prompt */}
              <div className="card p-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Your Question or Request
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ask for SEO recommendations, content brief, interlinking strategy, etc..."
                  rows={6}
                  className="input-field resize-none"
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Be specific for better recommendations
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !prompt.trim()}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <span className="inline-block animate-spin mr-2">⏳</span>
                    Processing...
                  </>
                ) : (
                  'Get AI Recommendations'
                )}
              </button>
            </form>
          </div>

          {/* Sidebar - Info */}
          <aside className="lg:col-span-1">
            <div className="card p-6 space-y-4 sticky top-4">
              <h3 className="font-semibold text-gray-900">Quick Tips</h3>
              <ul className="text-sm text-gray-600 space-y-3">
                <li className="flex gap-2">
                  <span className="text-blue-600">•</span>
                  <span>Include your website URL for specific recommendations</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-600">•</span>
                  <span>Describe your target audience and content pillars</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-600">•</span>
                  <span>Ask for both strategic insights and tactical tactics</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-600">•</span>
                  <span>Adjust system context to customize AI behavior</span>
                </li>
              </ul>

              <div className="pt-4 border-t border-gray-200">
                <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
                  Example Queries
                </h4>
                <div className="text-xs text-gray-500 space-y-2">
                  <p>&quot;Create an interlinking strategy for my SaaS blog&quot;</p>
                  <p>&quot;Review this content brief for SEO&quot;</p>
                  <p>&quot;Suggest meta titles and descriptions&quot;</p>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Response Section */}
        {(response || error) && (
          <div className="mt-12">
            {error && (
              <div className="card p-6 border-2 border-red-200 bg-red-50">
                <h3 className="text-lg font-semibold text-red-900 mb-2">Error</h3>
                <p className="text-red-700">{error}</p>
                {response?.error?.provider && (
                  <p className="text-sm text-red-600 mt-2">
                    Provider: {response.error.provider}
                  </p>
                )}
              </div>
            )}

            {response?.success && response.data && (
              <div className="card p-6 border-2 border-green-200 bg-green-50">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  AI Recommendations
                </h3>

                {/* Main Content */}
                <div className="prose prose-sm max-w-none mb-6 text-gray-800">
                  <div className="whitespace-pre-wrap break-words">
                    {response.data.content}
                  </div>
                </div>

                {/* Metadata */}
                <div className="border-t border-gray-300 pt-4 space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Model:</span>
                    <span className="font-mono text-gray-900">{response.data.model}</span>
                  </div>
                  {response.data.usage && (
                    <>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Total Tokens:</span>
                        <span className="font-mono text-gray-900">
                          {response.data.usage.totalTokens || 'N/A'}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* Copy Button */}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(response.data?.content || '');
                    alert('Response copied to clipboard!');
                  }}
                  className="btn-secondary mt-4 w-full text-sm"
                >
                  Copy Response
                </button>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <footer className="text-center mt-16 text-sm text-gray-600">
          <p>
            Built with Next.js, TypeScript, and{' '}
            <span className="font-semibold">Google Gemini API</span>
          </p>
          <p className="mt-2">
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Get your free Gemini API key
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
