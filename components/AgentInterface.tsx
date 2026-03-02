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

  // Interlink Review specific state
  interface InterlinkState extends TabState {
    mainUrl: string;
    contactUrl: string;
    serviceUrl: string;
    bookingUrl: string;
    blogDirUrl: string;
    pillarPageUrl: string;
    relatedBlogUrls: string;
  }

  const [interlinkTab, setInterlinkTab] = useState<InterlinkState>({
    mainUrl: '',
    contactUrl: '',
    serviceUrl: '',
    bookingUrl: '',
    blogDirUrl: '',
    pillarPageUrl: '',
    relatedBlogUrls: '',
    prompt: '',
    systemPrompt:
      'You are an expert SEO consultant specializing in internal linking strategies. Your task is to analyze website content and generate an interlink strategy table. Rules: 1) Exclude self-referencing links, 2) Only use exact text found in the article, 3) Link only in main body paragraphs, 4) Each page referenced only once per article, 5) Match links contextually. Return as table: Anchor Text | Links to (Page URL only)',
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
  const setCurrentTab = (newState: Partial<TabState> | Partial<InterlinkState>) => {
    const currentState = getCurrentTab();
    const updated = { ...currentState, ...newState };

    switch (activeTab) {
      case 'interlink':
        setInterlinkTab(updated as InterlinkState);
        break;
      case 'audit':
        setAuditTab(updated as TabState);
        break;
      case 'develop':
        setDevelopTab(updated as TabState);
        break;
    }
  };

  const currentTab = getCurrentTab();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentTab({ loading: true, error: null, response: null });

    try {
      let prompt = currentTab.prompt;

      // For interlink tab, build prompt from URLs
      if (activeTab === 'interlink') {
        const interlinkState = interlinkTab as InterlinkState;
        
        // Validate required URLs
        if (
          !interlinkState.mainUrl ||
          !interlinkState.contactUrl ||
          !interlinkState.serviceUrl ||
          !interlinkState.bookingUrl ||
          !interlinkState.blogDirUrl
        ) {
          setCurrentTab({
            loading: false,
            error: 'Please fill in all required URL fields (Main Website, Contact, Service, Booking, and Blog Directory)',
          });
          return;
        }

        // Build the prompt using the provided template
        const blogUrls = interlinkState.relatedBlogUrls
          .split('\n')
          .map((url) => url.trim())
          .filter((url) => url.length > 0)
          .join('\n');

        prompt = `Analyse this: ${interlinkState.mainUrl}

Use the prompt and list of links below excluding the link of the article to be analyzed. 
Provide me with an interlink plan that would demonstrate which anchor texts link to 
contact us [${interlinkState.contactUrl}], service [${interlinkState.serviceUrl}], booking page [${interlinkState.bookingUrl}], blog directory [${interlinkState.blogDirUrl}]${
          interlinkState.pillarPageUrl
            ? `, pillar page [${interlinkState.pillarPageUrl}]`
            : ''
        } and similar blog pages (other blogs under the same child page).

Related blog pages to analyze:
${blogUrls || '(Auto-scan blog directory if left blank)'}

Important: 
- Multiple anchor texts and links possible per blog
- Each page referenced only once
- Only body text anchor text assignments
- Use EXACT texts only, no inferences
- Proper context-based anchor texts
- No self-referencing
- Matches article idea and concept

Return as table format with columns: Article | Page URL | Keyword | Target Page URL`;
      }

      const res = await fetch('/api/agent/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
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

  // Parse interlink table from AI response
  const parseInterlinkTable = (content: string) => {
    const lines = content.split('\n').filter((line) => line.trim());
    const tableLines = lines
      .filter(
        (line) =>
          line.includes('|') &&
          (line.includes('Article') ||
            line.includes('Page URL') ||
            line.includes('Keyword') ||
            line.includes('Target') ||
            !/^[|:\s-]*$/.test(line))
      )
      .slice(0, -5); // Remove footer if present

    if (tableLines.length === 0) return null;

    const rows = tableLines
      .filter((line) => !line.match(/^[|:\s-]+$/))
      .map((line) => {
        const cells = line
          .split('|')
          .map((cell) => cell.trim())
          .filter((cell) => cell);
        return cells;
      });

    return rows.length > 1 ? rows : null;
  };

  // Copy interlink table to clipboard
  const copyInterlinkTable = (content: string) => {
    const tableData = parseInterlinkTable(content);
    if (!tableData) {
      navigator.clipboard.writeText(content);
      alert('Copied response to clipboard!');
      return;
    }

    const tableText = tableData.map((row) => row.join('\t')).join('\n');
    navigator.clipboard.writeText(tableText);
    alert('Interlink table copied to clipboard!');
  };

  // Export interlink table to Excel
  const exportInterlinkTableToExcel = (content: string) => {
    const tableData = parseInterlinkTable(content);
    if (!tableData || tableData.length === 0) {
      alert('No table data found to export');
      return;
    }

    // Create CSV content
    const csvContent = tableData.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `interlink-analysis-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

              {/* Provider Selector - Hide for Interlink */}
              {activeTab !== 'interlink' && (
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
              )}

              {/* Interlink Review Specific Form */}
              {activeTab === 'interlink' && (
                <>
                  {/* Main Website URL */}
                  <div className="card p-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Website URL to be analyzed *
                    </label>
                    <input
                      type="url"
                      value={(interlinkTab as InterlinkState).mainUrl}
                      onChange={(e) => setCurrentTab({ mainUrl: e.target.value })}
                      placeholder="https://example.com/article-name"
                      className="input-field"
                      disabled={currentTab.loading}
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      The main article URL that will be analyzed for interlinking opportunities
                    </p>
                  </div>

                  {/* Support URLs Section */}
                  <div className="card p-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-4">Support URLs *</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-2">
                          Contact Page URL
                        </label>
                        <input
                          type="url"
                          value={(interlinkTab as InterlinkState).contactUrl}
                          onChange={(e) => setCurrentTab({ contactUrl: e.target.value })}
                          placeholder="https://example.com/contact"
                          className="input-field"
                          disabled={currentTab.loading}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-2">
                          Service Page URL
                        </label>
                        <input
                          type="url"
                          value={(interlinkTab as InterlinkState).serviceUrl}
                          onChange={(e) => setCurrentTab({ serviceUrl: e.target.value })}
                          placeholder="https://example.com/services"
                          className="input-field"
                          disabled={currentTab.loading}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-2">
                          Booking Page URL
                        </label>
                        <input
                          type="url"
                          value={(interlinkTab as InterlinkState).bookingUrl}
                          onChange={(e) => setCurrentTab({ bookingUrl: e.target.value })}
                          placeholder="https://example.com/booking"
                          className="input-field"
                          disabled={currentTab.loading}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-2">
                          Blog Directory URL
                        </label>
                        <input
                          type="url"
                          value={(interlinkTab as InterlinkState).blogDirUrl}
                          onChange={(e) => setCurrentTab({ blogDirUrl: e.target.value })}
                          placeholder="https://example.com/blog"
                          className="input-field"
                          disabled={currentTab.loading}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-2">
                          Pillar Page URL (Optional)
                        </label>
                        <input
                          type="url"
                          value={(interlinkTab as InterlinkState).pillarPageUrl}
                          onChange={(e) => setCurrentTab({ pillarPageUrl: e.target.value })}
                          placeholder="https://example.com/pillar-page"
                          className="input-field"
                          disabled={currentTab.loading}
                        />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-4">
                      Enter URLs where this article should link to. Marked with * are required.
                    </p>
                  </div>

                  {/* Related Blog Pages */}
                  <div className="card p-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Related Blog Pages (Optional)
                    </label>
                    <textarea
                      value={(interlinkTab as InterlinkState).relatedBlogUrls}
                      onChange={(e) => setCurrentTab({ relatedBlogUrls: e.target.value })}
                      placeholder={
                        'Add blog URLs (one per line), or leave blank to auto-scan the blog directory\nhttps://example.com/blog/post-1\nhttps://example.com/blog/post-2'
                      }
                      rows={5}
                      className="input-field resize-none"
                      disabled={currentTab.loading}
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      List related blog posts that may benefit from links to this article
                    </p>
                  </div>
                </>
              )}

              {/* Non-Interlink Form Fields */}
              {activeTab !== 'interlink' && (
                <>
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
                        activeTab === 'audit'
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
                </>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={
                  currentTab.loading ||
                  (activeTab === 'interlink'
                    ? !(
                        (interlinkTab as InterlinkState).mainUrl.trim() &&
                        (interlinkTab as InterlinkState).contactUrl.trim() &&
                        (interlinkTab as InterlinkState).serviceUrl.trim() &&
                        (interlinkTab as InterlinkState).bookingUrl.trim() &&
                        (interlinkTab as InterlinkState).blogDirUrl.trim()
                      )
                    : !currentTab.prompt.trim())
                }
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {currentTab.loading ? (
                  <>
                    <span className="inline-block animate-spin mr-2">⏳</span>
                    Processing...
                  </>
                ) : (
                  `${activeTab === 'interlink' ? 'Analyze Interlinking' : 'Analyze with AI'}`
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
                  {activeTab === 'interlink'
                    ? 'Interlink Analysis Results'
                    : `AI ${getTabTitle(activeTab)} Results`}
                </h3>

                {/* Display Interlink Table or Regular Content */}
                {activeTab === 'interlink' ? (
                  <>
                    {parseInterlinkTable(currentTab.response.data.content) ? (
                      <div className="mb-6 overflow-x-auto">
                        <table className="w-full border-collapse text-sm">
                          <thead>
                            <tr className="bg-blue-100">
                              <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                                Article
                              </th>
                              <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                                Page URL
                              </th>
                              <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                                Keyword
                              </th>
                              <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                                Target Page URL
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {parseInterlinkTable(currentTab.response.data.content)
                              ?.slice(1)
                              .map((row, idx) => (
                                <tr
                                  key={idx}
                                  className={
                                    idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                  }
                                >
                                  {row.map((cell, cellIdx) => (
                                    <td
                                      key={cellIdx}
                                      className="border border-gray-300 px-4 py-2"
                                    >
                                      {cell}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="prose prose-sm max-w-none mb-6 text-gray-800">
                        <div className="whitespace-pre-wrap break-words">
                          {currentTab.response.data.content}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="prose prose-sm max-w-none mb-6 text-gray-800">
                    <div className="whitespace-pre-wrap break-words">
                      {currentTab.response.data.content}
                    </div>
                  </div>
                )}

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

                {/* Action Buttons */}
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {activeTab === 'interlink' ? (
                    <>
                      <button
                        onClick={() =>
                          copyInterlinkTable(currentTab.response?.data?.content || '')
                        }
                        className="btn-secondary text-sm"
                      >
                        📋 Copy Table
                      </button>
                      <button
                        onClick={() =>
                          exportInterlinkTableToExcel(
                            currentTab.response?.data?.content || ''
                          )
                        }
                        className="btn-secondary text-sm"
                      >
                        📊 Export CSV
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(
                          currentTab.response?.data?.content || ''
                        );
                        alert('Response copied to clipboard!');
                      }}
                      className="btn-secondary text-sm col-span-2"
                    >
                      Copy Response
                    </button>
                  )}
                </div>
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

