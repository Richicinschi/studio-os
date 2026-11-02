# Rules audit brief (template)

Paste this to a Claude session or subagent, with read-only tools, every few months or after a big change to your setup. Replace `<your setup>` with its folder.

---

Audit `<your setup>` for inconsistencies. Read only: change nothing, commit nothing.

Read everything that states a rule or a routine: the front door (`AGENTS.md` / `CLAUDE.md`), `identity/`, `memory/` (the index and every file), your skills (`.claude/skills/`), your agents, your hooks (`git-hooks/` and any Claude Code hook settings), and any project instruction files.

Find:
1. **Contradictions:** two places stating different rules for the same thing.
2. **Enforcement gaps:** a rule a file says is enforced (by a hook, a setting, a test) that is not, or is enforced differently.
3. **Stale references:** paths, commands, flags, files or tools named but missing; dates or counts that are wrong today.
4. **Routines that break a rule:** a skill or habit whose steps would violate one of your rules if followed literally.
5. **Memory problems:** an index line that disagrees with its file; files with no index line; links to nothing; two memories giving different rules.
6. **Gaps:** a rule with no guidance on how to comply; a hook with no way to test it.

For every finding, quote both sides with `file:line`, say why it matters in one line, propose a one-line fix, and mark it verified or likely. Sort by severity: a rule silently broken first, cosmetic last. Then list what you checked and found consistent.
