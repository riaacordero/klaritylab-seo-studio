'use client';

import { useState } from 'react';
import { AgentResponse } from '@/app/api/agent/ask/route';

type TabType = 'interlink' | 'audit' | 'develop';
type DevelopmentSubtab = 'brief' | 'content' | 'copywriting';
type CopywritingType = 'blog' | 'homepage' | 'essential' | 'faq';

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

  // Content Audit specific state
  interface AuditState extends TabState {
    websiteUrl: string;
  }

  // Content Development specific state
  interface DevelopmentState extends TabState {
    subtab: DevelopmentSubtab;
    topicalMapFile: File | null;
    topicalMapText: string;
    pageTitles: string;
    clusterKeywords: string;
    selectedTopic: string;
    contentBrief: string;
    copywritingType: CopywritingType;
    websiteUrl: string;
    competitorUrl: string;
    serpQuestionsFile: File | null;
    audienceAnalysisFile: File | null;
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

  const [auditTab, setAuditTab] = useState<AuditState>({
    websiteUrl: '',
    prompt: '',
    systemPrompt:
      'You are an expert content compliance auditor and SEO specialist. Analyze the provided website URL and its content for: 1) Compliance with current standards (especially critical for finance and health content), 2) Content freshness and relevance (identify outdated information), 3) Content intent (navigational, commercial, transactional, or informational), 4) Content type (evergreen vs. time-specific like sales, promos, trends). For each page/article, determine its status: OK/Compliant, Needs Update (outdated or non-compliant), or Subject for Removal (time-specific content that has expired). Provide specific recommendations for updates or removal. Examples: Finance - JobKeeper ended March 28, 2021, so 2026 references should be removed. Health - outdated medical recommendations should be updated. Return results as a structured audit report with Status and Recommendations columns.',
    response: null,
    error: null,
    loading: false,
  });

  const [developTab, setDevelopTab] = useState<DevelopmentState>({
    subtab: 'brief',
    topicalMapFile: null,
    topicalMapText: '',
    pageTitles: '',
    clusterKeywords: '',
    selectedTopic: '',
    contentBrief: '',
    copywritingType: 'blog',
    websiteUrl: '',
    competitorUrl: '',
    serpQuestionsFile: null,
    audienceAnalysisFile: null,
    prompt: '',
    systemPrompt:
      'You are an SEO copywriter with great knowledge about writing content briefs for topical experts. Review the provided topical map and supporting information to develop comprehensive content briefs that allow topical experts to be interviewed and integrate expert-level knowledge for AI-assisted content development.',
    response: null,
    error: null,
    loading: false,
  });

  // Get current tab state
  const getCurrentTab = (): TabState | InterlinkState | AuditState | DevelopmentState => {
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
  const setCurrentTab = (newState: Partial<TabState> | Partial<InterlinkState> | Partial<AuditState> | Partial<DevelopmentState>) => {
    const currentState = getCurrentTab();
    const updated = { ...currentState, ...newState };

    switch (activeTab) {
      case 'interlink':
        setInterlinkTab(updated as InterlinkState);
        break;
      case 'audit':
        setAuditTab(updated as AuditState);
        break;
      case 'develop':
        setDevelopTab(updated as DevelopmentState);
        break;
    }
  };

  const currentTab = getCurrentTab();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentTab({ loading: true, error: null, response: null });

    try {
      let prompt = currentTab.prompt;
      let maxTokens = 4096;

      // For interlink tab, build prompt from URLs
      if (activeTab === 'interlink') {
        const interlinkState = interlinkTab as InterlinkState;
        maxTokens = 2048;
        
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

      // For audit tab, build prompt from website URL
      if (activeTab === 'audit') {
        const auditState = auditTab as AuditState;

        // Validate required URL
        if (!auditState.websiteUrl || !auditState.websiteUrl.trim()) {
          setCurrentTab({
            loading: false,
            error: 'Please fill in the Website URL field',
          });
          return;
        }

        prompt = `Conduct a comprehensive content audit for: ${auditState.websiteUrl}

Analyze all pages and articles at this website for:

1. COMPLIANCE & FRESHNESS:
   - Identify outdated information (especially critical for finance and health content)
   - Check compliance with current standards and regulations
   - Examples: Finance content referencing JobKeeper (ended March 28, 2021) in 2026 should be removed; Health content with outdated medical advice should be updated

2. CONTENT INTENT:
   - Determine whether each article is: Navigational, Commercial, Transactional, or Informational

3. CONTENT TYPE:
   - Classify each article as: Evergreen (always relevant) or Time-Specific (sales, promos, trends, limited-time offers)

4. FOR EACH PAGE/ARTICLE, ASSIGN STATUS:
   - OK/Compliant: Content is current and meets standards
   - Needs Update: Content is outdated, non-compliant, or has outdated information mixed with relevant content
   - Subject for Removal: Time-specific content that has expired, promotional content for ended offers, or completely outdated information

5. RECOMMENDATIONS:
   - For OK Status: "None"
   - For Needs Update: Specific recommendations for what should be updated and why
   - For Subject for Removal: "Remove" with explanation of why it should be removed

Return results as a structured audit report with columns: Page/Article | URL | Content Intent | Content Type | Status | Recommendations`;
      }

      // For development tab, build prompt based on subtab
      if (activeTab === 'develop') {
        const devState = developTab as DevelopmentState;

        if (devState.subtab === 'brief') {
          // Content Brief Generation
          maxTokens = 3000;

          if (!devState.topicalMapText && !devState.topicalMapFile) {
            setCurrentTab({
              loading: false,
              error: 'Please upload a topical map document',
            });
            return;
          }

          if (!devState.pageTitles.trim()) {
            setCurrentTab({
              loading: false,
              error: 'Please enter at least one page title to be built',
            });
            return;
          }

          if (!devState.clusterKeywords.trim()) {
            setCurrentTab({
              loading: false,
              error: 'Please enter cluster keywords',
            });
            return;
          }

          const topicsText = devState.pageTitles
            .split('\n')
            .map((title) => title.trim())
            .filter((title) => title)
            .map((title, index) => `${index + 1}. ${title}`)
            .join('\n');

          prompt = `You are an SEO copywriter with great knowledge about writing content briefs for topical experts for the website. Review the attached document for the topical map. We are building blog pages for:

${topicsText}

Let's start with the first topic. For this topic, create a Content Brief that allows us to interview topical experts and generate expert-level knowledge, which can then be integrated into AI to develop the article.

The Content Brief needs:

- To provide an emotional hook that is client-centric based on the company
- To provide an outline for the article that answers the Hook and deals with potential client issues
- A list of interview questions for each point to collect expert knowledge
- Image suggestions for the featured image for the Article
- Generate a creative, SEO-friendly, and keyword-rich title that's related to the topic and aligned with the tone of voice of the brand

Topical Map Context:
${devState.topicalMapText || '[Topical map file uploaded]'}

Cluster Keywords: ${devState.clusterKeywords}`;
        } else if (devState.subtab === 'content') {
          // Content Development from Brief
          maxTokens = 5000;

          if (!devState.contentBrief.trim()) {
            setCurrentTab({
              loading: false,
              error: 'Please paste the content brief or go back to the "Content Brief" tab to generate one',
            });
            return;
          }

          prompt = `Using the following content brief, develop a comprehensive, well-structured article that:

1. Follows the brief's outline and structure
2. Incorporates the emotional hook for the target audience
3. Answers all questions posed in the brief
4. Integrates expert knowledge and insights
5. Is SEO-optimized with keyword integration
6. Includes proper headings, subheadings, and formatting
7. Has a compelling introduction and conclusion
8. Includes a call-to-action if appropriate

Content Brief:
${devState.contentBrief}`;
        } else if (devState.subtab === 'copywriting') {
          // Copywriting Section
          maxTokens = 5000;

          if (devState.copywritingType === 'blog') {
            // Blog Article Copywriting
            if (!devState.contentBrief.trim()) {
              setCurrentTab({
                loading: false,
                error: 'Please provide a content brief for blog article generation',
              });
              return;
            }

            const systemPrompt = `You are an expert SEO copywriter specializing in creating optimized blog content that ranks for AI Overviews and adheres to E-E-A-T principles.

Your task is to write a comprehensive blog article based on the provided content brief. Follow these guidelines:

STRUCTURE & OPENING:
- Create a compelling opening that hooks the reader within the first 50 words
- Address the reader's intent and emotional motivation
- Include relevant context about why this topic matters

E-E-A-T IMPLEMENTATION:
- Expertise: Demonstrate deep knowledge of the subject matter
- Experience: Include practical examples and real-world applications
- Authoritativeness: Reference credible sources and industry standards
- Trustworthiness: Be transparent about limitations and provide citations

CONTENT GUIDELINES:
- Use clear, scannable formatting with descriptive H2 and H3 headings
- Break complex concepts into digestible sections
- Use bullet points and lists where appropriate
- Include specific examples and case studies
- Address common questions and misconceptions
- Provide actionable takeaways

AI OVERVIEW OPTIMIZATION:
- Structure content with clear answers to user questions
- Use structured data where relevant
- Include data-backed claims and statistics
- Provide comprehensive coverage of the topic
- Use natural language that aligns with how people search

CITATIONS & SOURCES:
- Include in-text citations for claims and statistics
- Provide a "Sources" or "References" section at the end
- Link to authoritative external sources
- Use proper markdown formatting for links

CALL-TO-ACTION:
- End with a relevant CTA that matches the content intent
- Keep CTAs subtle and value-focused

Write in a professional yet conversational tone appropriate for the target audience.`;

            setCurrentTab({ systemPrompt });
            prompt = `Create a comprehensive blog article based on this content brief:

${devState.contentBrief}`;
          } else if (devState.copywritingType === 'faq') {
            // FAQ Copywriting
            if (!devState.serpQuestionsFile || !devState.audienceAnalysisFile) {
              setCurrentTab({
                loading: false,
                error: 'Please upload both SERP questions and audience analysis files',
              });
              return;
            }

            const systemPrompt = `You are a CX Research Analyst and Content Strategist specializing in creating FAQ content optimized for AI Overviews.

Your task is to create a comprehensive FAQ article that addresses customer questions, provides expert answers, and ranks for AI Overviews.

FAQ STRUCTURE GUIDELINES:
- Use MECE (Mutually Exclusive, Collectively Exhaustive) framework
- Group related questions into logical sections
- Use clear H2 headings for question categories
- Use H3 headings or strong text for individual questions

QUESTION HANDLING:
- Reframe and expand questions for clarity and searchability
- Address the intent behind each question
- Include variations of common questions
- Expand brief SERP questions with context

ANSWER QUALITY:
- Provide comprehensive answers (150-300 words per question)
- Start with a direct, clear answer (first 1-2 sentences)
- Support with explanations, examples, and details
- Use bullet points for lists within answers
- Include specific data points and statistics

AI OVERVIEW OPTIMIZATION:
- Structure answers with clear topic sentences
- Use natural language that matches search queries
- Include relevant keywords naturally
- Provide complete information in the answer itself

AUDIENCE ALIGNMENT:
- Tailor technical depth to audience knowledge level
- Address pain points identified in audience analysis
- Use terminology familiar to your audience
- Anticipate follow-up questions

CITATIONS & SOURCES:
- Include credible source references
- Link to authoritative resources
- Use inline citations where appropriate
- Add a "Sources" section at the end

FORMATTING:
- Use markdown for proper formatting
- Bold key terms and important phrases
- Use italics for emphasis
- Include section breaks for readability

Write in a tone that builds trust and demonstrates expertise appropriate for the audience.`;

            setCurrentTab({ systemPrompt });
            prompt = `Create a comprehensive FAQ article based on the SERP questions and audience analysis provided. Structure the FAQ using MECE principles and optimize for AI Overviews.

[Audience analysis and SERP questions files provided above]`;
          } else if (devState.copywritingType === 'homepage') {
            // Homepage Copywriting
            if (!devState.websiteUrl.trim()) {
              setCurrentTab({
                loading: false,
                error: 'Please provide your website URL for homepage copy generation',
              });
              return;
            }

            prompt = `Create compelling homepage copy for: ${devState.websiteUrl}${
              devState.competitorUrl ? `\n\nFor reference, analyze this competitor homepage: ${devState.competitorUrl}` : ''
            }

The homepage copy should:
1. Establish immediate value proposition within the first section
2. Address the primary customer pain points
3. Highlight unique selling propositions
4. Include trust signals and social proof
5. Use persuasive copywriting techniques
6. Include clear calls-to-action
7. Follow conversion optimization best practices
8. Be optimized for mobile viewing

Structure the copy with clear sections and compelling headlines.`;
          } else {
            // Essential Pages Copywriting
            if (!devState.websiteUrl.trim()) {
              setCurrentTab({
                loading: false,
                error: 'Please provide your website URL for essential page copy generation',
              });
              return;
            }

            prompt = `Create content for essential pages on: ${devState.websiteUrl}${
              devState.competitorUrl ? `\n\nFor reference, analyze this competitor website: ${devState.competitorUrl}` : ''
            }

Generate copy for these essential pages:
1. About Us - Company story, mission, values, team expertise
2. Services/Products - Clear descriptions, benefits, differentiators
3. Contact Us - Clear information, multiple contact methods, response expectations

Each section should:
- Be comprehensive but scannable
- Address customer needs and questions
- Include trust-building elements
- Use clear calls-to-action
- Optimize for both users and search engines
- Follow conversion best practices

Provide detailed copy for each essential page section.`;
          }
        }
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
          maxTokens: maxTokens,
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
        const devState = developTab as DevelopmentState;
        if (devState.subtab === 'brief') {
          return 'Generate content briefs for topical experts to develop high-quality, expert-driven content';
        } else if (devState.subtab === 'content') {
          return 'Develop full articles from content briefs with expert knowledge integration';
        } else {
          return 'Professional copywriting for blogs, homepages, essential pages, and FAQs optimized for AI Overviews and E-E-A-T';
        }
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
        <header className="text-center mb-4">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            SEO Studio by Klarity Lab
          </h1>
          <p className="text-lg text-gray-600">
            AI-powered content optimization and strategy suite
          </p>
        </header>

        {/* LLM Provider Selector */}
        <div className="mb-8 flex justify-center">
          <div className="w-full sm:w-64">
            <div className="card p-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select your AI Model
              </label>
              <select
                value={selectedProvider}
                onChange={(e) =>
                  setSelectedProvider(e.target.value as 'gemini' | 'openai-compatible')
                }
                className="input-field text-sm"
                disabled={currentTab.loading}
              >
                <option value="gemini">Gemini (Google)</option>
                <option value="openai-compatible">OpenAI Compatible</option>
              </select>
            </div>
          </div>
        </div>

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
                    : 'border-transparent text-gray-600'
                }`}
                style={
                  activeTab !== tab
                    ? {
                        transition: 'background-color 200ms',
                        backgroundColor: 'transparent',
                      }
                    : undefined
                }
                onMouseEnter={(e) => {
                  if (activeTab !== tab) {
                    e.currentTarget.style.backgroundColor = 'rgba(0, 101, 244, 0.2)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
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

              {/* Content Audit Specific Form */}
              {activeTab === 'audit' && (
                <>
                  {/* Website URL */}
                  <div className="card p-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Website URL to be analysed *
                    </label>
                    <input
                      type="url"
                      value={(auditTab as AuditState).websiteUrl}
                      onChange={(e) => setCurrentTab({ websiteUrl: e.target.value })}
                      placeholder="https://example.com"
                      className="input-field"
                      disabled={currentTab.loading}
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Enter the website URL to conduct a comprehensive content audit
                    </p>
                  </div>

                  {/* Audit Description */}
                  <div className="card p-6 bg-purple-50 border border-purple-200">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">What This Analyzes</h3>
                    <ul className="text-xs text-gray-700 space-y-2">
                      <li>✓ <strong>Compliance & Freshness:</strong> Outdated information, especially in finance/health</li>
                      <li>✓ <strong>Content Intent:</strong> Navigational, Commercial, Transactional, or Informational</li>
                      <li>✓ <strong>Content Type:</strong> Evergreen vs. Time-Specific (sales, promos, trends)</li>
                      <li>✓ <strong>Status Assignment:</strong> OK/Compliant, Needs Update, or Subject for Removal</li>
                      <li>✓ <strong>Recommendations:</strong> Specific actions for each content status</li>
                    </ul>
                  </div>
                </>
              )}

              {/* Content Development Form */}
              {activeTab === 'develop' && (
                <>
                  {/* Development Subtabs */}
                  <div className="card p-4 border-b-2 border-gray-200 bg-gray-50">
                    <div className="flex gap-2 sm:gap-0">
                      {(['brief', 'content', 'copywriting'] as DevelopmentSubtab[]).map((subtab) => (
                        <button
                          key={subtab}
                          type="button"
                          onClick={() => {
                            setCurrentTab({ subtab });
                          }}
                          disabled={currentTab.loading}
                          className={`flex-1 py-3 px-4 font-semibold text-sm transition-all border-b-2 ${
                            (developTab as DevelopmentState).subtab === subtab
                              ? 'border-blue-600 text-blue-600 bg-white'
                              : 'border-transparent text-gray-600'
                          }`}
                          style={
                            (developTab as DevelopmentState).subtab !== subtab
                              ? {
                                  transition: 'background-color 200ms',
                                  backgroundColor: 'transparent',
                                }
                              : undefined
                          }
                          onMouseEnter={(e) => {
                            if ((developTab as DevelopmentState).subtab !== subtab) {
                              e.currentTarget.style.backgroundColor = 'rgba(0, 101, 244, 0.2)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if ((developTab as DevelopmentState).subtab !== subtab) {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }
                          }}
                        >
                          {subtab === 'brief' ? 'Content Brief' : subtab === 'content' ? 'Develop Content' : 'Copywriting'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Content Brief Subtab */}
                  {(developTab as DevelopmentState).subtab === 'brief' && (
                    <>
                      {/* Topical Map Upload */}
                      <div className="card p-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Topical Map Document *
                        </label>
                        <div className="flex gap-3 items-center">
                          <input
                            type="file"
                            id="topical-map-file"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  const text = event.target?.result as string;
                                  setCurrentTab({ topicalMapFile: file, topicalMapText: text });
                                };
                                reader.readAsText(file);
                              }
                            }}
                            accept=".txt,.pdf,.doc,.docx"
                            disabled={currentTab.loading}
                            className="hidden"
                          />
                          <label
                            htmlFor="topical-map-file"
                            className="cursor-pointer px-4 py-2 bg-blue-100 text-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                            style={{ backgroundColor: '#dbeafe' }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = 'rgba(0, 101, 244, 0.2)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#dbeafe';
                            }}
                          >
                            {(developTab as DevelopmentState).topicalMapFile
                              ? `✓ ${(developTab as DevelopmentState).topicalMapFile?.name}`
                              : 'Choose File'}
                          </label>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Upload your topical map document (TXT, PDF, or DOC)
                        </p>
                      </div>

                      {/* Or Paste Topical Map */}
                      <div className="card p-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Or Paste Topical Map
                        </label>
                        <textarea
                          value={(developTab as DevelopmentState).topicalMapText}
                          onChange={(e) => setCurrentTab({ topicalMapText: e.target.value })}
                          placeholder="Paste your topical map content here..."
                          rows={6}
                          className="input-field resize-none"
                          disabled={currentTab.loading}
                        />
                        <p className="text-xs text-gray-500 mt-2">
                          Or paste the content directly if you prefer not to upload a file
                        </p>
                      </div>

                      {/* Page Titles to Build */}
                      <div className="card p-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Page Titles to be Built *
                        </label>
                        <textarea
                          value={(developTab as DevelopmentState).pageTitles}
                          onChange={(e) => setCurrentTab({ pageTitles: e.target.value })}
                          placeholder={
                            'Enter the titles of pages you want to build\n\nExamples:\nBest Digital Marketing Strategies for 2026\nHow to Implement SEO in Your Business\nContent Marketing Tips for Startups'
                          }
                          rows={4}
                          className="input-field resize-none"
                          disabled={currentTab.loading}
                        />
                        <p className="text-xs text-gray-500 mt-2">
                          Enter one title per line. The first title will be used to generate the content brief.
                        </p>
                      </div>

                      {/* Cluster Keywords */}
                      <div className="card p-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Cluster Keywords *
                        </label>
                        <textarea
                          value={(developTab as DevelopmentState).clusterKeywords}
                          onChange={(e) => setCurrentTab({ clusterKeywords: e.target.value })}
                          placeholder={
                            'Enter cluster keywords related to your topic\n\nExamples:\ndigital marketing, content strategy, SEO, social media marketing, email marketing'
                          }
                          rows={3}
                          className="input-field resize-none"
                          disabled={currentTab.loading}
                        />
                        <p className="text-xs text-gray-500 mt-2">
                          Enter keywords separated by commas or line breaks
                        </p>
                      </div>
                    </>
                  )}

                  {/* Develop Content Subtab */}
                  {(developTab as DevelopmentState).subtab === 'content' && (
                    <>
                      {/* Content Brief Input */}
                      <div className="card p-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Content Brief *
                        </label>
                        <textarea
                          value={(developTab as DevelopmentState).contentBrief}
                          onChange={(e) => setCurrentTab({ contentBrief: e.target.value })}
                          placeholder={
                            'Paste the content brief here. You can:\n\n1. Generate one from the "Content Brief" tab above\n2. Paste a previously generated brief\n3. Paste a brief from another source\n\nThe AI will use this brief to develop a comprehensive article.'
                          }
                          rows={8}
                          className="input-field resize-none"
                          disabled={currentTab.loading}
                        />
                        <p className="text-xs text-gray-500 mt-2">
                          Paste the content brief that was previously generated. This will be used as a guide for content development.
                        </p>
                      </div>

                      {/* Info Box */}
                      <div className="card p-6 bg-blue-50 border border-blue-200">
                        <h3 className="text-sm font-semibold text-gray-900 mb-2">How This Works</h3>
                        <ol className="text-xs text-gray-700 space-y-2 list-decimal list-inside">
                          <li>Start with the <strong>Content Brief</strong> tab to generate a brief from your topical map</li>
                          <li>Copy the generated brief below (or paste your own brief)</li>
                          <li>Let the AI develop a full article following the brief structure</li>
                          <li>The AI will incorporate the emotional hook, outline, and expert questions into the final article</li>
                        </ol>
                      </div>
                    </>
                  )}

                  {/* Copywriting Subtab */}
                  {(developTab as DevelopmentState).subtab === 'copywriting' && (
                    <>
                      {/* Copywriting Type Selector */}
                      <div className="card p-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-4">
                          Select Copywriting Type *
                        </label>
                        <div className="space-y-3">
                          {(['blog', 'homepage', 'essential', 'faq'] as const).map((type) => (
                            <label key={type} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors">
                              <input
                                type="radio"
                                name="copywriting-type"
                                value={type}
                                checked={(developTab as DevelopmentState).copywritingType === type}
                                onChange={(e) => setCurrentTab({ copywritingType: e.target.value as CopywritingType })}
                                className="w-4 h-4 text-blue-600"
                                disabled={currentTab.loading}
                              />
                              <div>
                                <span className="font-medium text-gray-700">
                                  {type === 'blog' ? 'Blog Article' : type === 'homepage' ? 'Homepage Copy' : type === 'essential' ? 'Essential Pages' : 'FAQs'}
                                </span>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {type === 'blog' ? 'Generate blog articles from content briefs' : type === 'homepage' ? 'Create compelling homepage copy' : type === 'essential' ? 'Write essential page content' : 'Create FAQ articles from SERP data'}
                                </p>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Blog Article Copywriting */}
                      {(developTab as DevelopmentState).copywritingType === 'blog' && (
                        <>
                          <div className="card p-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                              Content Brief File *
                            </label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors">
                              <input
                                type="file"
                                accept=".txt,.md,.docx,.pdf"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onload = (event) => {
                                      const content = event.target?.result as string;
                                      setCurrentTab({ contentBrief: content });
                                    };
                                    reader.readAsText(file);
                                  }
                                }}
                                disabled={currentTab.loading}
                                className="hidden"
                                id="blog-brief-input"
                              />
                              <label htmlFor="blog-brief-input" className="cursor-pointer">
                                <p className="text-gray-600">📄 Click to upload your content brief</p>
                                <p className="text-xs text-gray-500 mt-1">Supported: TXT, MD, DOCX, PDF</p>
                              </label>
                            </div>
                          </div>

                          <div className="card p-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                              Content Brief (or paste below)
                            </label>
                            <textarea
                              value={(developTab as DevelopmentState).contentBrief}
                              onChange={(e) => setCurrentTab({ contentBrief: e.target.value })}
                              placeholder="Paste your content brief here..."
                              rows={8}
                              className="input-field resize-none"
                              disabled={currentTab.loading}
                            />
                            <p className="text-xs text-gray-500 mt-2">
                              Your content brief will be used to generate a high-quality blog article with E-E-A-T focus.
                            </p>
                          </div>
                        </>
                      )}

                      {/* Homepage/Essential Pages Copywriting */}
                      {(developTab as DevelopmentState).copywritingType === 'homepage' && (
                        <>
                          <div className="card p-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                              Website URL *
                            </label>
                            <input
                              type="url"
                              value={(developTab as DevelopmentState).websiteUrl}
                              onChange={(e) => setCurrentTab({ websiteUrl: e.target.value })}
                              placeholder="https://example.com"
                              className="input-field"
                              disabled={currentTab.loading}
                            />
                            <p className="text-xs text-gray-500 mt-2">
                              Enter your website URL for analysis and copy generation.
                            </p>
                          </div>

                          <div className="card p-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                              Competitor URL (Optional)
                            </label>
                            <input
                              type="url"
                              value={(developTab as DevelopmentState).competitorUrl}
                              onChange={(e) => setCurrentTab({ competitorUrl: e.target.value })}
                              placeholder="https://competitor.com"
                              className="input-field"
                              disabled={currentTab.loading}
                            />
                            <p className="text-xs text-gray-500 mt-2">
                              Optional: Provide a competitor website URL to analyze their approach.
                            </p>
                          </div>
                        </>
                      )}

                      {(developTab as DevelopmentState).copywritingType === 'essential' && (
                        <>
                          <div className="card p-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                              Website URL *
                            </label>
                            <input
                              type="url"
                              value={(developTab as DevelopmentState).websiteUrl}
                              onChange={(e) => setCurrentTab({ websiteUrl: e.target.value })}
                              placeholder="https://example.com"
                              className="input-field"
                              disabled={currentTab.loading}
                            />
                            <p className="text-xs text-gray-500 mt-2">
                              Enter your website URL to generate essential page content.
                            </p>
                          </div>

                          <div className="card p-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                              Competitor URL (Optional)
                            </label>
                            <input
                              type="url"
                              value={(developTab as DevelopmentState).competitorUrl}
                              onChange={(e) => setCurrentTab({ competitorUrl: e.target.value })}
                              placeholder="https://competitor.com"
                              className="input-field"
                              disabled={currentTab.loading}
                            />
                            <p className="text-xs text-gray-500 mt-2">
                              Optional: Analyze competitor pages to enhance your content strategy.
                            </p>
                          </div>
                        </>
                      )}

                      {/* FAQ Copywriting */}
                      {(developTab as DevelopmentState).copywritingType === 'faq' && (
                        <>
                          <div className="card p-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                              SERP Questions File *
                            </label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors">
                              <input
                                type="file"
                                accept=".txt,.csv,.xlsx,.pdf"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) setCurrentTab({ serpQuestionsFile: file });
                                }}
                                disabled={currentTab.loading}
                                className="hidden"
                                id="serp-questions-input"
                              />
                              <label htmlFor="serp-questions-input" className="cursor-pointer">
                                <p className="text-gray-600">📄 Click to upload SERP questions</p>
                                <p className="text-xs text-gray-500 mt-1">Supported: TXT, CSV, XLSX, PDF</p>
                              </label>
                            </div>
                            {(developTab as DevelopmentState).serpQuestionsFile && (
                              <p className="text-xs text-green-600 mt-2">
                                ✓ {(developTab as DevelopmentState).serpQuestionsFile?.name}
                              </p>
                            )}
                          </div>

                          <div className="card p-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                              Audience Analysis File *
                            </label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors">
                              <input
                                type="file"
                                accept=".txt,.csv,.xlsx,.pdf"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) setCurrentTab({ audienceAnalysisFile: file });
                                }}
                                disabled={currentTab.loading}
                                className="hidden"
                                id="audience-analysis-input"
                              />
                              <label htmlFor="audience-analysis-input" className="cursor-pointer">
                                <p className="text-gray-600">📄 Click to upload audience analysis</p>
                                <p className="text-xs text-gray-500 mt-1">Supported: TXT, CSV, XLSX, PDF</p>
                              </label>
                            </div>
                            {(developTab as DevelopmentState).audienceAnalysisFile && (
                              <p className="text-xs text-green-600 mt-2">
                                ✓ {(developTab as DevelopmentState).audienceAnalysisFile?.name}
                              </p>
                            )}
                          </div>
                        </>
                      )}

                      {/* Info Box */}
                      <div className="card p-6 bg-blue-50 border border-blue-200">
                        <h3 className="text-sm font-semibold text-gray-900 mb-2">How This Works</h3>
                        <ol className="text-xs text-gray-700 space-y-2 list-decimal list-inside">
                          {(developTab as DevelopmentState).copywritingType === 'blog' && (
                            <>
                              <li>Upload or paste your content brief</li>
                              <li>The AI generates a professional blog article</li>
                              <li>Content follows E-E-A-T principles with proper citations</li>
                              <li>Output includes expert insights and comprehensive coverage</li>
                            </>
                          )}
                          {(developTab as DevelopmentState).copywritingType === 'homepage' && (
                            <>
                              <li>Enter your website URL</li>
                              <li>Optionally add a competitor URL for benchmarking</li>
                              <li>The AI generates compelling homepage copy</li>
                              <li>Copy is optimized for conversions and brand alignment</li>
                            </>
                          )}
                          {(developTab as DevelopmentState).copywritingType === 'essential' && (
                            <>
                              <li>Enter your website URL</li>
                              <li>Optionally add a competitor URL for comparison</li>
                              <li>The AI creates content for essential pages (About, Contact, etc.)</li>
                              <li>Content is structured for user engagement and conversions</li>
                            </>
                          )}
                          {(developTab as DevelopmentState).copywritingType === 'faq' && (
                            <>
                              <li>Upload your SERP questions and audience analysis files</li>
                              <li>The AI analyzes questions and audience needs</li>
                              <li>Generates comprehensive FAQ article with expert answers</li>
                              <li>Output follows MECE structure with proper citations</li>
                            </>
                          )}
                        </ol>
                      </div>
                    </>
                  )}
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
                    : activeTab === 'audit'
                    ? !(auditTab as AuditState).websiteUrl.trim()
                    : activeTab === 'develop'
                    ? (developTab as DevelopmentState).subtab === 'brief'
                      ? !(
                          ((developTab as DevelopmentState).topicalMapText ||
                            (developTab as DevelopmentState).topicalMapFile) &&
                          (developTab as DevelopmentState).pageTitles.trim() &&
                          (developTab as DevelopmentState).clusterKeywords.trim()
                        )
                      : (developTab as DevelopmentState).subtab === 'content'
                      ? !(developTab as DevelopmentState).contentBrief.trim()
                      : (developTab as DevelopmentState).subtab === 'copywriting'
                      ? (developTab as DevelopmentState).copywritingType === 'blog'
                        ? !(developTab as DevelopmentState).contentBrief.trim()
                        : (developTab as DevelopmentState).copywritingType === 'faq'
                        ? !((developTab as DevelopmentState).serpQuestionsFile && (developTab as DevelopmentState).audienceAnalysisFile)
                        : !((developTab as DevelopmentState).websiteUrl.trim())
                      : false
                    : false)
                }
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {currentTab.loading ? (
                  <>
                    <span className="inline-block animate-spin mr-2">⏳</span>
                    Processing...
                  </>
                ) : activeTab === 'interlink' ? (
                  'Analyze Interlinking'
                ) : activeTab === 'audit' ? (
                  'Analyze Content'
                ) : (developTab as DevelopmentState).subtab === 'brief' ? (
                  'Generate Content Brief'
                ) : (developTab as DevelopmentState).subtab === 'content' ? (
                  'Develop Article'
                ) : (developTab as DevelopmentState).copywritingType === 'blog' ? (
                  'Generate Blog Article'
                ) : (developTab as DevelopmentState).copywritingType === 'faq' ? (
                  'Generate FAQ Article'
                ) : (developTab as DevelopmentState).copywritingType === 'homepage' ? (
                  'Generate Homepage Copy'
                ) : (
                  'Generate Essential Page Copy'
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
              className="transition-colors duration-200"
              style={{ color: '#0065F4' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'rgba(0, 101, 244, 0.2)';
                e.currentTarget.style.textDecoration = 'underline';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#0065F4';
                e.currentTarget.style.textDecoration = 'none';
              }}
            >
              Get your free Gemini API key
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

