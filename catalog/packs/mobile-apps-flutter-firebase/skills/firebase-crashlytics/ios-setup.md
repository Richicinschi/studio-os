# Crashlytics on iOS

Read the iOS part of `firebase-basics` first. Every Xcode step below is done by hand in Xcode.

## 1. Project and app

1. Find the bundle id: `PRODUCT_BUNDLE_IDENTIFIER` in the `.pbxproj` file, or in `Info.plist`.
2. No Firebase project yet (creating a project or app changes the person's cloud account: say so and get a yes before steps 2 and 3): `npx firebase-tools@15.36.0 projects:create <project-id> --display-name="<name>"`.
3. Register the app: `npx firebase-tools@15.36.0 apps:create IOS <bundle-id>`.
4. Fetch the config with `npx firebase-tools@15.36.0 apps:sdkconfig IOS <app-id>` and save it as `GoogleService-Info.plist` in the Xcode project folder, without any non-XML lines the CLI printed above the plist. In Xcode, drag the file into the project navigator with the main app target ticked: a file that only sits in the folder is not linked.

## 2. Package

Add the `FirebaseCrashlytics` product of the `firebase-ios-sdk` Swift package, in Xcode: File, Add Package Dependencies.

## 3. Start Firebase

Call `FirebaseApp.configure()` in the app entry point. The exact pattern is in the iOS reference of `firebase-basics`.

## 4. Symbol upload

Crash traces stay unreadable without dSYM files. Two settings are needed on the main app target:

- Build Settings, Debug Information Format: `DWARF with dSYM File`.
- Build Phases: a Run Script phase whose body is this single line, which launches the `run` script inside the package checkout:

```bash
${BUILD_DIR%/Build/*}/SourcePackages/checkouts/firebase-ios-sdk/Crashlytics/run
```

In the same Run Script phase, add these lines under Input Files:

```text
${DWARF_DSYM_FOLDER_PATH}/${DWARF_DSYM_FILE_NAME}
${DWARF_DSYM_FOLDER_PATH}/${DWARF_DSYM_FILE_NAME}/Contents/Resources/DWARF/${PRODUCT_NAME}
${DWARF_DSYM_FOLDER_PATH}/${DWARF_DSYM_FILE_NAME}/Contents/Info.plist
$(TARGET_BUILD_DIR)/$(UNLOCALIZED_RESOURCES_FOLDER_PATH)/GoogleService-Info.plist
$(TARGET_BUILD_DIR)/$(EXECUTABLE_PATH)
```

Check afterwards that `project.pbxproj` has a `PBXShellScriptBuildPhase` where `shellScript` contains `Crashlytics/run` and `inputPaths` lists `GoogleService-Info.plist`. If the check fails, open the phase again and fix what is missing.

## 5. Test crash (required)

SwiftUI app, in `AppDelegate.swift`:

```swift
import FirebaseCore
import Dispatch

class AppDelegate: NSObject, UIApplicationDelegate {
  func application(_ application: UIApplication,
                   didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil) -> Bool {
    FirebaseApp.configure()
    DispatchQueue.main.asyncAfter(deadline: .now() + 5) {
      fatalError("Crashlytics install check")
    }
    return true
  }
}
```

1. Run on a device or simulator. An attached Xcode debugger swallows the crash so it never reaches Crashlytics: run once from Xcode, stop the scheme, open the app by hand on the device or simulator, and let it crash there.
2. Start the app again so the report is sent.
3. After a few minutes confirm it with `get_report` or in the console.
4. Remove the `asyncAfter` crash block.
