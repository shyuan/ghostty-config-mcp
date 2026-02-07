import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { exec } from "../lib/exec.ts";
import { parseKeybindList } from "../lib/parsers.ts";

export function registerListKeybinds(server: McpServer) {
  server.tool(
    "ghostty_list_keybinds",
    "List current keybindings in Ghostty",
    {
      default: z.boolean().optional().describe("If true, show default keybindings instead of current"),
      search: z.string().optional().describe("Filter keybinds by keys or action name (case-insensitive)"),
    },
    async (params) => {
      const args = ["+list-keybinds", "--plain"];
      if (params.default) {
        args.push("--default");
      }

      const { stdout, stderr, exitCode } = await exec(args);
      if (exitCode !== 0) {
        return { content: [{ type: "text", text: `Error: ${stderr}` }], isError: true };
      }

      let keybinds = parseKeybindList(stdout);
      if (params.search) {
        const q = params.search.toLowerCase();
        keybinds = keybinds.filter(
          (k) =>
            k.keys.toLowerCase().includes(q) ||
            k.action.toLowerCase().includes(q) ||
            (k.params?.toLowerCase().includes(q) ?? false),
        );
      }

      if (keybinds.length === 0) {
        return { content: [{ type: "text", text: "No keybindings found matching the search." }] };
      }

      const text = keybinds
        .map((k) => {
          const action = k.params ? `${k.action}:${k.params}` : k.action;
          return `${k.keys} → ${action}`;
        })
        .join("\n");

      return { content: [{ type: "text", text }] };
    },
  );
}
