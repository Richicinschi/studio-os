---
id: godot-export-builds
title: Godot export builds
description: Godot multi-platform exports: export templates, export_preset, command-line exports, headless mode, Windows, Linux, macOS, Android, iOS, Web, codesign, notarization, Android SDK, feature flags, OS.has_feature, CI/CD, GitHub Actions, build optimization, size reduction, debug stripping
requires: [Godot]
---

## When to use

Typical wordings: "export my game for Android and Web", "set up export templates", "run the export from the command line", "sign and notarize the Mac build", "why is my build so big", "swap the API endpoint between debug and release", "ship a patch without a full reinstall", "automate the build".

Neighbouring skills in this pack:
- `godot-audit` takes over when the question is code quality, project structure or economy balance rather than shipping.
- `godot-test-and-verify` takes over for running the project and reading test or diagnostic output.
- `godot-editor-bridge` takes over when the editor itself must be driven or inspected.
- `godot-input-save-and-ui` takes over for save files and UI; this skill only sets the rule that saves go to `user://`.
- Cameras, shaders and particles live in the other skills of this pack; come back here when the question becomes "does it still work in the exported build".

Reference with scripts, in this skill's folder: `godot-export-builds/patterns.md`. Read the matching section there before you implement the pattern it covers (version manager, pipeline, universal export, post-export hook, patch loader, size report).

## How it works

### 1. Ground rules for every export
1. Never ship a production build that has only run in the editor. Run the exported build on the target platform. Web, mobile and console builds have their own memory and shader limits, so the editor proves nothing.
2. Export to every target platform early and repeatedly, not only at the end. Platform faults show up fast that way.
3. Keep debug and release apart. Debug keeps logs and dev tools. Release strips debug and optimizes size. Never ship a release made from a debug template; use the release export command so profiling overhead is gone.
4. Never write to `res://` in an exported game. It is read-only there. Saves and logs go to `user://`.
5. Never hardcode your own debug flag. Use the engine feature tags (step 5), so debug and release behave the same way in every build.
6. Never leave cheats or debug commands reachable in production. Gate them with a release feature tag check so they are removed from the final build.
7. A macOS build distributed outside a store must be notarized, or the OS gatekeeper blocks it. The alternative is to distribute only through Steam or the App Store.

### 2. Templates, presets and project settings
1. Install export templates through the editor's export-template manager (the download option). The archive type is `.tpz`.
2. Create a preset: open the export dialog, add a preset for the platform, configure its settings, then export.
3. Project settings that matter for export readiness: `application/config/name`, `application/config/version`, `application/run/main_scene` (stored as `run/main_scene` in the project file), `application/config/icon`, and the mobile GPU compression import option `rendering/textures/vram_compression/import_etc2_astc`.
4. Presets are stored in `export_presets.cfg`. It has a `[preset.N]` section per preset with `name`, `platform`, `runnable` and `export_path`, and a `[preset.N.options]` section (for example `binary_format/architecture`, whose values on Windows are `x86_64`, `x86_32` and `arm64`, and `application/icon`). Scripts that read presets use `ConfigFile` on this file.
5. A preset's name is whatever the preset is called in `export_presets.cfg`, and the command line must match it exactly. This skill's examples use "Windows Desktop", "Linux/X11", "Web", "macOS", "Android" and "iOS"; read the real names from your file, and quote any name with a space or slash.

