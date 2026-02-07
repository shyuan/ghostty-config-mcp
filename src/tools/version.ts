import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { exec } from "../lib/exec.ts";

export function registerVersion(server: McpServer) {
  server.tool("ghostty_version", "Show the installed Ghostty version and build info", async () => {
    const { stdout, stderr, exitCode } = await exec(["--version"]);
    if (exitCode !== 0) {
      return { content: [{ type: "text", text: `Error: ${stderr}` }], isError: true };
    }
    return { content: [{ type: "text", text: stdout.trim() }] };
  });
}
