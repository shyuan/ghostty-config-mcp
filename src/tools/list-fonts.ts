import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { exec } from "../lib/exec.ts";
import { parseFontList } from "../lib/parsers.ts";

export function registerListFonts(server: McpServer) {
  server.tool(
    "ghostty_list_fonts",
    "List available font families and their faces",
    {
      family: z.string().optional().describe("Filter by family name (case-insensitive substring match)"),
      bold: z.boolean().optional().describe("Only show families with bold faces"),
      italic: z.boolean().optional().describe("Only show families with italic faces"),
      style: z.string().optional().describe("Filter faces by style name (case-insensitive substring match)"),
    },
    async ({ family, bold, italic, style }) => {
      const { stdout, stderr, exitCode } = await exec(["+list-fonts"]);
      if (exitCode !== 0) {
        return { content: [{ type: "text", text: `Error: ${stderr}` }], isError: true };
      }

      let families = parseFontList(stdout);

      if (family) {
        const q = family.toLowerCase();
        families = families.filter((f) => f.family.toLowerCase().includes(q));
      }
      if (bold) {
        families = families.filter((f) =>
          f.faces.some((face) => face.toLowerCase().includes("bold")),
        );
      }
      if (italic) {
        families = families.filter((f) =>
          f.faces.some((face) => face.toLowerCase().includes("italic")),
        );
      }
      if (style) {
        const q = style.toLowerCase();
        families = families.map((f) => ({
          ...f,
          faces: f.faces.filter((face) => face.toLowerCase().includes(q)),
        })).filter((f) => f.faces.length > 0);
      }

      if (families.length === 0) {
        return { content: [{ type: "text", text: "No fonts found matching the criteria." }] };
      }

      const text = families
        .map((f) => `${f.family}\n${f.faces.map((face) => `  ${face}`).join("\n")}`)
        .join("\n\n");

      return { content: [{ type: "text", text }] };
    },
  );
}
