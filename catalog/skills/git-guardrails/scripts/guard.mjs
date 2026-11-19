/**
 * The guard's logic, for block-dangerous-git.mjs (which runs it) and the tests (which import it).
 * It reads only the command (tool_input.command), in the rules of the shell that runs it (tool_name
 * Bash or PowerShell), as the simple commands it runs: a quoted argument stays an argument, a
 * heredoc or here-string is data, `bash -c "…"` and `$( )` are read too. A plain `git push` passes;
 * forced and destructive pushes, history rewrites, discarded work and skipped hooks do not
 * (rules.mjs lists them).
 */
import { commands, modeOf, progOf } from './lib/shell.mjs';
import { refusal, assignsHooksPath } from './rules.mjs';

/** { block, reason? } for one hook payload. `deps.parse` reads the command line (tests swap it). */
export function decide(payload, deps = { parse: commands }) {
  const text = payload?.tool_input?.command;
  if (typeof text !== 'string' || !text.trim()) return { block: false };
  for (const c of deps.parse(text, modeOf(payload.tool_name))) {
    const git = c.argv.length > 0 && progOf(c.argv[0]) === 'git';
    const rule = git ? refusal(c.argv, c.env) : assignsHooksPath(c.argv, c.env) ? 'move or remove the hooks folder (core.hooksPath)' : null;
    if (rule) return { block: true, reason: `hit the rule "${rule}"` };
  }
  return { block: false };
}

/** The message a refused command prints on stderr. */
export const message = (command, reason) => `BLOCKED: '${command}' ${reason}. You are not authorised to run this; ask the user.`;

/**
 * { code, stderr } for the hook's raw stdin: 2 refuses the command, 0 lets it run. A hook that
 * fails lets the command run, so this one fails closed: when it cannot read the payload or the
 * command, it refuses if the text names git (the command's text, or all of stdin when that is not
 * JSON) and allows otherwise. Empty stdin holds no command.
 */
export function run(raw, deps) {
  if (!raw.trim()) return { code: 0, stderr: '' };
  let text = raw;
  try {
    const payload = JSON.parse(raw);
    const command = payload?.tool_input?.command;
    text = typeof command === 'string' ? command : '';
    const { block, reason } = decide(payload, deps);
    return block ? { code: 2, stderr: message(command, reason) } : { code: 0, stderr: '' };
  } catch (error) {
    return /\bgit\b|GIT_CONFIG/i.test(text)
      ? { code: 2, stderr: `BLOCKED: the guard could not read this command (${error?.message ?? error}); ask the user.` }
      : { code: 0, stderr: '' };
  }
}
