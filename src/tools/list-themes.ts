import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { exec } from "../lib/exec.ts";
import { parseThemeList } from "../lib/parsers.ts";

export function registerListThemes(server: McpServer) {
  server.tool(
    "ghostty_list_themes",
    "List available Ghostty themes",
    {
      color: z.enum(["dark", "light", "all"]).optional().describe("Filter by color scheme (dark/light/all). Default: all"),
      search: z.string().optional().describe("Filter themes by name (case-insensitive substring match)"),
    },
    async ({ color, search }) => {
      const args = ["+list-themes", "--plain"];
      if (color && color !== "all") {
        args.push(`--color=${color}`);
      }

      const { stdout, stderr, exitCode } = await exec(args);
      if (exitCode !== 0) {
        return { content: [{ type: "text", text: `Error: ${stderr}` }], isError: true };
      }

      let themes = parseThemeList(stdout);
      if (search) {
        const q = search.toLowerCase();
        themes = themes.filter((t) => t.name.toLowerCase().includes(q));
      }

      return {
        content: [{
          type: "text",
          text: themes.length
            ? themes.map((t) => `${t.name} (${t.source})`).join("\n")
            : "No themes found matching the criteria.",
        }],
      };
    },
  );
}
