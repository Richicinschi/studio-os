# Auth on iOS (Swift)

## The rule that prevents a launch crash

`FirebaseApp.configure()` must have run before any `Auth.auth()` call. So:

- Never write `let auth = Auth.auth()` as a stored property on a type that can be built earlier than `configure()`. Example of the crash: an `@Observable` `SessionStore` class with `let auth = Auth.auth()`, created as `@State` in the App struct.
- Safe ways: declare it `lazy var auth = Auth.auth()`, or build the manager only after `configure()` has returned (for example in the app delegate, then pass it in).
- Do not create Auth-holding objects in `@State` at the App root.

## 1. Add the SDK

Add the `FirebaseAuth` product with Swift Package Manager (File, Add Package Dependencies, pick the Firebase package, tick FirebaseAuth), then:

```swift
import FirebaseAuth
```

## 2. Watch auth state

The listener is the dependable way to know if someone is signed in.

```swift
var listener: AuthStateDidChangeListenerHandle?

listener = Auth.auth().addStateDidChangeListener { _, user in
    if let user {
        print("current uid: \(user.uid)")
    } else {
        print("nobody here")
    }
}

// when the owner goes away:
if let listener { Auth.auth().removeStateDidChangeListener(listener) }
```

## 3. Email and password with async/await

Prefer `async/await` over nested completion handlers.

```swift
func register(email: String, password: String) async {
    do {
        let result = try await Auth.auth().createUser(withEmail: email, password: password)
        print("registered \(result.user.uid)")
    } catch {
        print("sign-up failed: \(error.localizedDescription)")
    }
}

func login(email: String, password: String) async {
    do {
        let result = try await Auth.auth().signIn(withEmail: email, password: password)
        print("logged in \(result.user.uid)")
    } catch {
        print("log-in failed: \(error.localizedDescription)")
    }
}
```

## 4. Sign out

```swift
do {
    try Auth.auth().signOut()
} catch {
    print("could not sign out: \(error)")
}
```