### 3. Per-platform setup
- Windows: choose single executable, or executable plus `.pck` pack file. Set an `.ico` icon. Include imported resources and the scene and resource files (`.import`, `.tscn`, `.tres`). Optional signing needs a sign tool set in editor settings (`SignTool.exe` on Windows, `osslsigncode` elsewhere) and the preset's codesign section enabled; the engine reads the identity and password from `GODOT_WINDOWS_CODESIGN_IDENTITY_TYPE`, `GODOT_WINDOWS_CODESIGN_IDENTITY` and `GODOT_WINDOWS_CODESIGN_PASSWORD` when they are set.
- Web: choose the regular export type or the GDExtension type. Enable thread support only if you need shared array buffer. Set GPU compression optimized for size.
- Android: needs the Android SDK, OpenJDK 17 (the version the engine's export documentation names for Godot 4; check it for your release) and a debug keystore. Set the SDK path and the keystore in editor settings under the export/Android section. For release, put keystore path, alias and password in `GODOT_ANDROID_KEYSTORE_RELEASE_PATH`, `GODOT_ANDROID_KEYSTORE_RELEASE_USER` and `GODOT_ANDROID_KEYSTORE_RELEASE_PASSWORD` (the debug keystore has matching `..._DEBUG_...` names); when set, they override the values in the export menu, so leave the preset fields empty. Use CI secrets in production. Never type literal passwords into a preset or script.
- iOS: needs macOS with Xcode, an Apple developer account and a provisioning profile. The export produces an `.xcodeproj` that you build in Xcode for the App Store.
- macOS: needs a Developer ID certificate for `codesign`, notarization for distribution, and a universal (Intel plus ARM) architecture.

### 4. macOS notarization outside the App Store
Run these in order, with credentials read from secrets and never written into a script:
1. Sign the bundle: `codesign --deep --force --options runtime --sign "<Developer ID identity>" MyGame.app`.
2. Zip it: `ditto -c -k --keepParent MyGame.app MyGame.zip`.
3. Submit: `xcrun notarytool submit MyGame.zip --apple-id <id> --password <app-specific password> --team-id <team> --wait`.
4. Staple the ticket: `xcrun stapler staple MyGame.app`.

### 5. Build type and platform at runtime
1. Pick OS-specific code by `OS.get_name()`.
2. Pick behaviour by feature tags with `OS.has_feature("web")`, `"mobile"` (Android or iOS; false for a Web export that happens to run on a phone), `"debug"` (also true inside the editor) and `"release"`. `OS.is_debug_build()` also reports a debug build.
3. A small feature manager node can expose `is_debug()`, `is_release()` and `is_mobile()` and choose an API endpoint (development or production) from the build type. It must not hold its own debug switch. This swaps environments without code edits.

### 6. Textures and what goes into the pack
1. Always turn on GPU texture compression in import settings for Web and mobile. Large uncompressed textures eat video memory fast and can make a device fail to load them.
2. Match the format to the hardware. Desktop uses S3TC by default, and BPTC when the import option for high quality is on. Mobile and Web use ETC2 by default, and ASTC with high quality on. Only BPTC and ASTC can compress HDR textures. High quality works only on the Forward+ and Mobile renderers, not Compatibility. ASTC gives the best quality for its size on newer devices; ETC2 is the safe choice for older ones.
3. Always turn texture compression off for pixel art, so edges stay crisp.
4. Check export filters so raw source material (documentation, text notes, layered image sources) is not packed.
5. Keep non-game folders out with a `.gdignore` marker file in the folder, and add exclude filters in the preset for things like docs and note files.

### 7. Size reduction
1. Remove unused imports, apply exclude filters, turn debug off in the preset, and export a single architecture (the preset's architecture option) instead of a universal binary where the platform allows.
2. Audit the footprint with an editor script that walks `res://`, sorts files by size and prints the largest twenty in megabytes. It only reads. See `patterns.md`.
3. Deeper cut, optional: compile the engine yourself with unused modules off and optimized for size. From the engine source root run scons for the target platform with `target=template_release`, `optimize=size` (Godot 4.5 adds `size_extra`), module switches of the form `module_<name>_enabled=no`, and `disable_3d=yes` for a pure 2D game (that flag only works with the editor tools build off). Run `scons --help` to list the module names of your version, since they change between releases (navigation, for example, is split in newer ones); the engine's "Optimizing a build for size" page has a worked list. Only do this when you really need the savings; it means maintaining your own templates.
4. The shader baker (Godot 4.5 and later) pre-builds shaders at export, per preset, and only for the Forward+ and Mobile renderers (not Web). Which drivers it can bake depends on the editor's OS; check the engine's pipeline-compilation page for your release. Reports say it can be slow or do nothing in a headless export, so test it before relying on it in a pipeline. Never turn it on for dedicated server builds. It is meant for visual clients and only costs build time on a headless server.

### 8. Command line and automation
1. Flags: `--headless` (no editor window), `--export-release`, `--export-debug`, and `--export-pack` (pack only, for patching). The arguments after the flag are the preset name and the output path, for example `godot --headless --export-release "Web" build/web/index.html`. Add `--path <project folder>` when you do not run from the project root, and remember that a relative output path is resolved against the folder holding `project.godot`, not your shell's current folder.
2. Single-platform shell helper: take platform and version arguments, create a versioned output folder, rewrite the version line in the project file, run the headless release export, then optionally sign the Windows binary (certificate path and password from the environment) and optionally push to itch.io with `butler push`. Leave signing and upload commented out until you have asked (see the studio rules below).
3. Multi-platform pipeline: make sure the build folder exists, loop over the preset names (Windows, Linux, Web), make a folder per preset, run the headless release export, stop with the failing exit code on the first failure, announce success at the end.
4. Universal export manager: load `export_presets.cfg`, and for every preset section read `name` and `export_path`, run the editor binary headless, with `--path` set to the project folder, and the release flag through `OS.execute` (find it with `OS.get_executable_path()`), report success or push an error with the exit code per preset, and abort with an error if the file cannot be loaded.
5. Post-export hook: an `EditorExportPlugin` whose `_get_name` names it and whose `_export_end` callback reads the export path and runs post tasks (zip, manifest, notify) through `OS.execute`. Registering it in an editor plugin gives the whole team one export workflow.
6. CI, reference only in this studio because there is no Actions budget and exports run locally. The shape: on a pushed version tag, run an ubuntu job with a Godot container image (godot-ci), check out the repo, create output folders, run the headless release export per platform, upload the output folder as a build artifact. An alternative uses a third-party export action given a headless Godot download, an export templates download, debug export off and verbose logging. Preset names must match `export_presets.cfg`.

### 9. Versioning and traceability
1. Simple form: a version autoload holding a version string and build date, with a helper that returns a display string.
2. Fuller form: a manager with major, minor, patch, a status stage (dev, alpha, beta, rc, stable) and a build hash injected at export. It computes a plain and a full version string and sets the window title with `DisplayServer.window_set_title`. Debug builds show a debug marker plus the full version, non-stable release builds show the plain version, stable shows nothing extra.
3. Version sync: an `@tool` `EditorScript` runs `git describe --always --tags` through `OS.execute`, writes the result with `ProjectSettings.set_setting("application/config/version", ...)` and `ProjectSettings.save()`. If git fails, report that git must be on PATH.

### 10. Patching without a full reinstall
Mount an external pack at runtime with `ProjectSettings.load_resource_pack(path, true)`. The second argument replaces existing files, so same-path resources override the base pack. This suits downloadable content, translated asset sets and quick fixes shipped after release. Check with `FileAccess.file_exists` first and report success or failure. A loader may point at a CDN download that is already saved in `user://`, but it must never download on its own; the caller decides. Build the pack with `--export-pack`.

### 11. Store upload and studio rules
1. Steam: automate with `steamcmd` (`+login`, `+run_app_build`, `+quit`), credentials from `STEAM_USER` and `STEAM_PASS`, and a `.vdf` manifest that defines app ID, branch (for example beta) and content folders. Keep the manifest generic so it is safe to version. The studio keeps its upload tooling in its tooling backlog, not in this skill.
2. Ask before any upload or publish: Steam, itch.io, a store, a CDN or a release page.
3. Keys, keystores (`.keystore`), certificates, passwords and tokens never go in the repo. Use environment variables or a secret store. A signing helper may set process-scoped variables only, and must never contain a real password.
4. English only, in every surface: strings, logs, scripts and docs.
5. For the wider engine picture, use the general Godot skills in this pack. The official exporting tutorials are at docs.godotengine.org, under "Exporting".

## Checks before done
- The exported build, not the editor run, was started on each target platform and played through.
- Release builds came from the release export command, not from a debug template.
- No path under `res://` is written at runtime; saves and logs use `user://`.
- No keystore, certificate, password or token is in the repo, a preset or a script; the signing variables come from the environment or secrets.
- Debug and cheat code is behind feature tags, with no custom debug flag.
- The macOS build is signed, notarized and stapled, or goes only through a store.
- Texture compression matches each platform, and is off for pixel art.
- Docs, notes and layered sources are excluded; the largest-files report was looked at.
- Nothing was uploaded or published without asking first.

## Without local tools

Without Godot installed (for example in claude.ai) nothing can be exported or run here. Ask the person to paste the preset section of `export_presets.cfg` and any script they use, then write or fix the code and the command lines for them to run. Give the steps in order: install templates, add the preset, run the headless command, start the exported build on the device and report what happened. Never ask them to paste keystores, passwords or tokens; use placeholders and tell them to fill those in locally.
