import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { exec } from "../lib/exec.ts";

export function registerValidateConfig(server: McpServer) {
  server.tool(
    "ghostty_validate_config",
    "Validate a Ghostty config file for syntax errors. Without arguments, validates the default config.",
    {
      config_file: z.string().optional().describe("Path to config file to validate (default: user's config)"),
    },
    async ({ config_file }) => {
      const args = ["+validate-config"];
      if (config_file) {
        args.push(`--config-file=${config_file}`);
      }

      const { stdout, stderr, exitCode } = await exec(args);

      if (exitCode !== 0) {
        const errorOutput = (stderr + "\n" + stdout).trim();
        return {
          content: [{
            type: "text",
            text: `Config validation failed:\n\n${errorOutput || "Unknown error (exit code " + exitCode + ")"}`,
          }],
          isError: true,
        };
      }

      const output = (stdout + "\n" + stderr).trim();
      return {
        content: [{
          type: "text",
          text: output || "Config is valid. No errors found.",
        }],
      };
    },
  );
}
