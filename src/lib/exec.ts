/**
 * CLI executor for ghostty commands.
 * Uses node:child_process for Bun + Node.js compatibility.
 * NEVER writes to process.stdout (reserved for stdio MCP transport).
 */

import { execFile } from "node:child_process";

export interface ExecResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export function exec(
  args: string[],
  timeoutMs = 10_000,
): Promise<ExecResult> {
  return new Promise((resolve) => {
    execFile("ghostty", args, { timeout: timeoutMs, maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
      resolve({
        stdout: stdout ?? "",
        stderr: stderr ?? "",
        exitCode: error && "code" in error ? (error.code as number) ?? 1 : error ? 1 : 0,
      });
    });
  });
}
