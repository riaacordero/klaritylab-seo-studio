# SEO Studio Features

## Overview

The SEO Studio by Klarity Lab provides three powerful AI-driven tools for content marketing and SEO optimization. Each tool is accessible via a dedicated tab in the dashboard.

## 1. Interlink Review

### Purpose
Analyze and optimize your website's internal linking strategy to improve SEO performance, user navigation, and content hierarchy.

### What It Does
- Analyzes your website structure and content pages
- Recommends optimal internal linking patterns
- Identifies linking opportunities between related content
- Improves information hierarchy and user navigation
- Enhances SEO through strategic anchor text and link distribution

### System Prompt
> You are an expert SEO consultant specializing in internal linking strategies. Analyze the provided content and website structure to recommend optimal internal linking patterns that improve SEO performance, user navigation, and information hierarchy.

### Input Guidelines
- **Website Structure**: Describe your site architecture, main sections, and content pillars
- **Page Relationships**: Explain how different content pieces relate to each other
- **Current Strategy**: Share existing interlinking approaches if applicable
- **Goals**: Specify what you want to achieve (better SEO, improved UX, content distribution, etc.)

### Example Input
```
My website has 3 main pillars:
1. SaaS Pricing (20+ articles on pricing strategies)
2. Customer Success (15+ articles on client onboarding)
3. Product Features (10+ articles on software functionality)

I need an interlinking strategy that connects related articles and drives traffic to core conversion pages.
Current homepage and pricing page have no internal links from content articles.
```

### Expected Output
- Internal linking recommendations organized by content cluster
- Specific link suggestions (source page → target page with anchor text)
- Link count recommendations per page
- Strategic benefits of the proposed structure
- Implementation priority (quick wins first)

---

## 2. Content Audit

### Purpose
Conduct a comprehensive audit of your existing content to identify SEO optimization opportunities, readability issues, and quality improvements.

### What It Does
- Analyzes content for SEO optimization opportunities
- Checks keyword relevance and density
- Evaluates content structure and readability
- Identifies technical SEO issues
- Provides actionable recommendations for improvement
- Assesses overall content quality and competitiveness

### System Prompt
> You are an expert SEO auditor. Conduct a comprehensive content audit examining the provided content for SEO optimization opportunities, readability, keyword relevance, structure, and overall quality. Provide actionable recommendations for improvement.

### Input Guidelines
- **Content**: Paste the full text of the page/article you want audited
- **Target Keywords**: List primary and secondary keywords you want to rank for
- **Audience**: Describe your target audience and their search intent
- **Current Performance**: Share any metrics (traffic, rankings, bounce rate) if available
- **Business Goals**: Explain what success looks like for this content

### Example Input
```
[Paste your article content here]

Target Keywords: "SaaS pricing strategies", "pricing page design", "subscription models"

Audience: B2B SaaS founders and marketing leaders deciding on pricing models

Current Metrics: 2,000 monthly views, 45% bounce rate, ranking #15 for main keyword

Goal: Increase rankings for main keyword to top 5 positions, reduce bounce rate to <35%
```

### Expected Output
- SEO optimization score (1-100)
- Identified issues organized by severity (Critical, High, Medium, Low)
- Keyword analysis and recommendations
- Content structure improvements
- Readability assessment and fixes
- Title and meta description suggestions
- Internal/external linking opportunities
- Priority action items for improvement

---

## 3. Content Development

### Purpose
Create compelling, SEO-optimized content that engages readers and drives conversions while ranking well in search engines.

### What It Does
- Creates original, high-quality content optimized for SEO
- Integrates target keywords naturally throughout the content
- Structures content for both readability and SEO
- Includes proper formatting (headers, bullet points, lists)
- Provides conversion-focused messaging
- Ensures content length and depth match user intent

### System Prompt
> You are an expert content strategist and copywriter. Create compelling, SEO-optimized content that engages readers and converts visitors. Provide well-structured content with proper formatting, keyword integration, and conversion-focused messaging.

