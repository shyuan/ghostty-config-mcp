import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { exec } from "../lib/exec.ts";
import { parseActionList } from "../lib/parsers.ts";

export function registerListActions(server: McpServer) {
  server.tool(
    "ghostty_list_actions",
    "List actions that can be bound to keybindings in Ghostty",
    {
      search: z.string().optional().describe("Filter actions by name or docs (case-insensitive substring match)"),
    },
    async ({ search }) => {
      const { stdout, stderr, exitCode } = await exec(["+list-actions", "--docs"]);
      if (exitCode !== 0) {
        return { content: [{ type: "text", text: `Error: ${stderr}` }], isError: true };
      }

      let actions = parseActionList(stdout);
      if (search) {
        const q = search.toLowerCase();
        actions = actions.filter(
          (a) =>
            a.action.toLowerCase().includes(q) ||
            a.docs.toLowerCase().includes(q),
        );
      }

      if (actions.length === 0) {
        return { content: [{ type: "text", text: "No actions found matching the search." }] };
      }

      const text = actions
        .map((a) => `**${a.action}**\n${a.docs}`)
        .join("\n\n");

      return { content: [{ type: "text", text }] };
    },
  );
}
