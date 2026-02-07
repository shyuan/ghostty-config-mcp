import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { exec } from "../lib/exec.ts";
import { type ConfigDocEntry, parseConfigDocs } from "../lib/parsers.ts";

// ── In-memory cache keyed by version ───────────────────────────────

let cachedVersion = "";
let cachedEntries: ConfigDocEntry[] = [];

export async function getConfigDocsCache(): Promise<ConfigDocEntry[]> {
  const { stdout: verOut } = await exec(["--version"]);
  const version = verOut.split("\n")[0].trim();

  if (version === cachedVersion && cachedEntries.length > 0) {
    return cachedEntries;
  }

  const { stdout, exitCode, stderr } = await exec(["+show-config", "--default", "--docs"], 30_000);
  if (exitCode !== 0) {
    throw new Error(`Failed to load config docs: ${stderr}`);
  }

  cachedVersion = version;
  cachedEntries = parseConfigDocs(stdout);
  return cachedEntries;
}

export function registerGetConfigOption(server: McpServer) {
  server.tool(
    "ghostty_get_config_option",
    "Get full documentation for a specific Ghostty config option. Supports fuzzy matching if exact key is not found.",
    {
      key: z.string().describe("The config option key (e.g. 'scrollback-limit', 'font-size')"),
    },
    async ({ key }) => {
      const entries = await getConfigDocsCache();

      // Exact match first
      let entry = entries.find((e) => e.key === key);

      // Fuzzy: case-insensitive match
      if (!entry) {
        entry = entries.find((e) => e.key.toLowerCase() === key.toLowerCase());
      }

      // Fuzzy: partial match
      if (!entry) {
        const q = key.toLowerCase();
        const candidates = entries.filter((e) => e.key.toLowerCase().includes(q));
        if (candidates.length === 1) {
          entry = candidates[0];
        } else if (candidates.length > 1) {
          const list = candidates.map((c) => c.key).join(", ");
          return {
            content: [{
              type: "text",
              text: `Multiple config options match "${key}": ${list}\n\nPlease specify the exact key.`,
            }],
          };
        }
      }

      if (!entry) {
        return {
          content: [{ type: "text", text: `Config option "${key}" not found.` }],
        };
      }

      const text = `## ${entry.key}\nDefault: \`${entry.defaultValue || "(empty)"}\`\n\n${entry.docs}`;
      return { content: [{ type: "text", text }] };
    },
  );
}
