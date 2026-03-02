'use client';

import { useState } from 'react';
import { AgentResponse } from '@/app/api/agent/ask/route';

type TabType = 'interlink' | 'audit' | 'develop';

interface TabState {
  prompt: string;
  systemPrompt: string;
  response: AgentResponse | null;
  error: string | null;
  loading: boolean;
}

export default function AgentInterface() {
  const [activeTab, setActiveTab] = useState<TabType>('interlink');
  const [selectedProvider, setSelectedProvider] = useState<'gemini' | 'openai-compatible'>('gemini');

  // Tab-specific state
  const [interlinkTab, setInterlinkTab] = useState<TabState>({
    prompt: '',
    systemPrompt:
      'You are an expert SEO consultant specializing in internal linking strategies. Analyze the provided content and website structure to recommend optimal internal linking patterns that improve SEO performance, user navigation, and information hierarchy.',
    response: null,
    error: null,
    loading: false,
  });

  const [auditTab, setAuditTab] = useState<TabState>({
    prompt: '',
    systemPrompt:
      'You are an expert SEO auditor. Conduct a comprehensive content audit examining the provided content for SEO optimization opportunities, readability, keyword relevance, structure, and overall quality. Provide actionable recommendations for improvement.',
    response: null,
    error: null,
    loading: false,
  });

  const [developTab, setDevelopTab] = useState<TabState>({
    prompt: '',
    systemPrompt:
      'You are an expert content strategist and copywriter. Create compelling, SEO-optimized content that engages readers and converts visitors. Provide well-structured content with proper formatting, keyword integration, and conversion-focused messaging.',
    response: null,
    error: null,
    loading: false,
  });

  // Get current tab state
  const getCurrentTab = (): TabState => {
    switch (activeTab) {
      case 'interlink':
        return interlinkTab;
      case 'audit':
        return auditTab;
      case 'develop':
        return developTab;
    }
  };

  // Set current tab state
  const setCurrentTab = (newState: Partial<TabState>) => {
    const currentState = getCurrentTab();
    const updated = { ...currentState, ...newState };

    switch (activeTab) {
      case 'interlink':
        setInterlinkTab(updated);
        break;
      case 'audit':
        setAuditTab(updated);
        break;
      case 'develop':
        setDevelopTab(updated);
        break;
    }
  };

  const currentTab = getCurrentTab();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentTab({ loading: true, error: null, response: null });

    try {
      const res = await fetch('/api/agent/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: currentTab.prompt,
          systemPrompt: currentTab.systemPrompt,
          provider: selectedProvider,
          maxTokens: 2048,
          temperature: 0.7,
        }),
      });

      const data = (await res.json()) as AgentResponse;
      setCurrentTab({ response: data });

      if (!data.success) {
        setCurrentTab({ error: data.error?.message || 'An error occurred' });
      }
    } catch (err) {
      setCurrentTab({
        error: err instanceof Error ? err.message : 'Failed to send request',
      });
    } finally {
      setCurrentTab({ loading: false });
    }
  };

  const getTabTitle = (tab: TabType): string => {
    switch (tab) {
      case 'interlink':
        return 'Interlink Review';
      case 'audit':
        return 'Content Audit';
      case 'develop':
        return 'Content Development';
    }
  };

  const getTabDescription = (tab: TabType): string => {
    switch (tab) {
      case 'interlink':
        return 'Analyze and optimize internal linking strategies for better SEO and user navigation';
      case 'audit':
        return 'Comprehensive content audit for SEO optimization, readability, and quality improvements';
      case 'develop':
        return 'Create compelling, SEO-optimized content that engages and converts visitors';
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
            AI-powered content optimization and strategy suite
          </p>
          <p className="text-sm text-gray-500">
            Choose a tool below to get started
          </p>
        </header>

        {/* Tab Navigation */}
        <div className="mb-8 border-b border-gray-300">
          <div className="flex flex-wrap gap-2 sm:gap-0">
            {(['interlink', 'audit', 'develop'] as TabType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-4 px-4 sm:px-6 font-semibold transition-all border-b-2 ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <div className="text-sm sm:text-base">{getTabTitle(tab as TabType)}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Section */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Tab Description */}
              <div className="card p-6 bg-blue-50 border border-blue-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  {getTabTitle(activeTab)}
                </h2>
                <p className="text-gray-700">{getTabDescription(activeTab)}</p>
              </div>

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
                  disabled={currentTab.loading}
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
                  value={currentTab.systemPrompt}
                  onChange={(e) => setCurrentTab({ systemPrompt: e.target.value })}
                  placeholder="System context for the AI..."
                  rows={4}
                  className="input-field resize-none"
                  disabled={currentTab.loading}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Define the AI&apos;s role and expertise area
                </p>
              </div>

              {/* User Prompt */}
              <div className="card p-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Your Request
                </label>
                <textarea
                  value={currentTab.prompt}
                  onChange={(e) => setCurrentTab({ prompt: e.target.value })}
                  placeholder={
                    activeTab === 'interlink'
                      ? 'Describe your website structure, target content pages, and interlinking goals...'
                      : activeTab === 'audit'
                        ? 'Paste your content or describe what needs to be audited...'
                        : 'Describe what content you need to create...'
                  }
                  rows={6}
                  className="input-field resize-none"
                  disabled={currentTab.loading}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Be specific and detailed for better recommendations
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={currentTab.loading || !currentTab.prompt.trim()}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {currentTab.loading ? (
                  <>
                    <span className="inline-block animate-spin mr-2">⏳</span>
                    Processing...
                  </>
                ) : (
                  `Analyze with AI`
                )}
              </button>
            </form>
          </div>

          {/* Sidebar - Tips */}
          <aside className="lg:col-span-1">
            <div className="card p-6 space-y-4 sticky top-4">
              <h3 className="font-semibold text-gray-900">Tips for Best Results</h3>
              <ul className="text-sm text-gray-600 space-y-3">
                {activeTab === 'interlink' && (
                  <>
                    <li className="flex gap-2">
                      <span className="text-blue-600">•</span>
                      <span>Include your website structure and page relationships</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-blue-600">•</span>
                      <span>Mention your main content pillars and clusters</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-blue-600">•</span>
                      <span>Provide current interlinking examples if available</span>
                    </li>
                  </>
                )}
                {activeTab === 'audit' && (
                  <>
                    <li className="flex gap-2">
                      <span className="text-blue-600">•</span>
                      <span>Paste your content verbatim for accurate analysis</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-blue-600">•</span>
                      <span>Include target keywords you want to rank for</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-blue-600">•</span>
                      <span>Mention your audience and page purpose</span>
                    </li>
                  </>
                )}
                {activeTab === 'develop' && (
                  <>
                    <li className="flex gap-2">
                      <span className="text-blue-600">•</span>
                      <span>Define your target audience clearly</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-blue-600">•</span>
                      <span>Include target keywords and search intent</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-blue-600">•</span>
                      <span>Specify desired content length and format</span>
                    </li>
                  </>
                )}
              </ul>

              <div className="pt-4 border-t border-gray-200">
                <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
                  Example Queries
                </h4>
                <div className="text-xs text-gray-500 space-y-2">
                  {activeTab === 'interlink' && (
                    <>
                      <p>&quot;Create interlinking for SaaS blog with 20 pillar articles&quot;</p>
                      <p>&quot;Link 15 new blog posts to homepage and service pages&quot;</p>
                    </>
                  )}
                  {activeTab === 'audit' && (
                    <>
                      <p>&quot;Audit this landing page for keyword optimization&quot;</p>
                      <p>&quot;Review this article for technical SEO issues&quot;</p>
                    </>
                  )}
                  {activeTab === 'develop' && (
                    <>
                      <p>&quot;Write 2000-word blog post about SaaS pricing&quot;</p>
                      <p>&quot;Create product page copy for B2B software&quot;</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Response Section */}
        {(currentTab.response || currentTab.error) && (
          <div className="mt-12">
            {currentTab.error && (
              <div className="card p-6 border-2 border-red-200 bg-red-50">
                <h3 className="text-lg font-semibold text-red-900 mb-2">Error</h3>
                <p className="text-red-700">{currentTab.error}</p>
                {currentTab.response?.error?.provider && (
                  <p className="text-sm text-red-600 mt-2">
                    Provider: {currentTab.response.error.provider}
                  </p>
                )}
              </div>
            )}

            {currentTab.response?.success && currentTab.response.data && (
              <div className="card p-6 border-2 border-green-200 bg-green-50">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  AI {getTabTitle(activeTab)} Results
                </h3>

                {/* Main Content */}
                <div className="prose prose-sm max-w-none mb-6 text-gray-800">
                  <div className="whitespace-pre-wrap break-words">
                    {currentTab.response.data.content}
                  </div>
                </div>

                {/* Metadata */}
                <div className="border-t border-gray-300 pt-4 space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Model:</span>
                    <span className="font-mono text-gray-900">{currentTab.response.data.model}</span>
                  </div>
                  {currentTab.response.data.usage && (
                    <>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Total Tokens:</span>
                        <span className="font-mono text-gray-900">
                          {currentTab.response.data.usage.totalTokens || 'N/A'}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* Copy Button */}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(currentTab.response?.data?.content || '');
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

