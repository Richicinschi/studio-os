#!/usr/bin/env node
"use strict";
/*
 * Brand-to-token sync.
 *
 * Carries the colours in docs/brand-guidelines.md into assets/design-tokens.json, then asks
 * the design-system generator to rebuild assets/design-tokens.css.
 *
 * With no arguments it writes the files; --dry-run shows the new colour tokens and changes nothing.
 *
 * Run it from the project root: every path below is relative to the current folder.
 */

const fs = require("node:fs");
const path = require("node:path");
const cp = require("node:child_process");

const FILES = {
  guidelines: "docs/brand-guidelines.md",
  tokensJson: "assets/design-tokens.json",
  tokensCss: "assets/design-tokens.css",
  generator: [".claude", "skills", "design-system", "scripts", "generate-tokens.cjs"].join("/"),
};

const ROLES = ["primary", "secondary", "accent"];
const HEX = "([\\da-f]{6})";

// Quick Reference rows must read "<Role> Color | #RRGGBB (Colour Name)".
function readQuickReference(md, role, target) {
  const label = role[0].toUpperCase() + role.slice(1);
  const hit = new RegExp(label + "\\s+Color\\s*\\|\\s*#" + HEX + "\\s*\\(([^)]+)\\)", "i").exec(md);
  if (!hit) return;
  target.base = "#" + hit[1];
  target.name = hit[2].trim().toLowerCase().split(/\s+/).join("-");
}

// Colour tables name shades in bold ("**Primary Dark**"); a name containing dark or light fills that slot.
function readShades(md, role, target) {
  const label = role[0].toUpperCase() + role.slice(1);
  const anyChars = "[\\s\\S]*?";
  const block = new RegExp(["### " + label + " Colors", "\\|", "(?=###|$)"].join(anyChars), "i").exec(md);
  if (!block) return;
  for (const row of block[0].matchAll(new RegExp("\\*\\*([^*]+)\\*\\*\\s*\\|\\s*#" + HEX, "gi"))) {
    const label2 = String(row[1]).toLowerCase().trim();
    const hex = "#" + row[2];
    if (label2.includes("dark")) target.dark = hex;
    else if (label2.includes("light")) target.light = hex;
    else target.base = hex;
  }
}

function readColors(md) {
  const colors = {};
  for (const role of ROLES) {
    colors[role] = { name: role, shades: {} };
    readQuickReference(md, role, colors[role]);
    readShades(md, role, colors[role]);
  }
  return colors;
}

// Shift each channel by `fraction` of 255 (positive lightens, negative darkens), clamped to 0..255.
function shift(hex, fraction) {
  const n = parseInt(hex.replace("#", ""), 16);
  const clamp = (v) => (v < 0 ? 0 : v > 255 ? 255 : v);
  const move = (v) => clamp(v + Math.round(255 * fraction));
  const r = move(n >> 16);
  const g = move((n >> 8) & 255);
  const b = move(n & 255);
  const pair = (v) => v.toString(16).padStart(2, "0");
  return ("#" + pair(r) + pair(g) + pair(b)).toUpperCase();
}

const token = (value) => ({ $value: value, $type: "color" });

// Ten-step scale 50..900. Given light and dark shades fill the 50/100 and 600 steps.
function buildScale(base, dark, light) {
  const steps = {
    50: light || shift(base, 0.9),
    100: light || shift(base, 0.8),
    200: shift(base, 0.6),
    300: shift(base, 0.4),
    400: shift(base, 0.2),
    500: base,
    600: dark || shift(base, -0.15),
    700: shift(base, -0.3),
    800: shift(base, -0.45),
    900: shift(base, -0.6),
  };
  return Object.fromEntries(Object.entries(steps).map(([k, v]) => [k, token(v)]));
}

const titleCase = (slug) =>
  slug
    .split("-")
    .map((word) => (word ? word[0].toUpperCase() + word.slice(1) : word))
    .join(" ");

