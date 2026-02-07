import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerVersion } from "./tools/version.ts";
import { registerSearchConfigDocs } from "./tools/search-config-docs.ts";
import { registerGetConfigOption } from "./tools/get-config-option.ts";
import { registerShowCurrentConfig } from "./tools/show-current-config.ts";
import { registerValidateConfig } from "./tools/validate-config.ts";
import { registerListFonts } from "./tools/list-fonts.ts";
import { registerListThemes } from "./tools/list-themes.ts";
import { registerListActions } from "./tools/list-actions.ts";
import { registerListKeybinds } from "./tools/list-keybinds.ts";
import { registerListColors } from "./tools/list-colors.ts";
import { registerShowFace } from "./tools/show-face.ts";

const server = new McpServer({
  name: "ghostty-config",
  version: "1.0.0",
});

// Register all tools
registerVersion(server);
registerSearchConfigDocs(server);
registerGetConfigOption(server);
registerShowCurrentConfig(server);
registerValidateConfig(server);
registerListFonts(server);
registerListThemes(server);
registerListActions(server);
registerListKeybinds(server);
registerListColors(server);
registerShowFace(server);

// Start stdio transport
const transport = new StdioServerTransport();
await server.connect(transport);
console.error("ghostty-config MCP server started");
