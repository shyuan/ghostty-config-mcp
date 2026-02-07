import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getConfigDocsCache } from "./get-config-option.ts";

export function registerSearchConfigDocs(server: McpServer) {
  server.tool(
    "ghostty_search_config_docs",
    "Search Ghostty configuration documentation by keyword. Returns matching config options with their docs and default values.",
    {
      keyword: z.string().describe("Keyword to search for in config option names and documentation"),
      max_results: z.number().optional().describe("Maximum number of results to return (default: 10)"),
    },
    async ({ keyword, max_results }) => {
      const entries = await getConfigDocsCache();
      const q = keyword.toLowerCase();
      const limit = max_results ?? 10;

      const matches = entries
        .filter(
          (e) =>
            e.key.toLowerCase().includes(q) ||
            e.docs.toLowerCase().includes(q),
        )
        .slice(0, limit);

      if (matches.length === 0) {
        return {
          content: [{ type: "text", text: `No config options found matching "${keyword}".` }],
        };
      }

      const text = matches
        .map(
          (m) =>
            `## ${m.key}\nDefault: \`${m.defaultValue || "(empty)"}\`\n\n${m.docs}`,
        )
        .join("\n\n---\n\n");

      return { content: [{ type: "text", text }] };
    },
  );
}
