---
name: diagnosing-bugs
description: >-
  Method for hard bugs and performance regressions. Trigger: the user says "diagnose" or "debug
  this", or reports something broken, throwing, failing or slow. The core move: build a tight,
  red-capable feedback loop first, then hypothesise.
metadata:
  category: engineering
  author: Richicinschi
  version: 1.1.0
  domain: systematic bug + perf-regression diagnosis
---
# Diagnosing Bugs

Hard bugs yield to one thing: a command that fails when the bug is present and passes when it is gone. Get that command first. Everything after it is routine. Skip a phase only when that choice is explicitly justified.

## The one rule

```
NO FIX BEFORE THE ROOT CAUSE IS FOUND
```

Do not propose or apply a fix until you know the root cause. "Know" means you have finished phases 1 to 4: a command that goes red, a repro cut to its core, a ranked set of guesses, and a probe that confirmed one of them.

Before you start, read the project's `AGENTS.md`, its `CONTEXT.md` if one exists, and any `DECISIONS.md` or ADR near the code you will touch. They give you the module map and the choices already made.

## Phase 1: Build the feedback loop

This phase is the whole skill. With a sharp pass/fail signal on this exact bug, you will find the cause, because bisecting, hypothesis testing and instrumenting all just feed on that signal. Without one, reading more code will not help. Put a disproportionate share of your effort into this phase. Be aggressive, be creative, and refuse to give up.

### Ways to get a signal, roughly best first

1. A failing test at whatever seam reaches the bug (unit, integration or end to end).
2. A curl or HTTP script against a running dev server.
3. A CLI run on a fixture input, with stdout diffed against a known-good snapshot.
4. A headless browser script (Playwright or Puppeteer) that drives the page and asserts on the DOM, console or network.
5. A replay: save a real request, payload or event log to disk, then push it through the code path alone.
6. A throwaway harness: boot a small slice of the system with its dependencies mocked, and call the buggy path with one function call.
7. A property or fuzz loop for "wrong output sometimes": feed 1000 random inputs and watch for the bad case.
8. A bisection harness for "worked at state A, broken at state B" (commit, dataset, version): script "set up state, check, report" so `git bisect run` can drive it.
9. A differential loop: run one input through the old and new version, or two configs, and diff the results.
10. A human-in-the-loop script, as a last resort. When only a person can click, use `scripts/hitl-loop.template.sh` so their steps are structured and their answers come back to you as data.

### Make the loop tighter

Once any loop exists, improve it on three axes:

- Speed: cache setup, skip unrelated start-up, narrow the test scope.
- Sharpness: assert on the specific symptom, not on "did not crash".
- Determinism: pin the clock, seed the RNG, isolate the filesystem, freeze the network.

A flaky loop that takes 30 seconds is nearly worthless. A deterministic one that takes 2 seconds is a major advantage.

Get the loop right and nine tenths of the work is already done.

### Bugs that come and go

Do not chase a clean repro. Chase a higher failure rate. Run the trigger 100 times, run copies in parallel, add load, shrink the timing window, insert sleeps. A bug that fails half the time can be debugged. One that fails 1% of the time cannot, so keep pushing the rate up.

### No loop possible

Stop. Say so explicitly and list what you tried. Then ask the user for one of: access to an environment where it reproduces, a captured artifact (HAR file, log dump, core dump, a screen recording with timestamps), or permission to add temporary instrumentation in production. Do not start guessing causes without a loop.

### Exit test for phase 1

You are done when you can name one command, which you have run at least once already (paste the invocation and its output), and that is all of these:

- [ ] Red-capable: it runs the real buggy code path and asserts the user's exact symptom. It can fail on this bug and pass once the bug is fixed. "Runs without error" does not count.
- [ ] Deterministic: same result each run (for flaky bugs, a measured and pinned high failure rate).
- [ ] Fast: seconds, not minutes.
- [ ] Runnable by you alone: no human needed, except through the hitl template.

If you notice yourself reading code to build a theory before that command exists, stop. Theorising too early is exactly the mistake this skill exists to prevent. No red-capable command means no phase 2.

## Phase 2: Reproduce, then shrink

Run the loop and watch it fail. Check three things:

- [ ] It shows the failure the user described, not a neighbouring one. A wrong bug means a wrong fix.
- [ ] It fails again on repeat runs (or often enough, for an intermittent bug).
- [ ] You have recorded the exact symptom (error text, bad output, timing) so later phases can check the fix against it.

Then shrink. Find the smallest scenario that still fails. Remove inputs, callers, config, data and steps one at a time, rerunning after each removal, and keep only what the failure needs. A small repro leaves fewer suspects for phase 3, and it becomes the regression test in phase 5.

