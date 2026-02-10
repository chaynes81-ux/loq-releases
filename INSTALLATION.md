# loq Claude Code Plugin - Installation Guide

Complete guide for installing and distributing the loq Claude Code plugin.

## Quick Install

### From GitHub (Recommended)

```bash
# Add the marketplace
/plugin marketplace add github.com/chaynes81-ux/loq-releases

# Install the plugin
/plugin install loq@chaynes81-ux
```

That's it! You can now use `/loq` commands and `@loq-specialist` agent.

## Detailed Installation Methods

### Method 1: GitHub Self-Hosted Marketplace

**Best for**: Immediate availability, no approval needed

**Steps:**

1. **Add the marketplace:**
   ```bash
   /plugin marketplace add github.com/chaynes81-ux/loq-releases
   ```

2. **Verify marketplace added:**
   ```bash
   /plugin marketplace list
   ```
   You should see `chaynes81-ux` in the list.

3. **Install the plugin:**
   ```bash
   /plugin install loq@chaynes81-ux
   ```

4. **Verify installation:**
   ```bash
   /plugin list
   ```
   You should see `loq` in the installed plugins.

5. **Test the plugin:**
   ```bash
   /loq help me build a query for CSV files
   ```

**Updating:**
```bash
/plugin uninstall loq@chaynes81-ux
/plugin install loq@chaynes81-ux
```

### Method 2: Official Claude Code Marketplace

**Status**: Coming soon (pending approval)

**Once approved:**
```bash
/plugin install loq
```

The plugin will be listed at: https://claudecodecommands.directory

### Method 3: Local Development/Testing

**Best for**: Plugin development, testing changes, offline use

**Steps:**

1. **Clone the repository:**
   ```bash
   git clone https://github.com/chaynes81-ux/loq-releases.git
   cd loq-releases
   ```

2. **Create a local marketplace directory:**
   ```bash
   mkdir -p ~/claude-plugins
   cp -r /path/to/loq-releases ~/claude-plugins/loq
   ```

3. **Add local marketplace:**
   ```bash
   /plugin marketplace add ~/claude-plugins
   ```

4. **Install from local:**
   ```bash
   /plugin install loq@local
   ```

5. **Test your changes:**
   After modifying plugin files, uninstall and reinstall:
   ```bash
   /plugin uninstall loq@local
   /plugin install loq@local
   ```

### Method 4: Direct Repository Path

**For testing specific branches or forks:**

```bash
# Add marketplace from specific branch
/plugin marketplace add github.com/username/loq-releases#branch-name

# Install plugin
/plugin install loq@username
```

## Verification

### Check Installation

```bash
# List installed plugins
/plugin list

# View plugin details
/plugin info loq
```

### Test Commands

```bash
# Test the /loq command
/loq what functions are available for date manipulation?

# Test the agent (if in a conversation)
@loq-specialist help me migrate this Log Parser query
```

### Check Available Components

```bash
# List all commands
/help

# List all agents
/agents
```

You should see:
- `/loq` in the commands list
- `loq-specialist` in the agents list

## Troubleshooting

### Plugin Not Loading

**Problem**: Plugin doesn't appear after installation

**Solutions**:
1. Check marketplace was added correctly:
   ```bash
   /plugin marketplace list
   ```

2. Verify plugin installation:
   ```bash
   /plugin list
   ```

3. Try reinstalling:
   ```bash
   /plugin uninstall loq@chaynes81-ux
   /plugin install loq@chaynes81-ux
   ```

4. Restart Claude Code

### Command Not Available

**Problem**: `/loq` command not found

**Solutions**:
1. Check plugin is installed:
   ```bash
   /plugin list
   ```

2. Verify command registration:
   ```bash
   /help
   ```
   Look for `/loq` in the list

3. Check plugin files:
   - `commands/loq.md` should exist
   - `.claude-plugin/plugin.json` should reference `./commands/`

### Agent Not Available

**Problem**: `@loq-specialist` agent not recognized

**Solutions**:
1. List agents:
   ```bash
   /agents
   ```
   Look for `loq-specialist`

2. Check plugin files:
   - `agents/loq-specialist.md` should exist
   - `.claude-plugin/plugin.json` should reference `./agents/`

3. Reinstall plugin

### Documentation Not Found

**Problem**: Plugin can't find `llm-docs/` files

**Solutions**:
1. Verify documentation exists in repository:
   ```bash
   ls -la llm-docs/
   ```

2. Check files:
   - `llm-docs/REFERENCE.md`
   - `llm-docs/sql.md`
   - `llm-docs/functions.md`
   - etc.

3. Ensure you're in the correct directory

### Marketplace Add Fails

**Problem**: Can't add GitHub marketplace

