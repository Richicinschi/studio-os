# Data layer sketch

A service talks to the outside world and knows nothing about the app. A repository turns its raw output into the app's own types and remembers results.

```dart
// Service: one call, raw model out.
class AccountApi {
  Future<AccountDto> fetch(String accountId) async {
    // HTTP GET, parse JSON into AccountDto.
    throw UnimplementedError();
  }
}

// Repository: owns the cache and the mapping.
class AccountRepository {
  AccountRepository({required AccountApi api}) : _api = api;

  final AccountApi _api;
  final Map<String, Account> _byId = {};

  Future<Account> load(String accountId) async {
    final hit = _byId[accountId];
    if (hit != null) return hit;

    final dto = await _api.fetch(accountId);
    final account = Account(id: dto.id, displayName: dto.fullName);
    _byId[accountId] = account;
    return account;
  }
}
```

Notes:
- The DTO type never leaves the data layer. Callers only see `Account`.
- Add retry, expiry and offline fallback inside the repository, not in the service.
- Return a Result type from the service if you want errors as values instead of exceptions.