### Input Guidelines
- **Topic/Title**: Clear description of what content to create
- **Target Keywords**: Primary and secondary keywords to target
- **Audience**: Who this content is for and their needs
- **Content Length**: Preferred word count or section breakdown
- **Format**: Blog post, landing page, guide, comparison, etc.
- **Tone**: Brand voice and writing style preferences
- **CTA**: What action should readers take after reading

### Example Input
```
Create a comprehensive guide about SaaS pricing strategies for B2B software companies.

Target Keywords:
- Primary: "SaaS pricing strategies" (2,500+ monthly searches)
- Secondary: "pricing models for software", "subscription pricing", "value-based pricing"

Audience: Founders and product managers at early-stage SaaS startups

Length: 2,500-3,000 words

Format: Ultimate Guide with:
- Introduction
- 5-7 main pricing strategies with pros/cons
- Implementation steps
- Real-world examples
- Conclusion with actionable next steps

Tone: Professional but approachable, data-driven with examples

CTA: Sign up for pricing consultation or download pricing toolkit
```

### Expected Output
- Fully written content in requested format
- Proper H2/H3 heading structure
- Keyword-optimized introduction and conclusion
- Formatted lists and bullet points where appropriate
- Real-world examples and case studies
- Clear calls-to-action
- Meta title and description suggestions
- Internal linking recommendations

---

## Workflow Examples

### Example 1: Content Strategy for New Website

1. **Start with Content Development**
   - Define 3-5 main content pillars
   - Create foundational content for each pillar
   
2. **Then use Interlink Review**
   - Input your newly created content
   - Get recommendations for connecting related articles
   - Establish content clusters and hub-spoke structure

3. **Finally use Content Audit**
   - Audit each piece before publishing
   - Optimize based on recommendations
   - Ensure consistency in quality and messaging

### Example 2: Improving Existing Website

1. **Start with Content Audit**
   - Identify underperforming content
   - Find quick wins for optimization
   - Prioritize improvements by impact

2. **Use Content Development**
   - Rewrite critical pages based on audit findings
   - Create new content for content gaps
   - Develop cluster content around main topics

3. **Use Interlink Review**
   - Restructure internal linking
   - Create content clusters
   - Improve site topology

---

## Tips for Best Results

### Interlink Review Tips
- Provide detailed website structure information
- Include current page metrics if available
- Specify your main revenue pages or key conversions
- Mention any technical constraints (CMS limitations, etc.)

### Content Audit Tips
- Paste the complete content for accurate analysis
- Include target keywords for context
- Share current performance metrics
- Specify your business goals clearly
- Ask for specific improvements (SEO, readability, conversion, etc.)

### Content Development Tips
- Be specific about audience and intent
- Provide competitor examples if helpful
- Mention brand voice and tone preferences
- Specify content structure and format clearly
- Include clear conversion goals

---

## API Integration

All three tools use the same API endpoint with different system prompts:

**Endpoint**: `POST /api/agent/ask`

```typescript
{
  prompt: string;           // Your request or content to analyze
  systemPrompt: string;     // Pre-configured for each tool
  provider: 'gemini';       // LLM provider (configurable)
  maxTokens: 2048;          // Response length
  temperature: 0.7;         // Creativity level
}
```

---

## Performance Notes

- **Response Time**: 30-60 seconds depending on content length
- **Token Usage**: Tracked and reported with each response
- **Maximum Input**: ~8,000 tokens (~32,000 characters)
- **Maximum Output**: 2,048 tokens (~8,000 characters)

---

## Upcoming Features

- [ ] Export results as Markdown/PDF
- [ ] Batch processing for multiple pages
- [ ] SEO metrics dashboard
- [ ] Competitor analysis tool
- [ ] Content calendar integration
- [ ] A/B testing recommendations
- [ ] Social media copy generation

---

**Last Updated**: March 2, 2026