function applyColors(tokens, colors) {
  const { primary: P, secondary: S, accent: A } = colors;
  tokens.brand = "Generated from brand guidelines - " + titleCase(P.name);

  tokens.primitive = tokens.primitive || {};
  const palette = tokens.primitive.color || {};
  for (const stale of ["coral", "purple", "mint"]) delete palette[stale];
  for (const c of [P, S, A]) palette[c.name] = buildScale(c.base, c.dark, c.light);
  tokens.primitive.color = palette;

  const sem = tokens.semantic && tokens.semantic.color;
  if (sem) {
    const ref = (c, step) => token(`{primitive.color.${c.name}.${step}}`);
    Object.assign(sem, {
      primary: ref(P, 500),
      "primary-hover": ref(P, 600),
      "primary-active": ref(P, 700),
      "primary-light": ref(P, 400),
      "primary-lighter": ref(P, 100),
      "primary-dark": ref(P, 600),
      secondary: ref(S, 500),
      "secondary-hover": ref(S, 600),
      "secondary-light": ref(S, 300),
      "secondary-dark": ref(S, 600),
      accent: ref(A, 500),
      "accent-hover": ref(A, 600),
      "accent-light": ref(A, 300),
      // status colours borrow from the brand: success from accent, error from primary, info from secondary
      success: ref(A, 500),
      "success-light": ref(A, 300),
      error: ref(P, 500),
      "error-light": ref(P, 300),
      info: ref(S, 500),
      "info-light": ref(S, 300),
    });
  }

  const secondaryButton = tokens.component && tokens.component.button && tokens.component.button.secondary;
  if (secondaryButton) secondaryButton["bg-hover"] = token(P.base + "1A");

  return tokens;
}

function runSync(cliArgs) {
  const dryRun = cliArgs.includes("--dry-run");
  console.log("🔄 Syncing brand guidelines → design tokens\n");

  const guidelinesPath = path.join(process.cwd(), FILES.guidelines);
  if (fs.existsSync(guidelinesPath) === false) {
    console.error("❌ Brand guidelines not found: " + guidelinesPath);
    process.exit(1);
  }

  const colors = readColors(fs.readFileSync(guidelinesPath, "utf-8"));
  const missing = ROLES.filter((role) => !colors[role].base);
  if (missing.length > 0) {
    console.error("❌ No hex colour found for: " + missing.join(", "));
    console.error('   Write Quick Reference rows as "Primary Color | #RRGGBB (Colour Name)".');
    process.exit(1);
  }
  console.log("📊 Extracted colors:");
  for (const role of ROLES) {
    const c = colors[role];
    console.log("   " + role[0].toUpperCase() + role.slice(1) + ": " + c.name + " (" + c.base + ")" + (role === "accent" ? "\n" : ""));
  }

  const tokensPath = path.join(process.cwd(), FILES.tokensJson);
  const existing = fs.existsSync(tokensPath) ? JSON.parse(fs.readFileSync(tokensPath, "utf-8")) : {};
  const tokens = applyColors(existing, colors);

  if (dryRun === true) {
    console.log("📋 Would update design-tokens.json:");
    const preview = JSON.stringify(tokens.primitive.color, undefined, 2);
    console.log(preview.slice(0, 500) + "...");
    console.log("\n⏭️  Dry run - no files changed");
    return;
  }

  const serialized = JSON.stringify(tokens, undefined, 2);
  fs.writeFileSync(tokensPath, serialized);
  console.log("✅ Updated: " + FILES.tokensJson);

  const generator = path.join(process.cwd(), FILES.generator);
  if (fs.existsSync(generator)) {
    try {
      const options = { stdio: "inherit", cwd: process.cwd() };
      cp.execFileSync("node", [generator, "--config", FILES.tokensJson, "-o", FILES.tokensCss], options);
      console.log("✅ Regenerated: " + FILES.tokensCss);
    } catch (err) {
      console.error("⚠️  Failed to regenerate CSS:", err.message);
    }
  }

  console.log("\n✨ Brand sync complete!");
}

runSync(process.argv.slice(2));
