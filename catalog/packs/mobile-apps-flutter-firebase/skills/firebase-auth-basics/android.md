# Auth on Android (Kotlin)

Gradle Kotlin DSL and Kotlin code.

## 1. Turn Auth on for the project

Before touching the app, enable the service for the Firebase project:

```bash
npx -y firebase-tools@latest init auth
```

## 2. Add the library

In the module's `build.gradle.kts` (normally `app/build.gradle.kts`):

```kotlin
dependencies {
    implementation(platform("com.google.firebase:firebase-bom:LATEST_VERSION"))
    implementation("com.google.firebase:firebase-auth")
}
```

Replace `LATEST_VERSION` with the current Firebase BoM release from the official Android release notes. Look it up; do not guess a number. With the BoM in place, the auth artifact takes no version of its own.

## 3. Get the FirebaseAuth instance

Keep one instance in a field and assign that field. A local `val` inside `onCreate` would hide the field and leave it unset for later methods.

```kotlin
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import com.google.firebase.Firebase
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.auth

class MainActivity : ComponentActivity() {
    private lateinit var auth: FirebaseAuth

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        auth = Firebase.auth
        setContent { MaterialTheme { Text("Sign-in wiring done") } }
    }
}
```

For a View-based `AppCompatActivity`, the assignment `auth = Firebase.auth` is the same.

## 4. Who is signed in at launch

```kotlin
override fun onStart() {
    super.onStart()
    val user = auth.currentUser
    if (user != null) {
        // go to the main screen
    } else {
        // show the login screen
    }
}
```

## 5. Create an account

```kotlin
fun register(email: String, password: String) {
    auth.createUserWithEmailAndPassword(email, password)
        .addOnCompleteListener(this) { task ->
            if (task.isSuccessful) {
                val user = auth.currentUser
                // continue into the app
            } else {
                Toast.makeText(this, "Could not create the account.", Toast.LENGTH_SHORT).show()
            }
        }
}
```

## 6. Sign in

```kotlin
fun login(email: String, password: String) {
    auth.signInWithEmailAndPassword(email, password)
        .addOnCompleteListener(this) { task ->
            if (task.isSuccessful) {
                // continue into the app
            } else {
                Toast.makeText(this, "Sign-in failed.", Toast.LENGTH_SHORT).show()
            }
        }
}
```

Show a message from `task.exception` only if it helps the user; do not echo raw error text for wrong-password cases, since that reveals which accounts exist.

## 7. Sign out

```kotlin
auth.signOut()
// return to the login screen
```
