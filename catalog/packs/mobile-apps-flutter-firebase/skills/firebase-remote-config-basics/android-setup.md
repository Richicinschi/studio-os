# Remote Config on Android

Read `firebase-basics` first for project and app setup.

## Project and app

If `google-services.json` already sits in the app module folder, use the project and app it describes. If not:

- Check that the CLI session is logged in.
- With no project yet, run the `projects:create` subcommand.
- Register the app with `apps:create`, platform `ANDROID`, plus the application ID.
- Get its config with `apps:sdkconfig ANDROID <App-ID>` and store the result as `google-services.json` in the app module directory.

## Gradle

Add Analytics next to Remote Config. It supplies the user properties and audiences that conditions can target.

Project-level `build.gradle.kts`, in `plugins`:

```kotlin
id("com.google.gms.google-services") version "<services plugin version>" apply false
```

App-level `build.gradle.kts`: apply `id("com.google.gms.google-services")` in `plugins`, then:

```kotlin
dependencies {
    implementation(platform("com.google.firebase:firebase-bom:<bom version>"))
    implementation("com.google.firebase:firebase-config")
    implementation("com.google.firebase:firebase-analytics")
}
```

Look up the current plugin and BoM versions on the Google Maven index before writing them; do not guess numbers. The plain artifact names above are the current ones, since the older `-ktx` variants are not part of current BoM releases.

The BoM pins all Firebase library versions together, so list no versions on the libraries themselves.

## Defaults

Create `res/xml/remote_config_defaults.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<defaultsMap>
    <entry><key>greeting_text</key><value>Hello and welcome back</value></entry>
    <entry><key>promo_banner_on</key><value>false</value></entry>
</defaultsMap>
```

Load it once, in the Application class or the first Activity:

```kotlin
// imports: com.google.firebase.Firebase, com.google.firebase.remoteconfig.remoteConfig
val config = Firebase.remoteConfig
config.setDefaultsAsync(R.xml.remote_config_defaults)
```

## Fetch and activate

```kotlin
config.fetchAndActivate().addOnCompleteListener(this) { task ->
    if (!task.isSuccessful) {
        Log.w("RC", "fetch failed, using defaults")
    }
    val text = config.getString("greeting_text")
}
```

`task.result` is true when new values were activated. Reading after a failure still returns the defaults. The SDK fetches from the server at most once per 12 hours by default, so a repeated fetch while testing returns cached values; lower the minimum fetch interval in the settings for development only.
