---
name: tdd
description: >-
  Test-driven development (test-first). Use when the user mentions "red-green-refactor" or "tracer bullet", wants behavior-level integration tests, or asks to build a feature or fix a bug test-first. Studio stacks: Flutter runs `flutter test`, Godot runs GUT.
metadata:
  category: engineering
  author: Richicinschi
  version: 1.1.0
  domain: test-driven development workflow
---
# Test-driven development

Build in small loops. Each loop is: a test that fails, then just enough code to make it pass. Tests describe what the software does for its callers. They never describe how it is wired inside.

## The law

```
NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST
```

Put another way: no production code until a test has failed for the right reason.

You wrote code first? Delete it and begin again from a test.

**No exceptions:**

- Do not park it on the side "for reference".
- Do not bend it into shape while you write the test.
- Do not glance at it.
- Deleting means removing it from the tree. Then build again from the tests alone. Final.

Exploring is fine. A spike teaches you the problem. Throw the spike away, then start the loop.

## What a good test is

A good test is integration-style: it calls the public interface and checks a result a caller can see. It reads like a requirement: "a parked car is charged for each started hour". Rewrite the internals and the test still passes, because only the behavior was pinned down.

A bad test is welded to the implementation. It mocks your own classes, calls private helpers, counts calls, or peeks into storage instead of asking the interface. The warning sign is simple: you rename an internal function, behavior is unchanged, and tests go red. Those tests checked structure, not behavior.

Read next, when needed:

- [tests.md](tests.md) for good and bad examples.
- [mocking.md](mocking.md) before you add any test double.
- [writing-good-tests.md](writing-good-tests.md) whenever you write or change a test, add a mock, or add a test-only helper.
- [refactoring.md](refactoring.md) once the tests are green.

## Do not batch the tests

Do not write all the tests first and all the implementation second. The tests come out bad:

- They cover behavior you imagined, not behavior you saw.
- They pin the shape of the data and the function signatures, not what the user gets.
- They stay green when behavior breaks and go red when behavior is fine.
- They lock in a structure before you know what the code needs.

Cut thin vertical slices instead: a single test, then a single piece of code, then round again. Each new test builds on the previous loop. The code is fresh in your head, so you know precisely which behavior counts and how to check it.

```
WRONG (batched):
  all RED:   testA testB testC testD
  all GREEN: codeA codeB codeC codeD

RIGHT (sliced):
  testA -> codeA
  testB -> codeB
  testC -> codeC
```

## The loop

### 1. Plan

Read the project's `AGENTS.md`, plus `CONTEXT.md` if present, so names in tests match the domain language. Respect any decision records near the code you touch.

Before any code, settle these with the user:

- [ ] Which interface changes are needed
- [ ] Which behaviors matter most, in priority order
- [ ] Where a small interface can hide a lot of logic (deep modules)
- [ ] The list of behaviors to cover, written as behaviors and not as implementation chores
- [ ] The user's approval of the whole plan, interface changes included

Ask: "What should the public interface look like, and which behaviors matter most?" Not everything can be tested. Spend effort on critical paths and tricky logic, not on every odd corner.

### 2. Tracer bullet

Pick the single most basic behavior. Write one test for it and watch it fail. Write the least code that passes. This first slice proves the path works from end to end.

### 3. Repeat for the remaining behaviors

```
write the next test -> see it fail -> least code to pass -> see it pass
```

- One test at a time.
- Only the code the current test demands.
- Do not code for tests you have not written.
- Assert on what an observer can see.

### 4. Refactor

When all tests are green, look through the [refactor candidates](refactoring.md):

- [ ] Pull out duplication
- [ ] Hide complexity behind simpler interfaces
- [ ] Apply SOLID where it fits without force
- [ ] Ask what the new code says about the old code
- [ ] Re-run the tests after every small step

Never refactor on red. Get green first.

## Run the tests in this studio

- Flutter: `flutter test` (one file: `flutter test test/parking_fee_test.dart`).
- Godot: GUT, for example `godot --headless -s addons/gut/gut_cmdln.gd -gdir=res://test -gexit`.

Whatever the stack, run the new test alone first and read why it fails. A compile error or a typo is not a real red.

## Check each cycle

```
[ ] The test states a behavior, not a mechanism
[ ] It touches the public interface only
[ ] It would survive an internal rewrite
[ ] The code is the least that passes it
[ ] Nothing speculative slipped in
```

## Check before calling it done

- [ ] Every new function or method has a test
- [ ] You saw each test fail before writing its code
- [ ] Each failure was for the expected reason: the feature was missing, not a typo
- [ ] Each piece of code was the minimum for its test
- [ ] The full suite passes
- [ ] The output is clean: no errors, no warnings
- [ ] Tests run real code; doubles only where unavoidable
- [ ] Edge cases and error paths are covered

A box you cannot tick means TDD was skipped. Start over.

## Excuses and the answers to them

| What you tell yourself | Why it fails |
|---|---|
| "It is too small to need a test." | Small code breaks too, and writing the test takes 30 seconds. |
| "I will add tests afterwards." | A test written later passes on its first run, which proves nothing. It may check the wrong thing, test the implementation instead of the behavior, or skip the case you forgot. Since you never saw it fail, you never learned it can catch a bug. Test-first forces that failure. |
| "Tests afterwards serve the same purpose." | They answer "what does this code do?" Tests first answer "what should it do?" Later tests are shaped by the code you already have, so they confirm what you remembered and miss what you would have found. You get coverage without proof that the tests work. |
| "I already tried it by hand." | A hand check leaves no record, cannot be repeated after the next change, and skips cases when you are rushed. Working once is not the same as being covered. |
| "Throwing away hours of work is wasteful." | Those hours are gone either way. The real choice is a rebuild you can trust or code you cannot trust with tests stapled on. The untrusted code is the waste. |
| "I will keep it for reference and write tests first." | You will end up adapting it, which is testing afterwards. Delete it. |
| "I need to explore first." | Good. Discard the exploration and begin with a test. |
| "This is hard to test, so the design is unclear." | Listen to that. Code that is hard to test is hard to use. Simplify the interface. |
| "TDD is dogmatic; pragmatic people skip it." | TDD is the pragmatic path: bugs die before the commit, regressions are caught, and you can refactor without fear. The "pragmatic" shortcuts end in debugging after release, which is slower. |
| "TDD slows me down." | Over a whole task it is faster. You fix fewer bugs late and re-test less. |
| "A manual check is quicker." | It proves no edge case, and you will repeat it after every change. |
| "The existing code has no tests." | You are changing it now, so you add tests for it now. |

## Warning signs: stop and restart

- Code exists before its test.
- A test was written after the implementation.
- A new test passes on its first run.
- You cannot say why a test failed.
- Tests are postponed to "later".
- You catch yourself saying "just this once".
- "I tested it by hand already."
- "Tests after do the same job."
- "It is about spirit, not ritual."
- "I will keep the old code as a guide" or "I will adapt it."
- "I have spent hours, so deleting is silly."
- "TDD is dogmatic; I'm being pragmatic."
- "This case is different because..."

Any one of these means: delete the code and start over, test first.
