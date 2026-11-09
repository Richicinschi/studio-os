# Native Android, native iOS and web

Always use the CLI form `npx -y firebase-tools@latest`. Sign in first (`login`, or `login --no-localhost` on a remote shell). Creating a project or app changes the user's cloud account, so say so and get a yes before running those commands.

## Android

1. Have an Android app module to register. If none exists, create it first.
2. Project, only if there is none yet:
   `projects:create <UNIQUE_PROJECT_ID> --display-name '<NAME>'`
   Pick an ID that is unlikely to collide, for instance with a date suffix.
3. Register the app. The display name is a positional argument at the end:
   `apps:create ANDROID '<LABEL>' --package-name '<APPLICATION_ID>' --project <PROJECT_ID>`
   The label goes last as a bare argument, not behind a flag. The output prints the App ID.
4. Fetch the config with that App ID and save the output as `app/google-services.json`:
   `apps:sdkconfig ANDROID <APP_ID> --project <PROJECT_ID>`
5. Verify: `projects:list`, then `apps:list --project <PROJECT_ID>`.

## iOS

Two rules come before any code.

**State management.** In SwiftUI, default to the Observation framework (`@Observable` with `@State`). Use Combine (`ObservableObject`, `@Published`, `@StateObject`, `@EnvironmentObject`) only when the user asks for it or the existing code clearly relies on it.

**Order of startup.** `FirebaseApp.configure()` must run before any object that touches Firebase is created. In a SwiftUI `App` struct, property initializers run before the body of `init()`, so a state property such as `@State private var auth = SessionStore()` whose initializer uses Firebase will crash with "Default FirebaseApp is not configured". Declare the property without a value, call `configure()` in `init()`, then assign it (or set it up later in `onAppear`).

Steps, all without the console:

1. Create the project if needed: `projects:create`.
2. Read the bundle ID from the Xcode project file or `Info.plist`.
3. Register: `apps:create IOS <bundle-id>`.
4. Fetch: `apps:sdkconfig IOS <APP_ID>`. Save as `GoogleService-Info.plist` in the Xcode project folder, delete any non-XML lines the CLI printed above the plist, and make sure the file belongs to the main app target.
5. Install the Firebase package through Xcode (Add Package Dependencies, Swift Package Manager) and link the plist to the target there. Never edit `.pbxproj` with text tools, sed or Ruby gems. Check the Firebase iOS SDK releases and use the newest version.
6. Start Firebase:

```swift
@main
struct BudgetApp: App {
  @State private var sessionStore: SessionStore

  init() {
    FirebaseApp.configure()                              // runs first
    _sessionStore = State(initialValue: SessionStore())    // only now
  }

  var body: some Scene {
    WindowGroup { ContentView().environment(sessionStore) }
  }
}
```

For a UIKit app, make `FirebaseApp.configure()` the first line of `application(_:didFinishLaunchingWithOptions:)`.

## Web

1. Project if needed: `projects:create`. Register: `apps:create web field-notes-web`. Note the App ID it prints.
2. `npm install firebase`.
3. Get the config object with `apps:sdkconfig <APP_ID>` and paste it into `firebase.js` or `firebase.ts`:

```javascript
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const app = initializeApp({ /* object from sdkconfig */ });
export const auth = getAuth(app);
export { app };
```

4. Use services through the modular API, importing only what you need:

```javascript
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { app } from "./firebase";

const db = getFirestore(app);
const snap = await getDocs(collection(db, "recipes"));
snap.forEach((d) => console.log(d.id, d.data()));
```
