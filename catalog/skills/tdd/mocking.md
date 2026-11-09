# When to use a test double

Replace things only at the edge of your system:

- Third-party services (payments, mail, push)
- Databases, though a throwaway test database is often better
- The clock and random numbers
- The file system, in some cases

Leave these real:

- Your own classes and modules
- Collaborators inside your code
- Anything you can control

## Make the edges easy to replace

### 1. Pass dependencies in

Hand the outside thing to the function. Do not build it inside.

```dart
// Easy to replace in a test
Future<Receipt> sendReceipt(Order order, MailClient mail) {
  return mail.send(order.email, renderReceipt(order));
}

// Hard to replace: builds its own client from a secret
Future<Receipt> sendReceipt(Order order) {
  final mail = SmtpClient(Platform.environment['SMTP_PASS']!);
  return mail.send(order.email, renderReceipt(order));
}
```

### 2. One function per outside operation

Give each remote call its own named function. Avoid one catch-all function that branches on its arguments.

```dart
// GOOD: each call can be faked on its own
class WeatherApi {
  Future<Forecast> forecastFor(String city) => _get('/forecast/$city');
  Future<List<Alert>> alertsFor(String region) => _get('/alerts/$region');
  Future<void> subscribe(Subscription s) => _post('/subscriptions', s);
}

// BAD: the fake must inspect the path to decide what to return
class WeatherApi {
  Future<dynamic> request(String path, {Object? body}) => _send(path, body);
}
```

What you gain from the first shape:

- Each fake returns exactly one shape.
- Test setup has no branching.
- You can see at a glance which calls a test relies on.
- Types are checked per call.
