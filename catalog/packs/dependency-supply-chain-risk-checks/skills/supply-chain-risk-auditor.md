---
name: supply-chain-risk-auditor
description: Use to audit a project's dependencies for heightened risk of exploitation or takeover, or to vet a new package before adding it: past CVEs, no security contact, low popularity, lone maintainers. npm, pub, pip across our apps and Python tools; needs gh CLI. Dependency risk before a security audit.
allowed-tools: Read Write Bash Glob Grep
metadata:
  author: Richicinschi
  category: security
---

# Supply chain risk auditor

Review every dependency of a project, flag the ones that are easy to exploit or take over, and write one report that lists only the flagged ones, each with a safer replacement.

## When to use

- Dependency risk before a security audit.
- Sizing the supply chain attack surface of a project.
- Finding unmaintained or risky dependencies.
- Scoping supply chain concerns before an engagement.

## When not to use

- Live vulnerability scanning. Point to `npm audit`, `pip-audit` or similar scanners.
- Analysis of dependencies at runtime.
- Licence compliance checks.

## Before anything else

Check that the `gh` CLI is installed. If it is missing, ask the user to install it and wait. Do not go on without it.

## Setup

1. Create the folder `.supply-chain-risk-auditor` in the project.
2. Copy `resources/results-template.md` into it as `results.md`.
3. Find the git repository of every direct dependency.
4. Make each repository a full URL. If an entry is only `owner/project`, put the GitHub base URL in front of it.

## Audit

Judge each dependency whose repository you found against the six criteria below.

- Get every number (stars, open issues, and so on) from `gh`. Never estimate. Each figure in the report must be correct.
- You may round a large figure and write it with a leading `~`. Everything else must be exact.
- One criterion is enough to flag a dependency.

### The six criteria

**1. Single maintainer or small group.** One person or a handful keeps it up, and no foundation or company runs it.
- A very prolific, well-known contributor in that ecosystem lowers the risk but does not remove it.
- An anonymous maintainer (GitHub identity not tied to a real person) raises it a lot.
- Why: one bribed or phished person can ship malicious code alone. Precedent: left-pad.

**2. Unmaintained.** Stale for a long time, or deprecated or archived.
- Evidence: a README or issue note saying the project is inactive, understaffed or looking for maintainers; many unanswered bug or security issues.
- Feature requests are not evidence of neglect. Count only bug and security issues.
- Why: vulnerabilities may stay unpatched for a long time.

**3. Low popularity.** Few stars or downloads compared with the other dependencies of the same target.
- Why: fewer users means fewer reviewers, so a malicious change goes unseen longer.

**4. High-risk features.** It does something that is easy to exploit by nature: foreign function interface, deserialisation, running third-party code.
- Why: these dependencies sit at the centre of the target's security and need closer scrutiny.

**5. Past CVEs.** High or critical severity CVEs, especially many for its popularity and size.
- A raw count says little for a hugely popular project: it gets more scrutiny, so more research and more CVEs. Weigh the count against popularity.

**6. No security contact.** None in `.github/SECURITY.md`, `CONTRIBUTING.md`, `README.md` or similar, and none on the project website if there is one.
- Why: someone who finds a flaw cannot report it safely and fast.

## Writing the report

- Put a dependency in the High-Risk Dependencies table of `results.md` only if it meets at least one criterion. Say plainly why it was flagged.
- Keep the report short. Leave low-risk dependencies out completely.
- Add no rows, columns or notes for the opposite of a risk factor (for example "backed by an organisation"). Being absent from the report is the sign of low or no risk.
- Fill the metadata: scan date and time, project name, repositories scanned, total dependencies, scan duration.

## After the audit

1. For each flagged dependency, fill Suggested Alternative with a dependency that does the same or a similar job and is more popular, better maintained or otherwise safer. Prefer a direct successor or drop-in replacement when one exists. Give a short reason for each.
2. Fill the Counts by Risk Factor table with the total per risk factor. Write the overall security posture in the Executive Summary.
3. Summarise the recommendations. The template has no Recommendations heading and you must not add a section it lacks, so put them in the Executive Summary or under Suggested Alternatives.
4. Check the footer: it names this skill as generator and carries the generated-at date and time.
