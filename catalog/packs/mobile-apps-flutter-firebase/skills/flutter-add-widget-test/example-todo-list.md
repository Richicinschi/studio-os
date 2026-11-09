# Example: testing a todo list widget

Widget under test, `lib/todo_list.dart`: a text field, a list of entries, and a floating button that appends the typed text and clears the field. Each entry can be swiped away.

```dart
import 'package:flutter/material.dart';

class TodoList extends StatefulWidget {
  const TodoList({super.key});

  @override
  State<TodoList> createState() => _TodoListState();
}

class _TodoListState extends State<TodoList> {
  final items = <String>[];
  final input = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: Scaffold(
        body: Column(children: [
          TextField(controller: input),
          Expanded(
            child: ListView.builder(
              itemCount: items.length,
              itemBuilder: (context, i) => Dismissible(
                key: ValueKey('${items[i]}-$i'),
                onDismissed: (_) => setState(() => items.removeAt(i)),
                child: ListTile(title: Text(items[i])),
              ),
            ),
          ),
        ]),
        floatingActionButton: FloatingActionButton(
          onPressed: () => setState(() {
            items.add(input.text);
            input.clear();
          }),
          child: const Icon(Icons.add),
        ),
      ),
    );
  }
}
```

Test, `test/todo_list_test.dart`. The widget already contains its own `MaterialApp`, so no wrapper is needed.

```dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:demo_app/todo_list.dart';

void main() {
  testWidgets('adds a todo, then swipes it away', (tester) async {
    await tester.pumpWidget(const TodoList());
    expect(find.byType(ListTile), findsNothing);

    await tester.enterText(find.byType(TextField), 'Water the plants');
    await tester.tap(find.byType(FloatingActionButton));
    await tester.pump(); // one frame is enough for a setState
    expect(find.text('Water the plants'), findsOneWidget);

    await tester.drag(find.byType(Dismissible), const Offset(400, 0));
    await tester.pumpAndSettle(); // the dismiss animation needs many frames
    expect(find.text('Water the plants'), findsNothing);
  });
}
```

Replace `demo_app` with the package name from `pubspec.yaml`. Run with `flutter test test/todo_list_test.dart`.
