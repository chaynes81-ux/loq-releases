# Plugin Assets

This directory contains visual assets for the loq Claude Code plugin marketplace listing.

## Required Assets

### Icon (`icon.png`)

**Specifications:**
- **Size**: 512x512px minimum (1024x1024px recommended)
- **Format**: PNG with transparency
- **Style**: Professional, clean design
- **Content**: Represents log analysis, SQL queries, or data processing

**Design Suggestions:**
- Magnifying glass over log lines
- SQL terminal/console icon
- Database with search/query symbol
- Simplified loq logo/wordmark
- Color scheme: Blues, greens, or tech-friendly colors

**Tools:**
- Figma, Adobe Illustrator, or similar
- Online generators: Canva, Looka, or Hatchful
- AI generators: DALL-E, Midjourney (with "minimalist tech icon" prompt)

### Screenshots

**Required**: 3-5 screenshots demonstrating plugin features

#### Screenshot 1: `/loq` Command in Action
**Filename**: `screenshot-1.png`
**Size**: 1280x800px or larger
**Caption**: "Using the /loq command to build a query for IIS log analysis"

**Content**:
- Show Claude Code interface
- User invoking `/loq` with a question like: "How do I find 404 errors in IIS logs?"
- Claude's response with SQL query and explanation
- Highlighted code blocks showing the loq command

#### Screenshot 2: Agent Migration Help
**Filename**: `screenshot-2.png`
**Size**: 1280x800px or larger
**Caption**: "The loq-specialist agent helping with VBScript to C# migration"

**Content**:
- Show agent invocation: `@loq-specialist migrate this VBScript to C#`
- Original VBScript code using MS Log Parser COM
- Converted C# code using Loq.Classic
- Agent explanations of differences

#### Screenshot 3: Complex Query Building
**Filename**: `screenshot-3.png`
**Size**: 1280x800px or larger
**Caption**: "Building complex queries with JOINs and window functions"

**Content**:
- Advanced SQL query with JOIN or window function
- Agent explanation of query structure
- Example output or execution plan
- Shows multi-step query development

#### Optional Screenshot 4: Format Conversion
**Filename**: `screenshot-4.png` (optional)
**Size**: 1280x800px or larger
**Caption**: "Converting between formats - CSV to JSON with filtering"

**Content**:
- Query showing format conversion
- Input format specification
- Output format specification
- Shows versatility of loq

#### Optional Screenshot 5: Debugging
**Filename**: `screenshot-5.png` (optional)
**Size**: 1280x800px or larger
**Caption**: "Debugging a query error with the loq-specialist"

**Content**:
- User's error message
- Agent's diagnostic approach
- Solution and corrected query
- Shows troubleshooting capabilities

## Creating Screenshots

### Method 1: Real Usage
1. Install the plugin locally
2. Use Claude Code with real queries
3. Capture screenshots of interactions
4. Crop and annotate as needed

### Method 2: Mockups
1. Use design tools (Figma, Sketch)
2. Recreate Claude Code interface
3. Add realistic query examples
4. Export at high resolution

### Screenshot Best Practices
- **High quality**: Sharp text, clear UI elements
- **Readable code**: Use large enough font sizes
- **Highlight key parts**: Draw attention to important features
- **Real examples**: Use realistic queries and data
- **Clean interface**: Remove personal information
- **Good lighting**: Use light or dark mode consistently
- **Annotations**: Add arrows or highlights if helpful

## Hosting

Assets should be committed to this repository and accessed via GitHub raw URLs:

```
https://raw.githubusercontent.com/chaynes81-ux/loq-releases/main/assets/icon.png
https://raw.githubusercontent.com/chaynes81-ux/loq-releases/main/assets/screenshot-1.png
https://raw.githubusercontent.com/chaynes81-ux/loq-releases/main/assets/screenshot-2.png
https://raw.githubusercontent.com/chaynes81-ux/loq-releases/main/assets/screenshot-3.png
```

These URLs are already referenced in:
- `.claude-plugin/plugin.json` (icon)
- `.claude-plugin/submission-metadata.json` (icon + screenshots)

## Checklist

Before submitting to marketplace:

- [ ] `icon.png` created (512x512px minimum)
- [ ] Screenshot 1: `/loq` command usage
- [ ] Screenshot 2: Agent migration help
- [ ] Screenshot 3: Complex query building
- [ ] Screenshot 4: Format conversion (optional)
- [ ] Screenshot 5: Debugging (optional)
- [ ] All images committed to repository
- [ ] GitHub raw URLs verified accessible
- [ ] URLs updated in manifest files
- [ ] Images display correctly in browser
- [ ] No personal/sensitive information in screenshots

## Testing URLs

After committing assets, verify they load:

```bash
# Test icon
curl -I https://raw.githubusercontent.com/chaynes81-ux/loq-releases/main/assets/icon.png

# Test screenshots
curl -I https://raw.githubusercontent.com/chaynes81-ux/loq-releases/main/assets/screenshot-1.png
```

Open URLs in browser to verify images display correctly.

## Updating Assets

To update assets after initial release:
1. Replace files in this directory
2. Commit and push changes
3. GitHub raw URLs remain the same
4. Plugin marketplaces will fetch updated images

## License

All assets in this directory are licensed under MIT License, same as the plugin.
