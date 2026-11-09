# Crashlytics on Android

Run `firebase-basics` project and app setup first if needed.

## 1. Project and app

If the app module already holds a `google-services.json`, use the project and app it names. Otherwise create them:

- CLI logged in (see `firebase-basics`). Creating a project or app changes the person's cloud account: say so and get a yes before running either command below.
- Project: `npx -y firebase-tools@latest projects:create`.
- App: `npx -y firebase-tools@latest apps:create ANDROID <package-name>` (the same command takes IOS or WEB for other platforms).
- Config file missing from the app module folder: `npx -y firebase-tools@latest apps:sdkconfig ANDROID <App-ID>` prints it; save it as `google-services.json` in the module.

## 2. Gradle

Look up the current plugin and BoM versions on the Google Maven index before writing them. Do not guess version numbers.

The Crashlytics plugin needs Gradle 8.0 or newer, Android Gradle plugin 8.1 or newer and the Google services plugin 4.4.1 or newer; on older Gradle use the 2.x line of the Crashlytics plugin. Check these minimums in the vendor's current documentation before writing versions.

Project-level `build.gradle.kts`, in `plugins` (the Google services plugin is normally there already for `google-services.json`):

```kotlin
id("com.google.gms.google-services") version "<services plugin version>" apply false
id("com.google.firebase.crashlytics") version "<plugin version>" apply false
```

App-level `build.gradle.kts`:

```kotlin
plugins {
    id("com.google.gms.google-services")
    id("com.google.firebase.crashlytics")
}

dependencies {
    implementation(platform("com.google.firebase:firebase-bom:<bom version>"))
    implementation("com.google.firebase:firebase-crashlytics")
    implementation("com.google.firebase:firebase-analytics")
}
```

The BoM keeps all Firebase library versions aligned, so these lines carry no version. Use the plain artifact names shown here: the older `-ktx` variants are not part of current BoM releases. Analytics is what gives crash reports their breadcrumb logs, so keep it and switch Google Analytics on for the project.

## 3. Native code (only if the app or a library uses C or C++)

In the app-level file add `implementation("com.google.firebase:firebase-crashlytics-ndk")` (no version while the BoM is in use), and switch on symbol upload for release so native stack traces can be read. In a Kotlin build script, import the extension class at the top of the file:

```kotlin
import com.google.firebase.crashlytics.buildtools.gradle.CrashlyticsExtension

android {
    buildTypes {
        getByName("release") {
            configure<CrashlyticsExtension> {
                nativeSymbolUploadEnabled = true
            }
        }
    }
}
```

A Groovy build script uses `firebaseCrashlytics { nativeSymbolUploadEnabled true }` in the same place.

## 4. Test crash (required)

In the main activity, for example in `onCreate`, throw an exception five seconds after start:

```kotlin
Handler(Looper.getMainLooper()).postDelayed({
    throw RuntimeException("Crashlytics install check")
}, 5000)
```

(imports: `android.os.Handler`, `android.os.Looper`)

1. Run on a device or emulator and wait for the crash.
2. Start the app again; the report goes out on this launch.
3. After a few minutes confirm it with `get_report` or in the console.
4. Remove the throwing code.
