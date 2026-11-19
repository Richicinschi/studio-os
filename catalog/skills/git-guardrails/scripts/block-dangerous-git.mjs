#!/usr/bin/env node
/**
 * PreToolUse hook: reads the hook's JSON on stdin and exits 2 to refuse a destructive git command,
 * 0 to let it run. The logic is in guard.mjs; this file only runs it, every time node runs this
 * file. It fails closed: a hook that crashes lets the command run, so when guard.mjs cannot load
 * (this file copied without its folder) or anything else fails, it refuses a command that names
 * git, read as guard.mjs reads it: tool_input.command, or all of stdin when that is not JSON.
 */
let raw = '';
try {
  for await (const chunk of process.stdin) raw += chunk;
  const { run } = await import('./guard.mjs');
  const { code, stderr } = run(raw);
  if (stderr) process.stderr.write(`${stderr}\n`);
  process.exitCode = code;
} catch (error) {
  let text = raw;
  try {
    const command = JSON.parse(raw)?.tool_input?.command;
    text = typeof command === 'string' ? command : '';
  } catch { /* not JSON: read all of stdin */ }
  if (/\bgit\b|GIT_CONFIG/i.test(text)) {
    process.stderr.write(`BLOCKED: the guard could not read this command (${error?.message ?? error}); ask the user.\n`);
    process.exitCode = 2;
  }
}
