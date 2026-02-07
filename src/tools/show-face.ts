import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { exec } from "../lib/exec.ts";
import { parseShowFace } from "../lib/parsers.ts";

export function registerShowFace(server: McpServer) {
  server.tool(
    "ghostty_show_face",
    "Show which font face Ghostty uses to render specific characters",
    {
      codepoint: z.string().optional().describe("Unicode codepoint to look up (e.g. '0x41' for 'A')"),
      string: z.string().optional().describe("String to look up each character's rendering face"),
      style: z.enum(["regular", "bold", "italic", "bold_italic"]).optional().describe("Font style to check"),
    },
    async ({ codepoint, string: str, style }) => {
      if (!codepoint && !str) {
        return {
          content: [{
            type: "text",
            text: "Please provide either a codepoint (--cp) or a string (--string).",
          }],
          isError: true,
        };
      }

      const args = ["+show-face"];
      if (codepoint) args.push(`--cp=${codepoint}`);
      if (str) args.push(`--string=${str}`);
      if (style) args.push(`--style=${style}`);

      const { stdout, stderr, exitCode } = await exec(args);
      if (exitCode !== 0) {
        return { content: [{ type: "text", text: `Error: ${stderr}` }], isError: true };
      }

      const entries = parseShowFace(stdout);
      if (entries.length === 0) {
        return {
          content: [{ type: "text", text: stdout.trim() || "No face information returned." }],
        };
      }

      const text = entries
        .map((e) => `${e.codepoint} « ${e.char} » → ${e.face}`)
        .join("\n");

      return { content: [{ type: "text", text }] };
    },
  );
}
