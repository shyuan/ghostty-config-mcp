# ghostty-config-mcp

MCP server for managing [Ghostty](https://ghostty.org) terminal emulator configuration.

Works with [Claude Code](https://docs.anthropic.com/en/docs/claude-code) and any MCP-compatible client.

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

- [Ghostty](https://ghostty.org) installed and available in PATH
- Node.js 18+ (or [Bun](https://bun.sh) for development)

## Setup

### As a Claude Code Plugin (Recommended)

See [ghostty-config-plugin](https://github.com/shyuan/ghostty-config-plugin) for one-command installation.

### Standalone MCP Server

```bash
git clone https://github.com/shyuan/ghostty-config-mcp.git
cd ghostty-config-mcp
bun install
bun run build
```

Add to `.mcp.json` in your project directory:

```json
{
  "mcpServers": {
    "ghostty-config": {
      "command": "node",
      "args": ["/path/to/ghostty-config-mcp/dist/index.js"]
    }
  }
}
```

## Architecture

```
src/
├── index.ts          # MCP server entry point (StdioServerTransport)
├── lib/
│   ├── exec.ts       # node:child_process wrapper for ghostty CLI
│   └── parsers.ts    # CLI output parsers (8 parsers)
└── tools/            # One file per tool (11 tools)
```

- Config docs are cached in-memory keyed by Ghostty version (~120 KB, shared by search and get tools)
- All CLI execution goes through `exec.ts` with a 10s default timeout
- Uses `node:child_process` for Bun + Node.js dual compatibility
- Never writes to `process.stdout` (reserved for MCP stdio transport)

## License

MIT

---

# ghostty-config-mcp（中文說明）

用於管理 [Ghostty](https://ghostty.org) 終端模擬器設定的 MCP server。

可搭配 [Claude Code](https://docs.anthropic.com/en/docs/claude-code) 或任何支援 MCP 的用戶端使用。

## 提供的工具

| 工具 | 說明 |
|------|------|
| `ghostty_version` | 顯示 Ghostty 版本與建置資訊 |
| `ghostty_search_config_docs` | 用關鍵字搜尋設定文件 |
| `ghostty_get_config_option` | 取得特定設定項的完整文件（支援模糊匹配） |
| `ghostty_show_current_config` | 顯示目前生效的設定（可只看修改項） |
| `ghostty_validate_config` | 驗證設定檔語法 |
| `ghostty_list_fonts` | 列出可用字型家族與字面 |
| `ghostty_list_themes` | 列出可用主題（可篩選深色/淺色） |
| `ghostty_list_actions` | 列出可綁定至快捷鍵的動作 |
| `ghostty_list_keybinds` | 列出目前快捷鍵綁定 |
| `ghostty_list_colors` | 列出具名顏色 |
| `ghostty_show_face` | 查詢特定字元使用的渲染字型 |

## 環境需求

- [Ghostty](https://ghostty.org) 已安裝且在 PATH 中
- Node.js 18+（開發用可改用 [Bun](https://bun.sh)）

## 安裝方式

### 作為 Claude Code Plugin 安裝（推薦）

請參考 [ghostty-config-plugin](https://github.com/shyuan/ghostty-config-plugin)，一行指令即可安裝。

### 獨立 MCP Server

```bash
git clone https://github.com/shyuan/ghostty-config-mcp.git
cd ghostty-config-mcp
bun install
bun run build
```

在專案目錄的 `.mcp.json` 中加入：

```json
{
  "mcpServers": {
    "ghostty-config": {
      "command": "node",
      "args": ["/path/to/ghostty-config-mcp/dist/index.js"]
    }
  }
}
```

## 授權條款

MIT
