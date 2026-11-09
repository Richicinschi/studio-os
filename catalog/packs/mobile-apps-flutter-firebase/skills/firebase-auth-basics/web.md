# Auth in the browser (JavaScript SDK)

Start from an initialized Firebase app (see `firebase-basics`).

## Setup

```javascript
import { getAuth } from "firebase/auth";
import { app } from "./firebase";

export const auth = getAuth(app);
```

## Emulator

The Auth emulator listens on port 9099 by default. Connect right after creating `auth`, and only on a local host:

```javascript
import { connectAuthEmulator } from "firebase/auth";

if (location.hostname === "localhost") {
  connectAuthEmulator(auth, "http://localhost:9099");
}
```

## Email and password

```javascript
import { createUserWithEmailAndPassword } from "firebase/auth";

try {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  console.log("account created:", cred.user.uid);
} catch (err) {
  console.error(err.code, err.message);
}
```

## Popup sign-in with a provider

All popup flows have one shape: build a provider, call `signInWithPopup(auth, provider)`, read `result.user`, and catch errors.

| Provider | Constructor | Credential helper |
|---|---|---|
| Google | `new GoogleAuthProvider()` | `GoogleAuthProvider.credentialFromResult(result)` gives `accessToken` |
| Facebook | `new FacebookAuthProvider()` | `FacebookAuthProvider.credentialFromResult` |
| GitHub | `new GithubAuthProvider()` | `GithubAuthProvider.credentialFromResult` |
| Twitter | `new TwitterAuthProvider()` | `TwitterAuthProvider.credentialFromResult` gives `accessToken` and `secret` |
| Apple | `new OAuthProvider("apple.com")` | `OAuthProvider.credentialFromResult` |
| Microsoft | `new OAuthProvider("microsoft.com")` | `OAuthProvider.credentialFromResult` |
| Yahoo | `new OAuthProvider("yahoo.com")` | `OAuthProvider.credentialFromResult` |

```javascript
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";

try {
  const result = await signInWithPopup(auth, new GoogleAuthProvider());
  const googleToken = GoogleAuthProvider.credentialFromResult(result)?.accessToken;
  console.log(result.user.uid, googleToken ? "token received" : "");
} catch (err) {
  console.error(err.code);
}
```

Each provider must be enabled first (console, or the `auth` block of `firebase.json` for the three the CLI supports).

### Troubleshooting `unauthorized-domain`

The popup opens and closes immediately: the page host is not authorized. Add it under Authentication settings, Authorized domains in the console, or, once you have confirmed in the vendor's current documentation that your CLI accepts it, in the `auth` config of `firebase.json`. Use the bare host (`localhost`), never with `http://` or a port.

## Anonymous

```javascript
import { signInAnonymously } from "firebase/auth";
await signInAnonymously(auth);
```

## Email link (passwordless)

Step 1, send the link:

```javascript
import { sendSignInLinkToEmail } from "firebase/auth";

await sendSignInLinkToEmail(auth, email, {
  url: "HTTPS_HOST_PLACEHOLDER/welcome-back", // host must be an authorized domain
  handleCodeInApp: true,
});
localStorage.setItem("emailForLink", email);
```

Step 2, on the page the link opens:

```javascript
import { isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";

if (isSignInWithEmailLink(auth, location.href)) {
  const email = localStorage.getItem("emailForLink") ?? prompt("Type the email you used");
  await signInWithEmailLink(auth, email, location.href);
  localStorage.removeItem("emailForLink");
}
```

## Observe state

Prefer a listener over reading `auth.currentUser` once: it fires on sign-in, sign-out and page reload restore.

```javascript
import { onAuthStateChanged } from "firebase/auth";

const stop = onAuthStateChanged(auth, (user) => {
  console.log(user ? `active user ${user.uid}` : "no user");
});
```

## Sign out

```javascript
import { signOut } from "firebase/auth";
await signOut(auth);
```
