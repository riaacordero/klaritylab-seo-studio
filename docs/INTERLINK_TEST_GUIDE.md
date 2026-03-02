# Interlink Review Tab - Quick Test Guide

## Starting the Development Server
```bash
cd /Users/riaacordero/Documents/Dev/klaritylab-seo-studio
npm run dev
# Server will start on http://localhost:3000
```

## Testing the Interlink Review Tab

### Step 1: Navigate to the Application
1. Open http://localhost:3000 in your browser
2. You should see the "SEO Studio by Klarity Lab" dashboard
3. The "Interlink Review" tab should be selected by default

### Step 2: Fill Out the Form

**Required Fields (all marked with *):**
- **Website URL to be analyzed**: Enter the article URL
  - Example: `https://example.com/blog/seo-guide`
- **Contact Page URL**: Where readers can contact you
  - Example: `https://example.com/contact`
- **Service Page URL**: Your main services page
  - Example: `https://example.com/services`
- **Booking Page URL**: Where users book appointments/services
  - Example: `https://example.com/book-now`
- **Blog Directory URL**: Root of your blog
  - Example: `https://example.com/blog`

**Optional Fields:**
- **Pillar Page URL**: Your pillar/cornerstone content (optional)
  - Example: `https://example.com/pillar-page`
- **Related Blog Pages**: List specific blog posts to analyze (optional)
  - Enter one URL per line
  - Leave blank to auto-scan the blog directory
  - Example:
    ```
    https://example.com/blog/post-1
    https://example.com/blog/post-2
    https://example.com/blog/post-3
    ```

### Step 3: Submit the Form
1. Click the "Analyze Interlinking" button
2. You'll see a loading spinner (⏳ Processing...)
3. The AI will analyze the URLs and generate recommendations

### Step 4: Review Results

**Table Format:**
The AI will return a table with 4 columns:
| Article | Page URL | Keyword | Target Page URL |

- **Article**: The blog post being analyzed
- **Page URL**: URL of the article
- **Keyword**: The anchor text to use
- **Target Page URL**: Which support URL to link to

### Step 5: Export Results

**Option 1: Copy to Clipboard**
- Click the "📋 Copy Table" button
- Paste into Excel, Google Sheets, or any document
- Table is formatted as tab-separated values for proper alignment

**Option 2: Export to CSV**
- Click the "📊 Export CSV" button
- File will download automatically
- Filename: `interlink-analysis-YYYY-MM-DD.csv`
- Opens directly in Excel or Google Sheets

## Form Validation Rules

### Before Submission
- ❌ Submit button is **DISABLED** if any required field is empty
- ✅ Submit button is **ENABLED** only when all 5 required fields are filled
- Optional fields don't affect form submission

### During Submission
- Loading spinner shows processing
- Form is disabled to prevent double submission
- Request goes to `/api/agent/ask` endpoint

### After Submission
- Results appear below the form
- Error messages appear in red if something goes wrong
- Model used and token count shown in metadata

## Switching Between Tabs

### Tab Switching Behavior
- Click any tab to switch (Interlink Review, Content Audit, Content Development)
- Each tab maintains its own state
- Interlink Review shows URL-based form
- Other tabs show the traditional form (System Context + Your Request)

### State Persistence
- Switching tabs and back preserves your input
- You can work on multiple tools without losing progress
- Clear form with browser refresh

## Troubleshooting

### Form Won't Submit
- **Check**: Are all 5 required URL fields filled?
- **Check**: Are URLs valid format (start with http:// or https://)?
- **Fix**: Fill in all required fields completely

### No Results Displayed
- **Check**: API may be processing (wait for loading to complete)
- **Check**: Check browser console for error messages (F12 > Console)
- **Fix**: Try again with different URLs

### Table Not Parsing Correctly
- If AI response doesn't follow the standard table format
- Results will show as plain text instead
- You can still copy the plain text response
- CSV export works best when table format is correct

### Missing the Copy/Export Buttons
- Buttons appear after AI returns results
- Ensure the response includes the "Interlink Analysis Results" section
- Refresh if buttons don't appear

## Key Differences from Other Tabs

| Feature | Interlink Review | Content Audit | Content Development |
|---------|------------------|----------------|----------------------|
| Form Type | URL-based | Free-form text | Free-form text |
| Provider Selector | Hidden | Visible | Visible |
| System Prompt | Fixed | Editable | Editable |
| Output Format | Table | Plain text | Plain text |
| Export Options | Copy + CSV | Copy only | Copy only |
| Required Fields | 5 URLs | 1 prompt | 1 prompt |

## Tips for Best Results

1. **Use Real URLs**: Enter actual website URLs for better context
2. **Include All Support Pages**: Contact, Service, Booking help the AI understand your site structure
3. **Add Related Blog Posts**: If you know which posts to link, list them explicitly
4. **Review Recommendations**: Always review the AI's suggestions before implementing
5. **Check Anchor Text**: Ensure suggested anchor text appears in your article content
6. **Test the Export**: Verify CSV opens correctly in your preferred spreadsheet software

## API Integration

The Interlink Review tab uses the `/api/agent/ask` endpoint with:
- **Method**: POST
- **Provider**: Gemini (Google) or OpenAI-compatible
- **System Prompt**: Pre-configured for interlink analysis
- **Max Tokens**: 2048 (can generate detailed analyses)
- **Temperature**: 0.7 (balanced between creative and factual)

The prompt automatically includes:
- Main URL to analyze
- All support URLs with their purposes
- Related blog pages
- Specific instructions for anchor text and linking rules
- Required output format (table with 4 columns)

---

**Note**: Make sure you have the required API keys configured in your environment:
- `GOOGLE_GEMINI_API_KEY` for Gemini
- `OPENAI_API_KEY` for OpenAI-compatible models
