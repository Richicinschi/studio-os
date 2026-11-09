# Export patterns

Short GDScript and shell sketches for a Godot 4 project. Names are examples; adapt them.

## Feature manager (autoload)

```gdscript
extends Node

const API_DEV := "DEV_API_HOST_HERE"
const API_LIVE := "API_HOST_HERE"

func is_debug() -> bool:
	return OS.has_feature("debug")

func is_release() -> bool:
	return OS.has_feature("release")

func is_mobile() -> bool:
	return OS.has_feature("mobile")

func api_endpoint() -> String:
	return API_DEV if is_debug() else API_LIVE
```

## Version manager (autoload)

```gdscript
extends Node

const MAJOR := 0
const MINOR := 3
const PATCH := 1
const STAGE := "beta"   # dev, alpha, beta, rc, stable
const BUILD_HASH := "dev" # injected at export

func plain() -> String:
	return "%d.%d.%d" % [MAJOR, MINOR, PATCH]

func full() -> String:
	return "%s-%s+%s" % [plain(), STAGE, BUILD_HASH]

func apply_title(base: String) -> void:
	var title := base
	if OS.is_debug_build():
		title += " [DEBUG] " + full()
	elif STAGE != "stable":
		title += " " + plain()
	DisplayServer.window_set_title(title)
```

## Version sync (editor script)

```gdscript
@tool
extends EditorScript

func _run() -> void:
	var out: Array = []
	var code := OS.execute("git", ["describe", "--always", "--tags"], out)
	if code != 0:
		push_error("git failed; git must be on PATH")
		return
	ProjectSettings.set_setting("application/config/version", String(out[0]).strip_edges())
	ProjectSettings.save()
```

## Size report (editor script, read only)

```gdscript
@tool
extends EditorScript

func _run() -> void:
	var sizes: Array = []
	_walk("res://", sizes)
	sizes.sort_custom(func(a, b): return a[1] > b[1])
	for i in mini(20, sizes.size()):
		print("%.2f MB  %s" % [sizes[i][1] / 1048576.0, sizes[i][0]])

func _walk(dir_path: String, sizes: Array) -> void:
	for f in DirAccess.get_files_at(dir_path):
		var p := dir_path.path_join(f)
		var h := FileAccess.open(p, FileAccess.READ)
		if h:
			sizes.append([p, h.get_length()])
	for d in DirAccess.get_directories_at(dir_path):
		_walk(dir_path.path_join(d), sizes)
```

## Headless pipeline (PowerShell)

```powershell
# Preset name -> output file name. Names must match export_presets.cfg.
$presets = [ordered]@{
    "Windows Desktop" = "game.exe"
    "Linux/X11"       = "game.x86_64"
    "Web"             = "index.html"
}
New-Item -ItemType Directory -Force build | Out-Null
foreach ($p in $presets.Keys) {
    $dir = "build/" + ($p -replace '[^A-Za-z0-9]', '_')
    New-Item -ItemType Directory -Force $dir | Out-Null
    # Relative output paths resolve against the folder with project.godot.
    godot --headless --export-release $p "$dir/$($presets[$p])"
    if ($LASTEXITCODE -ne 0) { Write-Error "Export failed: $p"; exit $LASTEXITCODE }
}
Write-Host "All exports done"
```

## Universal export manager (editor tool)

```gdscript
@tool
extends EditorScript

func _run() -> void:
	var cfg := ConfigFile.new()
	if cfg.load("res://export_presets.cfg") != OK:
		push_error("Cannot load export_presets.cfg")
		return
	for section in cfg.get_sections():
		if section.ends_with(".options"):
			continue
		var preset_name: String = cfg.get_value(section, "name")
		var path: String = cfg.get_value(section, "export_path")
		var code := OS.execute(OS.get_executable_path(),
			["--headless", "--path", ProjectSettings.globalize_path("res://"),
			"--export-release", preset_name, path])
		if code == 0:
			print("OK: ", preset_name)
		else:
			push_error("Export failed (%d): %s" % [code, preset_name])
```

## Post-export hook

```gdscript
@tool
extends EditorExportPlugin

func _get_name() -> String:
	return "PostExportTasks"

var _out_path := ""

func _export_begin(_features: PackedStringArray, _is_debug: bool, path: String, _flags: int) -> void:
	_out_path = path

func _export_end() -> void:
	# zip, write a manifest or notify here with OS.execute(...)
	print("Export finished: ", _out_path)
```

Register it from an `EditorPlugin` with `add_export_plugin`. The export path arrives in the begin callback; check the class reference for your Godot 4 minor version.

## Patch loader

```gdscript
extends Node

func mount_patch(file_name: String) -> bool:
	var path := "user://".path_join(file_name)
	if not FileAccess.file_exists(path):
		push_warning("Patch not found: " + path)
		return false
	var ok := ProjectSettings.load_resource_pack(path, true)
	print("Patch mounted: ", ok)
	return ok
```

## Signing helper (PowerShell, process scoped)

```powershell
# Fill these from your secret store. Never commit real values.
# When set, these override the keystore fields in the export menu.
# -AsPlainText needs PowerShell 7 or newer.
$env:GODOT_ANDROID_KEYSTORE_RELEASE_PATH = Read-Host "Keystore path"
$env:GODOT_ANDROID_KEYSTORE_RELEASE_USER = Read-Host "Key alias"
$env:GODOT_ANDROID_KEYSTORE_RELEASE_PASSWORD = Read-Host "Key password" -AsSecureString | ConvertFrom-SecureString -AsPlainText
Write-Host "Signing variables ready for this session"
```
