# UI layer sketch

The ViewModel owns state and actions. The View only draws what the ViewModel says.

```dart
class AccountViewModel extends ChangeNotifier {
  AccountViewModel({required AccountRepository repository})
      : _repository = repository;

  final AccountRepository _repository;

  Account? _account;
  Account? get account => _account;

  bool _busy = false;
  bool get busy => _busy;

  Future<void> open(String accountId) async {
    _busy = true;
    notifyListeners();
    try {
      _account = await _repository.load(accountId);
    } finally {
      _busy = false;
      notifyListeners();
    }
  }
}

class AccountView extends StatelessWidget {
  const AccountView({super.key, required this.model});

  final AccountViewModel model;

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: model,
      builder: (context, _) {
        if (model.busy) {
          return const Center(child: CircularProgressIndicator());
        }
        final account = model.account;
        if (account == null) {
          return const Center(child: Text('Nothing to show'));
        }
        return Column(
          children: [
            Text(account.displayName),
            TextButton(
              onPressed: () => model.open(account.id),
              child: const Text('Reload'),
            ),
          ],
        );
      },
    );
  }
}
```

Notes:
- Add an error field to the ViewModel and a branch in the View, or the failure path goes silent.
- Dispose the ViewModel with whatever created it.
- Keep strings in the localization files in a real app, English only.
