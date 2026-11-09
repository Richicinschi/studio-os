# Native Android and iOS

For Flutter apps use [Flutter usage](flutter-usage.md). This file is for native code in the same project or a sibling app.

## Android (Kotlin)

### Setup

- Enable the service first with the CLI (`init firestore` is acceptable here only if the user runs it interactively; otherwise use the manual files from [provisioning and deploy](provisioning-and-deploy.md)).
- In the module build file use the Firebase BoM plus the firestore artifact without a version:

```kotlin
dependencies {
    implementation(platform("com.google.firebase:firebase-bom:<latest>"))
    implementation("com.google.firebase:firebase-firestore")
}
```

- Never type a version from memory. Look up the newest BoM and firestore versions in the `maven-metadata.xml` files that Google Maven serves for `com/google/firebase/firebase-bom` and `com/google/firebase/firebase-firestore` (the `<latest>` tag), or, if the dependency is already declared, ask Gradle what is resolved: `./gradlew -q :app:dependencyInsight --dependency firebase-firestore --configuration releaseRuntimeClasspath`.
- Get the instance with `Firebase.firestore`, or for an Enterprise database `FirebaseFirestore.getInstance("<database-name>")`.

### Calls

- Add: `db.collection("members").add(map)`; set with an id: `.document("AMS").set(map)`.
- Read: `.document("UTR").get()` then check `document.exists()`; a query such as `.whereEqualTo("open24h", true).get()`.
- Update: `.document("RTD").update("open24h", true)`; delete: `.document("RTD").delete()`.
- Attach success and failure listeners to each call and log the failure.
- Live data: `addSnapshotListener { snapshot, error -> ... }`; stop on `error`, then loop over `snapshot.documentChanges` and branch on `ADDED`, `MODIFIED`, `REMOVED`.

### Enterprise on Android

Joins, aggregations, counts over many documents and text search must be written with `db.pipeline()`, not with `collection().where()` plus loops. Your summary must name the stages you used (`define`, `addFields`, `search`, `aggregate`). Before using the API:

1. Find the `-sources.jar` that matches the resolved firestore version in the local Gradle or Maven cache.
2. Extract `pipeline.docs.txt` and `expressions.docs.txt` from the root of that jar into a scratch folder, once.
3. Read `pipeline.docs.txt` fully one time, and look into `expressions.docs.txt` only for exact overloads.

In Kotlin the alias call is `.alias(...)` where the web SDK says `.as(...)`, because `as` is a Kotlin keyword. The join and search shapes are the same as in [other platforms](other-platforms.md).

## iOS (Swift)

Two hard rules:

1. Never import or link `FirebaseFirestoreSwift`, the old Swift-extension Firestore module. Since SDK 11 its features (`@DocumentID`, `@ServerTimestamp`, Codable support) live in the main module. Only `import FirebaseFirestore`, and do not add the `FirebaseFirestoreSwift` product to Swift Package Manager or Xcode.
2. Never create the Firestore instance as an inline property of an object that might be built before `FirebaseApp.configure()` runs. A `let db = Firestore.firestore()` in an observable class created as state in the app root crashes at launch. Use `lazy var db`, or create the manager after configuration.

Add the Swift package to the Xcode project by hand through the package manager.

### Instance

- Standard: `Firestore.firestore()`.
- Enterprise: the database id is mandatory, `Firestore.firestore(database: "<database-id>")`.

### Calls

- Models are `Codable` structs with an optional `@DocumentID var id: String?`.
- Write: `try db.collection("members").addDocument(from: member)`.
- Read: `try await db.collection("members").getDocuments()`, then `try? doc.data(as: Member.self)`.
- Enterprise pipelines: `db.pipeline().collection("movies").where(Field("score").equal(9)).execute()`; `db.pipeline().database().execute()` reads across every collection.

### Live listeners in SwiftUI

Do not stop a listener in `.onDisappear`: showing a sheet or full-screen cover can trigger it, and the feed would freeze until the view reappears and nothing restarts it. Instead:

- Keep the listener registration in an observable manager with `startListening(for:)` (removes any previous registration first) and `stopListening()`.
- Call `stopListening()` in the manager's `deinit` so cleanup follows the object's life.
- Start it from the view with `.task(id: userId)`, which reruns when the id changes. Call `stopListening()` when the id becomes nil.
- Enterprise: use the database-specific instance, not the default one.
