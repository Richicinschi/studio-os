# Remote Config on iOS

Read the iOS part of `firebase-basics` and the `xcode-project-setup` skill first.

## Project and app

1. Read the bundle ID from `PRODUCT_BUNDLE_IDENTIFIER` in the `.pbxproj` file, or from `Info.plist`.
2. No Firebase project yet? Make one with the CLI subcommand `projects:create`, passing a new project ID and a `--display-name`.
3. Register the iOS app with the subcommand `apps:create`, giving platform `IOS` and the bundle ID from step 1.
4. Fetch `GoogleService-Info.plist` and link it into the Xcode target with the script from `xcode-project-setup`.

## Packages

In Swift Package Manager, add the Firebase iOS SDK package (the `firebase-ios-sdk` repository on GitHub) and select the `FirebaseRemoteConfig` and `FirebaseAnalytics` products. Analytics enables conditions based on user properties and audiences.

Initialize Firebase in the app entry point; the exact lines are in the iOS part of `firebase-basics`.

## Defaults

Create `RemoteConfigDefaults.plist` in the target:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>greeting_text</key>
    <string>Hello and welcome back</string>
    <key>promo_banner_on</key>
    <false/>
</dict>
</plist>
```

Register it:

```swift
import FirebaseRemoteConfig

let config = RemoteConfig.remoteConfig()
config.setDefaults(fromPlist: "RemoteConfigDefaults")
```

## Fetch and activate

```swift
config.fetchAndActivate { status, error in
    let fresh = status == .successFetchedFromRemote
    let cached = status == .successUsingPreFetchedData
    if !(fresh || cached) {
        print("fetch failed, using defaults: \(String(describing: error))")
    }
    let text = config.configValue(forKey: "greeting_text").stringValue
}
```

Reading after a failed fetch still returns the plist defaults.
