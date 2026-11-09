# Writing tests that earn their keep

Read this when you write or edit a test, add a mock or fake, or add a helper that only tests use.

## Two rules

```
1. Each test names the bug it would catch.
2. Each test runs the real code.
```

Working test-first delivers both almost automatically. You saw the test fail against real code, so it has proven it can fail. A double enters only when the real dependency is slow or lives outside the process.

## Rule 1: name the bug

Before typing the body, ask which edit to the production code ought to turn this test red, and whether that edit would be a bug or a deliberate decision. Keep a test when it would catch a wrong branch, a dropped side effect, a bad argument, a boundary case or a broken contract.

**Work out expected values by hand.** Write literals, or fixtures you verified yourself. A table of inputs paired with literal outputs is the best form. When the code under test, or a helper of it, produces the expected value, any behavior at all satisfies the check.

```typescript
// BAD: the same formatter produces both sides, so this is always true
const want = formatPrice({ cents: 1999, currency: 'EUR' });
expect(formatPrice({ cents: 1999, currency: 'EUR' })).toBe(want);

// GOOD: the literal was worked out by hand
expect(formatPrice({ cents: 1999, currency: 'EUR' })).toBe('EUR 19.99');
```

**No change detectors; never write one.** If a test can only fail when someone makes a deliberate choice (a constant's value, the exact wording of a message, a private layout), it fires during redesigns and stays quiet during bugs. Test the behavior the choice drives. Not `expect(RETRY_LIMIT).toBe(3)`, but: a failing request is retried three times and a fourth try never happens.

**Check behavior, not text.** Finding a given line inside a script, skill or config file only shows that the file contains that line. Run scripts on controlled input and assert on output, side effects or exit codes. Documents meant to steer an agent are judged by how the agent behaves with them (see writing-great-skills). Prose written for people needs no test.

**Test your code, not the framework.** Pin down the contract you create at your edges: the route you register, the query you build, the payload you send. How upstream libraries work is for their maintainers to test, for example checking that a router calls the handler you gave it. If a library surprised you once, add one small test that records the assumption. The same line runs inside your own code: constructors, getters, constants and plain pass-through calls need a test only when they validate, normalise, default, derive, enforce a rule or cause a side effect. Otherwise assert the first visible result that depends on them.

### Gate before writing a test

```
Name the production change that would turn this test red.

  Cannot name one              -> rebuild the test around observable behavior
  "The file's text changed"    -> run the artifact, assert on its effects
  Only a deliberate choice     -> change detector; test what depends on the choice

Is the expected value worked out without the code under test?
  If it reuses that code's logic or helpers:
    swap in a literal or a fixture you verified by hand
```

## Rule 2: run the real thing

**A mock earns no assertions.** If an assertion is satisfied by the presence of the mock and broken by its absence, it says nothing about the real component. Assert on what the real component does. When the mock itself is the subject, unmock it or drop the assertion.

```typescript
// GOOD: checks the real component
expect(screen.getByRole('toolbar')).toBeInTheDocument();

// BAD: checks that a stand-in exists
expect(screen.getByTestId('toolbar-mock')).toBeInTheDocument();
```

Ask yourself two things whenever a test leans on a double: "Am I testing what a mock does?" and "Do I really need a mock here?"

**Mock at the right depth.** List every side effect of the real method before you replace it. Replace only the slow or external part, and keep whatever the test relies on real. If unsure, run the test with the real implementation first and watch what has to happen.

```typescript
// BAD: the fake hides the settings write that the later check reads
vi.mock('PluginRegistry', () => ({
  refreshAndSave: vi.fn().mockResolvedValue(undefined),
}));

// GOOD: fake only the slow network handshake; the settings write stays real
vi.mock('RemoteHandshake');
```

**Make doubles strict.** If the contract includes which arguments are sent, how often, or in what order, check those facts. A permissive fake that says yes to any call tells you nothing. Use a separate fixture or spy for the success, error and malformed paths, so a wrong path cannot sneak through.

**Copy real data in full.** A fake response should have every documented field, not only the ones your test reads. A partial fake passes quietly while the real integration fails on a field you left out.

**Production classes hold production methods.** Cleanup that only tests need belongs in test utilities, never as a `dispose()` on the shipped class. Two checks tell you where a method belongs: do only test files call it, and does the shipped class actually manage that resource's lifetime? Test-only callers or a foreign resource mean it moves to the test side.

**Prefer real parts to elaborate fakes.** When the setup of a fake grows larger than the test, when the fake lacks methods the real part has, or when tests break each time the fake changes, switch to an integration test with real components.

### Gate before adding a double or helper

```
List the real method's side effects. Keep real those the test relies on;
fake only the slow or external layer beneath them.

Fake responses match the full real structure.

A method that only tests call goes into test utilities.

About to assert on the double itself?
  Remove the double or remove the assertion.
```

## Tests belong with the code

The cycle of failing test, minimal code, refactor is what "finished" means. Ship the tests the behavior needs and no more. Trivial code and prose for humans need none. A test written only to satisfy process costs upkeep for as long as it lives.

## The mutation check

Before you finish, imagine breaking the production code in realistic ways. At least one test should fail for each:

- A wrong constant or argument
- The wrong branch taken
- A state change or side effect left out
- An empty or default value returned
- No validation for zero, empty, null, unauthorised or malformed input

A break that no test notices means the behavior is unprotected, or that a test is circular.

## Quick reference

| Situation | Move |
|---|---|
| Writing any test | Name the bug it catches, not a decision |
| Building an expected value | Work it out by hand, never with the code under test |
| Testing a script or a document | Run it, or pressure-test its consumer; never search its text |
| Tempted to test a library | Test your own boundary contract instead |
| Wanting to assert on a fake element | Test the real component or drop the fake |
| About to replace a method | Learn its side effects, fake the slow or external layer |
| Building a fake response | Match the real structure completely |
| Needing cleanup only tests use | Put it in test utilities |
| Fake setup keeps growing | Move to an integration test with real parts |
| Done with a test file | Do the mutation check above |

## Warning signs

- The arranged object and the asserted object are one and the same, so equality is guaranteed.
- The only way the test can fail is a crash or a missing selector.
- It fails on every deliberate change and never on an accidental break.
- Expected values hide behind loops, builders or helpers.
- It searches source text, or checks that a deleted symbol stays deleted.
- It would keep its point even if your code vanished and only the framework remained.
- It was added to raise a coverage number and verifies no outcome or side effect.
- An assertion targets a `*-mock` test id, or fails when the mock is removed.
- Some production method has no caller outside the test folder.
- Most of the test is mock wiring, or you struggle to justify why the mock exists.
- You mock "just to be safe".
