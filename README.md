# ghostty-config-mcp

MCP server for managing [Ghostty](https://ghostty.org) terminal emulator configuration via [Claude Code](https://docs.anthropic.com/en/docs/claude-code).

## Tools

| Tool | Description |
|------|-------------|
| `ghostty_version` | Show installed Ghostty version and build info |
| `ghostty_search_config_docs` | Search config documentation by keyword |
| `ghostty_get_config_option` | Get full docs for a specific config key (supports fuzzy matching) |
| `ghostty_show_current_config` | Show active configuration (optionally changes only) |
| `ghostty_validate_config` | Validate config file for syntax errors |
| `ghostty_list_fonts` | List available font families and faces |
| `ghostty_list_themes` | List available themes (filterable by dark/light) |
| `ghostty_list_actions` | List actions bindable to keybindings |
| `ghostty_list_keybinds` | List current keybindings |
| `ghostty_list_colors` | List named colors |
| `ghostty_show_face` | Show which font face renders specific characters |

## Requirements

- [Bun](https://bun.sh) runtime
- [Ghostty](https://ghostty.org) installed and available in PATH

## Setup

```bash
git clone https://github.com/shyuan/ghostty-config-mcp.git
cd ghostty-config-mcp
bun install
```

### Register with Claude Code

Add to `.mcp.json` in your project directory (or Ghostty config directory):

```json
{
  "mcpServers": {
    "ghostty-config": {
      "command": "bun",
      "args": ["run", "/path/to/ghostty-config-mcp/src/index.ts"]
    }
  }
}
```

## Architecture

```
src/
├── index.ts          # MCP server entry point (StdioServerTransport)
├── lib/
│   ├── exec.ts       # Bun.spawn wrapper for ghostty CLI
│   └── parsers.ts    # CLI output parsers (8 parsers)
└── tools/            # One file per tool (11 tools)
```

- Config docs are cached in-memory keyed by Ghostty version (~120 KB, shared by search and get tools)
- All CLI execution goes through `exec.ts` with a 10s default timeout
- Never writes to `process.stdout` (reserved for MCP stdio transport)

## License

MIT