**Solutions**:
1. Check repository is public
2. Verify URL format: `github.com/username/repo` (no `https://`)
3. Check internet connectivity
4. Try with full path: `github.com/chaynes81-ux/loq-releases`

## Uninstallation

### Remove Plugin

```bash
# Uninstall plugin
/plugin uninstall loq@chaynes81-ux
```

### Remove Marketplace

```bash
# Remove marketplace (optional)
/plugin marketplace remove chaynes81-ux
```

### Clean Reinstall

```bash
# Complete clean reinstall
/plugin uninstall loq@chaynes81-ux
/plugin marketplace remove chaynes81-ux
/plugin marketplace add github.com/chaynes81-ux/loq-releases
/plugin install loq@chaynes81-ux
```

## Distribution

### For Repository Maintainers

#### Self-Hosting on GitHub

The plugin is ready for self-hosted distribution. Files needed:

1. `.claude-plugin/plugin.json` - Plugin manifest
2. `.claude-plugin/marketplace.json` - Marketplace catalog
3. `commands/loq.md` - Command definition
4. `agents/loq-specialist.md` - Agent definition
5. `assets/icon.png` - Plugin icon (create)
6. `assets/screenshot-*.png` - Screenshots (create)

**To distribute:**
1. Commit all files to GitHub
2. Create assets (icon + screenshots)
3. Push to main branch
4. Share installation instructions

**Installation URL:**
```
/plugin marketplace add github.com/chaynes81-ux/loq-releases
/plugin install loq@chaynes81-ux
```

#### Official Marketplace Submission

**Requirements:**
1. Complete `.claude-plugin/submission-metadata.json`
2. Create assets (icon + screenshots)
3. Commit to GitHub
4. Test installation locally

**Submission:**
1. Visit: https://claudecodecommands.directory/submit
2. Provide:
   - Repository URL: `https://github.com/chaynes81-ux/loq-releases`
   - Contact email: `chaynes81@gmail.com`
   - Plugin category: `data-analysis`
3. Wait for review (1-7 days)

**After approval:**
```
/plugin install loq
```

#### Creating Assets

See `assets/README.md` for detailed asset creation guide.

**Required:**
- Icon (512x512px PNG)
- 3-5 screenshots (1280x800px)

**Upload to:**
```
assets/icon.png
assets/screenshot-1.png
assets/screenshot-2.png
assets/screenshot-3.png
```

**URLs:**
```
https://raw.githubusercontent.com/chaynes81-ux/loq-releases/main/assets/icon.png
https://raw.githubusercontent.com/chaynes81-ux/loq-releases/main/assets/screenshot-1.png
```

### Version Releases

**Creating a new version:**

1. **Update version numbers:**
   - `.claude-plugin/plugin.json` → `"version": "1.1.0"`
   - `.claude-plugin/marketplace.json` → Update plugin version
   - `.claude-plugin/submission-metadata.json` → `"version": "1.1.0"`

2. **Update CHANGELOG.md:**
   ```markdown
   ## [1.1.0] - 2026-XX-XX
   ### Added
   - New feature X
   ### Changed
   - Improved Y
   ### Fixed
   - Bug Z
   ```

3. **Commit and tag:**
   ```bash
   git add .
   git commit -m "Release v1.1.0"
   git tag -a v1.1.0 -m "Release v1.1.0"
   git push origin main
   git push origin v1.1.0
   ```

4. **Users update:**
   ```bash
   /plugin uninstall loq@chaynes81-ux
   /plugin install loq@chaynes81-ux
   ```

## Platform-Specific Notes

### Windows

No special considerations. All commands work as documented.

### macOS

No special considerations. All commands work as documented.

### Linux

No special considerations. All commands work as documented.

## Advanced Configuration

### Repository-Level Auto-Installation

For teams, add to project's `.claude/settings.json`:

```json
{
  "extraKnownMarketplaces": {
    "loq-tools": {
      "source": {
        "source": "github",
        "repo": "chaynes81-ux/loq-releases"
      }
    }
  },
  "enabledPlugins": {
    "loq@loq-tools": {}
  }
}
```

Plugin auto-installs when team members open the project.

### Private/Enterprise Distribution

For private repositories:

```bash
# Add private repo (requires authentication)
/plugin marketplace add github.com/company/private-loq-fork

# Install from private marketplace
/plugin install loq@company
```

## Support

### Getting Help

- **GitHub Issues**: https://github.com/chaynes81-ux/loq-releases/issues
- **Documentation**: `llm-docs/REFERENCE.md`
- **Email**: chaynes81@gmail.com

### Reporting Issues

When reporting installation issues, include:
1. Claude Code version
2. Operating system
3. Installation method used
4. Error messages (full text)
5. Output of `/plugin list` and `/plugin marketplace list`

## License

MIT License - See LICENSE file for details.
