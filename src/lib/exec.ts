/**
 * Bun.spawn wrapper for ghostty CLI execution.
 * NEVER writes to process.stdout (reserved for stdio MCP transport).
 */

export interface ExecResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export async function exec(
  args: string[],
  timeoutMs = 10_000,
): Promise<ExecResult> {
  const proc = Bun.spawn(["ghostty", ...args], {
    stdout: "pipe",
    stderr: "pipe",
  });

  const timer = setTimeout(() => proc.kill(), timeoutMs);

  try {
    const [stdout, stderr] = await Promise.all([
      new Response(proc.stdout).text(),
      new Response(proc.stderr).text(),
    ]);
    const exitCode = await proc.exited;
    return { stdout, stderr, exitCode };
  } finally {
    clearTimeout(timer);
  }
}
