import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { exec } from "../lib/exec.ts";
import { parseColorList } from "../lib/parsers.ts";

export function registerListColors(server: McpServer) {
  server.tool(
    "ghostty_list_colors",
    "List named colors available in Ghostty",
    { search: z.string().optional().describe("Filter colors by name (case-insensitive substring match)") },
    async ({ search }) => {
      const { stdout, stderr, exitCode } = await exec(["+list-colors", "--plain"]);
      if (exitCode !== 0) {
        return { content: [{ type: "text", text: `Error: ${stderr}` }], isError: true };
      }

      let colors = parseColorList(stdout);
      if (search) {
        const q = search.toLowerCase();
        colors = colors.filter((c) => c.name.toLowerCase().includes(q));
      }

      return {
        content: [{
          type: "text",
          text: colors.length
            ? colors.map((c) => `${c.name} = ${c.hex}`).join("\n")
            : "No colors found matching the search.",
        }],
      };
    },
  );
}
