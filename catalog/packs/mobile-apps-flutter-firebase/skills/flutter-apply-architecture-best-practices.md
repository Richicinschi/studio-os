---
id: flutter-apply-architecture-best-practices
title: Flutter layered architecture
description: Use when you structure a new Flutter project or refactor one for scalability. Architects the app as UI, logic and data layers (MVVM, repositories, optional use cases) and gives a step order for adding features.
---

# Flutter layered architecture

## When to use

- "How should I structure this Flutter app?", "set up the folders", "refactor this into something that scales", "where does this code belong?".
- Adding a feature to an app that already has layers and you need the order of work.
- Neighbours: widget-level layout questions belong to the Flutter UI skills; test writing details belong to the testing skill; Firebase setup belongs to the Firebase skills. This skill decides where code lives, not how a widget looks.

## How it works

1. **Keep three concerns apart.** UI, optional domain logic, data access. Rendering code never fetches data and never holds business rules.
2. **UI layer, MVVM.**
   - The ViewModel owns the screen state and the user actions. Extend `ChangeNotifier` (or another `Listenable`), expose state read-only as immutable snapshots, and take repositories through the constructor.
   - The View is a small widget that draws what the ViewModel exposes. Its own logic stays UI-only: animation, layout constraints, simple navigation.
3. **Data layer, repository pattern.**
   - The Repository is the single source of truth. It reads from one or more Services, converts what they return into domain models, and owns caching, offline sync and retry. ViewModels only ever see domain models from it, and repositories should not depend on each other.
   - A Service wraps one outside thing (an HTTP client, a local database, a platform plugin) and keeps no state of its own. It hands back raw models or a Result wrapper.
4. **Domain layer, only when earned.** Skip it by default. Add use case classes between ViewModel and Repository when the logic crowds the ViewModel, when several ViewModels need the same logic, or when it merges data from several repositories.
5. **Folder layout.** UI grouped by feature, data and domain grouped by kind:

```text
lib/
  data/
    models/          raw API models
    repositories/
    services/
  domain/
    models/          app-owned models
    use_cases/       optional
  ui/
    core/            shared widgets, themes, typography
    features/
      <feature>/
        view_models/
        views/
```

6. **Adding a feature, in this order.** Tick each box as you go.
   - [ ] Domain models: immutable classes, using `freezed` or `built_value`.
   - [ ] Services: create or extend the ones that reach the outside.
   - [ ] Repository: consume the services, return domain models.
   - [ ] Gate: if the feature needs heavy transformation or logic across several repositories, write a use case. If it is plain create/read/update/delete, skip this.
   - [ ] ViewModel: extends `ChangeNotifier`, gets repositories (or use cases) injected, exposes immutable state plus command methods.
   - [ ] View: build with `ListenableBuilder` or `AnimatedBuilder` listening to the ViewModel.
   - [ ] Wiring: register the service, repository and ViewModel in the dependency injection container (`provider` or `get_it`).
   - [ ] Verify: run the unit tests for the ViewModel and the repository. If any fail, read the failure, fix the logic, run again, and repeat until all pass.

Code sketches: [data layer](flutter-apply-architecture-best-practices/data-layer.md), [UI layer](flutter-apply-architecture-best-practices/ui-layer.md).

## Checks before done

- No widget imports a service or a raw API model.
- No ViewModel builds an HTTP call or touches a database directly.
- Repositories are constructor-injected, not created inside ViewModels.
- Only domain models cross from the data layer upward.
- The use case layer exists only where step 4 justified it.
- Unit tests for the new ViewModel and repository ran and passed.
