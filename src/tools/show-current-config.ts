import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { exec } from "../lib/exec.ts";
import { parseConfigValues } from "../lib/parsers.ts";

export function registerShowCurrentConfig(server: McpServer) {
  server.tool(
    "ghostty_show_current_config",
    "Show the currently active Ghostty configuration. Use changes_only=true to see only user-modified values.",
    {
      changes_only: z.boolean().optional().describe("If true, show only values that differ from defaults"),
    },
    async ({ changes_only }) => {
      const args = ["+show-config"];
      if (changes_only) {
        args.push("--changes-only");
      }

      const { stdout, stderr, exitCode } = await exec(args, 15_000);
      if (exitCode !== 0) {
        return { content: [{ type: "text", text: `Error: ${stderr}` }], isError: true };
      }

      const values = parseConfigValues(stdout);
      if (values.length === 0) {
        return {
          content: [{
            type: "text",
            text: changes_only
              ? "No configuration changes from defaults."
              : "No configuration values found.",
          }],
        };
      }

      const text = values.map((v) => `${v.key} = ${v.value}`).join("\n");
      return { content: [{ type: "text", text }] };
    },
  );
}