You are finished shrinking when removing any single remaining piece turns the loop green. Do not move on until the bug is both reproduced and shrunk.

## Phase 3: Hypothesise

Write down 3 to 5 candidate causes, ranked, before you test any. One candidate at a time makes you anchor on whatever came to mind first.

Each candidate must be falsifiable, so it has to make a prediction:

> If <X> is the cause, then <changing Y> makes the bug vanish, or <changing Z> makes it worse.

A candidate with no prediction is a hunch. Sharpen it or drop it.

Show the ranked list to the user before you test. They may know a deploy touched candidate 3, or have already ruled one out. It costs little and can save hours. If they are away, go ahead with your own ranking.

## Phase 4: Instrument

Every probe must test one prediction from phase 3. Change one variable at a time.

Prefer tools in this order:

1. A debugger or REPL, where the environment allows. One breakpoint can replace ten log lines.
2. Targeted logs placed at the boundaries that separate the candidates.
3. Never "log everything and grep".

Give every debug log line a unique tag such as `[DEBUG-7c1e]`. Removal is then one search. Untagged logs get shipped; tagged ones get deleted.

Performance bugs differ. Logs are usually the wrong instrument for them. Take a baseline measurement first (a timing harness, `performance.now()`, a profiler, a query plan), then bisect against it. Measure before you fix.

## Phase 5: Fix and lock it in

Write the regression test before the fix, but only at a seam that is right for it. A right seam exercises the real bug pattern the way production reaches it. A seam that is too shallow gives false comfort: a single-caller test for a bug that needs several callers, or a unit test that cannot rebuild the chain of events that caused the failure.

If no right seam exists, that is a finding in itself. Record it: the architecture is stopping the bug from being pinned down. Carry that into the post-mortem.

When a right seam exists:

1. Turn the shrunk repro into a failing test there.
2. Run it and watch it fail.
3. Make the fix.
4. Run it and watch it pass.
5. Rerun the phase 1 loop on the original, unshrunk scenario.

## Phase 6: Clean up and learn

Required before you declare it done:

- [ ] The original repro no longer fails (rerun the phase 1 loop).
- [ ] The regression test passes, or the missing seam is written down.
- [ ] Every `[DEBUG-...]` line is gone (search for the tag).
- [ ] Throwaway prototypes are deleted, or moved somewhere clearly labelled as debug.
- [ ] The commit or PR message names the hypothesis that proved right, so the next person learns from it.

Then ask what would have stopped this bug from existing. If the answer is structural (no test seam, tangled callers, hidden coupling), hand the details to the `improve` skill. Make that recommendation after the fix lands, when you know more than you did at the start.

## Warning signs: stop and go back to phase 1

If any of these thoughts show up, stop:

- "Patch it now, look into it later."
- "Change X and see what happens."
- "Bundle a few changes and run the tests."
- "I will skip the test and check by hand."
- "It is probably X, so I will fix X."
- "I do not really get it, but this might work."
- "The pattern says X, but I will bend it."
- Announcing "Here are the main problems:" and listing fixes before any investigation.
- Proposing a solution before tracing the data flow.
- "Just one more attempt", when you have already tried two or more.
- Each fix exposing a fresh problem somewhere else.

All of these mean: return to phase 1.

After three failed fixes, stop fixing. Raise the design itself with your human partner before a fourth try.

## Excuses and the reply to each

| Excuse | Reply |
|--------|-------|
| "It is a simple bug, no process needed." | Simple bugs have causes too, and the process is quick when the bug is simple. |
| "It is an emergency, no time." | Guess-and-check thrashing takes longer than the method. |
| "Try this first, investigate after." | The first patch sets the pattern for everything after it. Start correctly. |
| "I will write the test once the fix works." | A fix with no test behind it does not last. Writing the test first shows it can fail. |
| "Several fixes at once saves time." | You cannot isolate what worked, and it causes new bugs. |
| "The reference is long, I will adapt the pattern." | If you only half understand a pattern, you will get it wrong. Read all of it. |
| "I can see the problem, let me fix it." | Seeing a symptom is not understanding the cause. |
| "One more try" after two failures. | Three or more failures mean an architectural problem. Question the design instead of patching again. |

## Deeper techniques

These files sit in `references/`:

- [`root-cause-tracing.md`](references/root-cause-tracing.md): walk a failure back up the call chain to where the bad value began. It includes `find-polluter.sh`, a script that finds the test leaving stray state behind.
- [`defense-in-depth.md`](references/defense-in-depth.md): after the cause is fixed, add checks at each layer the data crosses.
- [`condition-based-waiting.md`](references/condition-based-waiting.md): swap fixed sleeps for polling on a condition. The worked code is `condition-based-waiting-example.ts`.
