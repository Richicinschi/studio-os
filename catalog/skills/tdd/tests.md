# Good tests and bad tests

## What good looks like

Good tests are integration-style: they go through the real public interface. They do not replace your own parts with fakes.

```dart
// GOOD: checks a result the caller can see
test('a car parked for two hours and ten minutes pays for three hours', () {
  final garage = Garage(hourlyRate: 4);
  final ticket = garage.enter(at: DateTime(2026, 3, 2, 9, 0));
  final fee = garage.fee(ticket, leavingAt: DateTime(2026, 3, 2, 11, 10));
  expect(fee, 12);
});
```

Traits of a good test:

- It covers behavior a caller cares about.
- It uses the public API and nothing else.
- It survives internal rewrites.
- Its name says what happens, not how.
- It checks one logical outcome.

## What bad looks like

Bad tests are tied to internals.

```dart
// BAD: pins down a call, not an outcome
test('fee asks the rate table for the hourly price', () {
  final rates = MockRateTable();   // our own class, not a system edge
  Garage(rates: rates).fee(ticket, leavingAt: t1);
  verify(rates.priceFor(ticket.zone)).called(1);
});
```

Signs of trouble:

- It mocks a collaborator that you own.
- It reaches into private methods.
- It asserts on how often or in what order things were called.
- It breaks on a refactor that changed no behavior.
- Its name describes the mechanism.
- It checks the result through a back door instead of the interface.

```dart
// BAD: goes around the interface to look inside
test('enter stores the ticket', () async {
  await garage.enter(at: t0);
  final rows = await db.rawQuery('SELECT * FROM tickets');
  expect(rows, isNotEmpty);
});

// GOOD: asks the interface for what it stored
test('a ticket issued at entry can be looked up again', () async {
  final ticket = await garage.enter(at: t0);
  final found = await garage.findTicket(ticket.id);
  expect(found.enteredAt, t0);
});
```
