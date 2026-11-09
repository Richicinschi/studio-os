---
id: flutter-setup-declarative-routing
title: Declarative routing and deep links
description: Use when mobile apps or web applications are developing toward specific deep linking, and require browser history support. Configure MaterialApp.router with go_router for advanced URL-based navigation, shell routes and link checks.
---

## When to use

Typical wordings: "add go_router", "make URLs work on web", "open the app from a link", "keep tab state when switching", "set up deep links", "remove the # from the URL".

Neighbours: screens and widget layout belong to the general Flutter UI skills; sign-in logic itself belongs to the Firebase auth skill (this skill only connects the redirect). Hosting rules for the well-known files belong to the hosting skill.

## How it works

1. Create the app if needed, then add the package: `flutter create <name>`, `cd <name>`, `flutter pub add go_router`. The router object (GoRouter) holds the whole route tree; each GoRoute maps one path to one screen.
2. On web, call `usePathUrlStrategy()` (from `flutter_web_plugins/url_strategy.dart`) at the top of `main()` before `runApp`. The package is not added with `pub add`; declare it by hand in `pubspec.yaml` under `dependencies` as `flutter_web_plugins:` with `sdk: flutter`. The call drops the `#` so links look like normal URLs and deep links survive.
3. Build one top-level router and hand it to the app:

```dart
final GoRouter mainRouter = GoRouter(
  initialLocation: '/',
  routes: [
    GoRoute(
      path: '/',
      builder: (context, state) => const FeedScreen(),
      routes: [
        // child path has no leading slash; full URL is /item/K-7
        GoRoute(
          path: 'item/:sku',
          builder: (context, state) =>
              ItemScreen(sku: state.pathParameters['sku']!),
        ),
      ],
    ),
  ],
  errorBuilder: (context, state) => NotFoundScreen(error: state.error),
);

// in the app widget:
// MaterialApp.router(routerConfig: mainRouter, title: 'Trail Notes')
```

4. For sign-in gates or any state-based jump, use the router's `redirect` callback: return the target path to divert, or null to let the navigation continue.
5. Deep links to the installed app. First list the target platforms, then do only the matching part.
   - Android: in the main activity of `AndroidManifest.xml` add an intent filter with `android:autoVerify="true"`, action VIEW, categories DEFAULT and BROWSABLE, and data entries for your host (http and https). Serve `assetlinks.json` under `/.well-known/` on that host: relation `delegate_permission/common.handle_all_urls`, target namespace `android_app`, your package name, and the SHA-256 fingerprint of the signing certificate.
   - iOS: set `FlutterDeepLinkingEnabled` to true in `Info.plist` (Flutter 3.27 and later handle links by default, older versions need this opt-in; on Android the matching key is the `flutter_deeplinking_enabled` meta-data entry, set to false only when a link plugin takes over). If a third-party link plugin such as `app_links` is installed, set it to false instead, otherwise both handlers fight. Add the `com.apple.developer.associated-domains` entry `applinks:<your host>` to the entitlements file. Serve `apple-app-site-association` (no file extension) under `/.well-known/`, with an `applinks` block holding an empty `apps` list and a `details` list whose entry has appIDs reading `<TEAM_ID>.<bundle id>`, and a `components` list with one entry whose `"/"` key is `/*` (narrow it to the paths the app really handles). The older `paths` key is legacy; the Flutter guide uses `components` only.
6. Verify in a loop: run a check, read the error, fix, run again.
   - Android: `adb shell 'am start -a android.intent.action.VIEW -c android.intent.category.BROWSABLE -d "https://<host>/item/K-7"' <package>`
   - iOS simulator: `xcrun simctl openurl booted https://<host>/item/K-7`

   The app should open straight on the item screen.
7. Persistent tabs: use `StatefulShellRoute.indexedStack` with one `StatefulShellBranch` per tab. Each branch keeps its own navigation stack and scroll state. (Plain `ShellRoute` only wraps children and does not keep branch state.)

```dart
final GoRouter tabsRouter = GoRouter(
  initialLocation: '/feed',
  routes: [
    StatefulShellRoute.indexedStack(
      builder: (context, state, shell) => MainTabs(shell: shell),
      branches: [
        StatefulShellBranch(routes: [
          GoRoute(path: '/feed', builder: (c, s) => const FeedScreen()),
        ]),
        StatefulShellBranch(routes: [
          GoRoute(path: '/profile', builder: (c, s) => const ProfileScreen()),
        ]),
      ],
    ),
  ],
);
```

8. The shell widget receives a `StatefulNavigationShell`, shows it as the body and switches with `goBranch`. Passing `initialLocation: true` when the active tab is tapped again sends that tab back to its root:

```dart
class MainTabs extends StatelessWidget {
  const MainTabs({required this.shell, super.key});
  final StatefulNavigationShell shell;

  @override
  Widget build(BuildContext context) => Scaffold(
        body: shell,
        bottomNavigationBar: NavigationBar(
          selectedIndex: shell.currentIndex,
          onDestinationSelected: (i) =>
              shell.goBranch(i, initialLocation: i == shell.currentIndex),
          destinations: const [
            NavigationDestination(icon: Icon(Icons.dynamic_feed), label: 'Feed'),
            NavigationDestination(icon: Icon(Icons.person), label: 'Profile'),
          ],
        ),
      );
}
```

9. Moving around in code: `context.go('/item/K-7')` replaces the stack (declarative); `context.push('/item/K-7')` adds on top (imperative); `context.goNamed('item', pathParameters: {'sku': 'K-7'})` uses a route name (give the route a `name`); `context.pop()` goes back.

## Checks before done

- Package added, `MaterialApp.router` uses `routerConfig`, no leftover `home:` or `onGenerateRoute`.
- Web URLs have no `#` and a page reload on a deep URL still opens the right screen.
- Child route paths have no leading slash; unknown URLs reach the error screen.
- Redirect returns null when no diversion is needed (no redirect loop).
- Android: autoVerify filter present, assetlinks.json reachable over https with the real fingerprint. iOS: flag, entitlement and association file all match the same host and bundle id.
- The adb or simctl check opened the expected screen (state the exact command and what you saw).
- Tab switching keeps each tab's scroll and stack; tapping the active tab returns to its root.
- Placeholders (host, package, team id, fingerprint) were replaced or listed as still open.
