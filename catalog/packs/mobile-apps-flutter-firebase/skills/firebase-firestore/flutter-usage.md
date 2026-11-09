# Firestore in Flutter

## Setup

Run `flutter pub add cloud_firestore`, and make sure FlutterFire is configured for every platform you ship.

For an Enterprise database the default instance is wrong. Ask for the instance by database id:

```dart
final db = FirebaseFirestore.instanceFor(
  app: Firebase.app(),
  databaseId: 'tasks-db',
);
```

For Standard with the default database, `FirebaseFirestore.instance` is enough.

## Typed model, not raw maps

Do not pass `Map<String, dynamic>` through the UI. Give each document type a class that converts both ways.

```dart
import 'package:cloud_firestore/cloud_firestore.dart';

class Task {
  const Task({required this.id, required this.title, required this.ownerId, required this.created});

  final String id;
  final String title;
  final String ownerId;
  final DateTime created;

  factory Task.fromDoc(DocumentSnapshot<Map<String, dynamic>> doc) {
    final d = doc.data() ?? const <String, dynamic>{};
    final ts = d['created'];
    return Task(
      id: doc.id,
      title: (d['title'] as String?) ?? '',
      ownerId: (d['ownerId'] as String?) ?? '',
      created: ts is Timestamp ? ts.toDate() : DateTime.now(),
    );
  }

  Map<String, Object?> toMap() => {
        'title': title,
        'ownerId': ownerId,
        'created': Timestamp.fromDate(created),
      };
}
```

## One service class per collection

Keep every database call in a repository so screens stay free of Firestore and tests can swap it.

```dart
class TaskRepository {
  TaskRepository(this._db);
  final FirebaseFirestore _db;

  CollectionReference<Map<String, dynamic>> get _col => _db.collection('tasks');

  Future<void> add(Task t) => _col.add(t.toMap());

  Future<List<Task>> loadFor(String ownerId) async {
    final snap = await _col
        .where('ownerId', isEqualTo: ownerId)
        .orderBy('created', descending: true)
        .get();
    return snap.docs.map(Task.fromDoc).toList();
  }

  Stream<List<Task>> watch(String ownerId) => _col
      .where('ownerId', isEqualTo: ownerId)
      .snapshots()
      .map((s) => s.docs.map(Task.fromDoc).toList()
        ..sort((a, b) => b.created.compareTo(a.created)));

  Future<void> rename(String id, String title) => _col.doc(id).update({'title': title});

  Future<void> remove(String id) => _col.doc(id).delete();
}
```

Notes:

- Let errors travel up to the caller so the screen can show them. Swallowing them with a print hides failures.
- The sort inside `watch` runs on the device. It is a stopgap for prototyping while the composite index is missing. Once the index is deployed, move the `orderBy` into the query (see [indexes](indexes.md)).
- Cancel any manual `listen` subscription in `dispose`. A `StreamBuilder` does that for you.

## Showing a stream

```dart
StreamBuilder<List<Task>>(
  stream: repo.watch(uid),
  builder: (context, snap) {
    if (snap.hasError) return const Center(child: Text('Could not load tasks'));
    if (!snap.hasData) return const Center(child: CircularProgressIndicator());
    final tasks = snap.data!;
    if (tasks.isEmpty) return const Center(child: Text('Nothing here yet'));
    return ListView.builder(
      itemCount: tasks.length,
      itemBuilder: (_, i) => ListTile(
        title: Text(tasks[i].title),
        trailing: IconButton(
          icon: const Icon(Icons.delete),
          onPressed: () => repo.remove(tasks[i].id),
        ),
      ),
    );
  },
)
```

Handle all four states: error, waiting, empty, data.
