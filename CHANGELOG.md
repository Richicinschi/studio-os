# Changelog

Each export adds a section at the top. `drill-to-adopt` in update mode reads this file.

## v3.1.0 (2026-11-10)

- Fixes and trust: the issues the November 2026 outside reviews and the maintainer review raised for this release (public issues #2, #6, #7, #8, #10, #24, #25, #33).
- Practices: added sensitive-file-deny-rules (deny rules for secret files, enforced by Claude Code); changed git-hooks and never-share-list (you set the hooks folder yourself, in your own terminal) and git-guardrails 1.3.0 (refuses more ways to skip the hooks).
- A domain whose text partly follows outside work now says so in its SOURCE.md, and THIRD_PARTY_NOTICES lists its credits.
- Maintainers: scan records for domains and a triage gate that checks the scanner's finding count; the studio_sources front-matter key; a publish procedure through a release/vX.Y.Z branch and a green three-system CI run; credit-file detection in the build.

**Changed:** `pack:advisor-council-for-big-decisions`, `pack:android-swiftui-react-native-app-building`, `pack:app-legal-privacy-terms-store-review`, `pack:audio-video-media`, `pack:dependency-supply-chain-risk-checks`, `pack:design-ui-logos-slides-posters`, `pack:django-flask-laravel-shops-and-chat`, `pack:engineering-testing-performance-code-design`, `pack:games-design-prototype-playtest-assets`, `pack:godot-camera-shaders-particles-export`, `pack:learning-lessons-explanations-practice`, `pack:marketing-copy-emails-seo-signups`, `pack:marketing-plans-offers-pricing-launches`, `pack:mobile-apps-flutter-firebase`, `pack:phone-app-testing-release-and-agents`, `pack:python-backend-fastapi-docker-agents`, `pack:stock-research-backtests-trading-safety`, `pack:unity-editor-scripts-prefabs-builds`, `pack:web-api-security-login-and-graphql`, `pack:web-astro-cloudflare-gsap-performance`, `pack:web-search-and-scraping-into-files`, `skill:brainstorming`, `skill:claim-auditor`, `skill:diagnosing-bugs`, `skill:dispatching-parallel-agents`, `skill:drawio-diagrams`, `skill:drill-to-plan`, `skill:executing-plans`, `skill:finishing-a-development-branch`, `skill:git-cleanup`, `skill:git-guardrails`, `skill:handoff`, `skill:improve`, `skill:receiving-code-review`, `skill:requesting-code-review`, `skill:subagent-driven-development`, `skill:tdd`, `skill:using-agent-skills`, `skill:using-git-worktrees`, `skill:verification-before-completion`, `skill:writing-great-skills`, `skill:writing-plans`

## v3.0.1 (2026-11-09)

- The claude.ai bundle tests now check the zip with unzip on Linux, where tar cannot read zips.
- Maintainers: tools/export/test/upload-bundle.test.mjs lists and extracts the bundle zips with unzip on Linux and with bsdtar on Windows and macOS; a missing reader fails with a message.

No catalog changes.

## v3.0.0 (2026-11-09)

- The core plus domains: the studio's own skills, organised by job, installed only when you adopt a domain.
- Maintainers: the export reads the hub's library packs (a pack kind in the manifest, a computed ship rule with per-skill withheld reasons and an optional hold, hub-only packs that need no entry and whose names are denied in every built file), writes catalog/packs and a domains section in features.json and FEATURES.md, builds claude.ai zips with tools/upload-bundle.mjs, prints every removal with its replacement in the changelog, lists outside data notices, prunes the router skill to what ships, neutralises working-folder names, holds card token figures to the shipped files in npm test, and stamps the release version into the manifest.

**Added:** `pack:advisor-council-for-big-decisions`, `pack:android-swiftui-react-native-app-building`, `pack:app-legal-privacy-terms-store-review`, `pack:audio-video-media`, `pack:dependency-supply-chain-risk-checks`, `pack:design-ui-logos-slides-posters`, `pack:django-flask-laravel-shops-and-chat`, `pack:engineering-testing-performance-code-design`, `pack:games-design-prototype-playtest-assets`, `pack:godot-camera-shaders-particles-export`, `pack:learning-lessons-explanations-practice`, `pack:marketing-copy-emails-seo-signups`, `pack:marketing-plans-offers-pricing-launches`, `pack:mobile-apps-flutter-firebase`, `pack:phone-app-testing-release-and-agents`, `pack:python-backend-fastapi-docker-agents`, `pack:stock-research-backtests-trading-safety`, `pack:unity-editor-scripts-prefabs-builds`, `pack:web-api-security-login-and-graphql`, `pack:web-astro-cloudflare-gsap-performance`, `pack:web-search-and-scraping-into-files`

**Changed:** `agent:linus-reviewer`, `agent:sherlock-researcher`, `skill:brainstorming`, `skill:claim-auditor`, `skill:diagnosing-bugs`, `skill:dispatching-parallel-agents`, `skill:drawio-diagrams`, `skill:drill-to-plan`, `skill:executing-plans`, `skill:finishing-a-development-branch`, `skill:git-cleanup`, `skill:git-guardrails`, `skill:handoff`, `skill:improve`, `skill:receiving-code-review`, `skill:requesting-code-review`, `skill:subagent-driven-development`, `skill:tdd`, `skill:using-agent-skills`, `skill:using-git-worktrees`, `skill:verification-before-completion`, `skill:writing-great-skills`, `skill:writing-plans`

**Removed:** `agent:atlas-operator`, `agent:fred-advocate`, `agent:jony-designer`, `agent:karen-skeptic`, `agent:lorn-founder`, `agent:marie-architect`, `agent:midas-treasurer`, `agent:saul-counsel`, `skill:building-pydantic-ai-agents`, `skill:claude-md-curator`, `skill:codebase-design`, `skill:council`, `skill:frontend-design`, `skill:modern-python`, `skill:production-fastapi`, `skill:supply-chain-risk-auditor`

**Removed in this version, with what replaces each:**

- `skill:ab-testing`, `skill:ai-seo`, `skill:analytics`, `skill:aso`, `skill:churn-prevention`, `skill:cold-email`, `skill:content-strategy`, `skill:copy-editing`, `skill:copywriting`, `skill:cro`, `skill:emails`, `skill:onboarding`, `skill:paywalls`, `skill:programmatic-seo`, `skill:seo-audit`, `skill:signup` → the domain `marketing-copy-emails-seo-signups`
- `skill:ad-creative`, `skill:community-marketing`, `skill:competitor-profiling`, `skill:competitors`, `skill:customer-research`, `skill:launch`, `skill:lead-magnets`, `skill:marketing-ideas`, `skill:marketing-plan`, `skill:marketing-psychology`, `skill:offers`, `skill:pricing`, `skill:product-marketing`, `skill:public-relations`, `skill:referrals`, `skill:social` → the domain `marketing-plans-offers-pricing-launches`
- `external:anthropic-document-skills` → none in this kit; the document skills built into claude.ai are switched on in its settings (docs/facts.md, "claude.ai: custom skills and the built-in document skills")
- `skill:astro-dev`, `skill:build-local-site`, `skill:gsap-core`, `skill:gsap-scrolltrigger`, `skill:gsap-timeline`, `skill:schema`, `skill:site-architecture`, `skill:web-perf`, `skill:workers-best-practices`, `skill:wrangler` → the domain `web-astro-cloudflare-gsap-performance`
- `agent:atlas-operator`, `agent:fred-advocate`, `agent:jony-designer`, `agent:karen-skeptic`, `agent:lorn-founder`, `agent:marie-architect`, `agent:midas-treasurer`, `agent:saul-counsel`, `skill:council` → the domain `advisor-council-for-big-decisions`
- `skill:brand`, `skill:frontend-design`, `skill:iso-figures`, `skill:motion-design`, `skill:motion-dev-animations`, `skill:review-animations`, `skill:ui-ux-pro-max` → the domain `design-ui-logos-slides-posters`
- `skill:browser-testing-with-devtools`, `skill:codebase-design`, `skill:performance-optimization` → the domain `engineering-testing-performance-code-design`
- `skill:building-pydantic-ai-agents`, `skill:modern-python`, `skill:production-docker`, `skill:production-fastapi` → the domain `python-backend-fastapi-docker-agents`
- `skill:claude-md-curator`, `skill:firebase-apk-scanner`, `skill:ponytail-audit`, `skill:save-session`, `skill:start-project`, `skill:update-wiki-graph` → no longer part of the kit
- `external:coding-guidelines` → the practice `practice:coding-guidelines`, the same four principles in the kit's own words, in `templates/rules/coding-guidelines.md`
- `skill:firebase-auth-basics`, `skill:firebase-basics`, `skill:firebase-crashlytics`, `skill:firebase-firestore`, `skill:firebase-hosting-basics`, `skill:firebase-remote-config-basics`, `skill:firebase-security-rules-auditor`, `skill:flutter-add-integration-test`, `skill:flutter-add-widget-preview`, `skill:flutter-add-widget-test`, `skill:flutter-apply-architecture-best-practices`, `skill:flutter-build-responsive-layout`, `skill:flutter-fix-layout-issues`, `skill:flutter-implement-json-serialization`, `skill:flutter-setup-declarative-routing`, `skill:flutter-setup-localization`, `skill:flutter-use-http-package`, `skill:using-firebase` → the domain `mobile-apps-flutter-firebase`
- `skill:godot-audit`, `skill:godot-camera-systems`, `skill:godot-export-builds`, `skill:godot-particles`, `skill:godot-shaders-basics`, `skill:godot-tweening` → the domain `godot-camera-shaders-particles-export`
- `skill:legal-analytics-consent`, `skill:legal-apple-gate`, `skill:legal-cross-store`, `skill:legal-data-surface-scan`, `skill:legal-doc-draft`, `skill:legal-flow-grader`, `skill:legal-gdpr-audit`, `skill:legal-guardrails`, `skill:legal-health-claims`, `skill:legal-play-gate`, `skill:legal-privacy-review`, `skill:legal-reg-monitor`, `skill:legal-signoff-orchestrator`, `skill:legal-terms-review-nl`, `skill:legal-withdrawal-check` → the domain `app-legal-privacy-terms-store-review`
- `external:outside-workflow-plugin` → the core skills this kit ships replace it; it was the outside workflow plugin recommended in v2, so uninstall it if you added it
- `skill:supply-chain-risk-auditor` → the domain `dependency-supply-chain-risk-checks`
- `skill:teach` → the domain `learning-lessons-explanations-practice`

## v2.0.3 (2026-11-03)

- Tests now run on GitHub for every push and pull request, on Windows, macOS and Linux with Node 22, and the README shows their badge.
- `SECURITY.md` says how to report a vulnerability privately, and lists which protections the kit enforces in code and which are instructions Claude follows, with their known gaps.
- `CONTRIBUTING.md` and two issue forms (a bug, and a step that confused you) say how a change reaches the kit: issues first, and a pull request as a proposal that ships in the next release.
- `docs/trials.md` records how the adoption was tested, by agents playing adopters: what broke, what was fixed, and what that does not prove.
- The quick start says its commands work in bash, zsh and PowerShell, not in cmd.exe.
- Maintainers: a test workflow in `.github/workflows/test.yml` (read-only permissions, actions pinned to commit SHAs), issue forms in `.github/ISSUE_TEMPLATE/`, the export gates accept `.github/`, `SECURITY.md` and `CONTRIBUTING.md`, and `docs/MAINTAINING.md` asks every release to name maintainer-facing changes like these.

No catalog changes.

## v2.0.2 (2026-11-02)

- The README is restructured and shorter: what the kit is, why, who it is for, the five phases in one table, a quick start, and what is inside; it opens with a banner (`docs/banner.png`).

No catalog changes.

## v2.0.1 (2026-11-02)

- The kit is now public under the MIT licence (`LICENSE`), so you can clone it without an invite or a GitHub account; the third-party skills in `catalog/skills/` keep their own licences, listed in `docs/THIRD_PARTY_NOTICES.md`.
- The README is rewritten for someone who has never seen the kit, and START-HERE now says what each step should show, how to stop and pick up again, and where you start Claude Code for daily work; install steps for later items moved to `docs/install-reference.md`.
- A first adoption is shorter and ends with proof: its questions cover only the first wave, at most about 8 items; defaults that follow from your setup come as one list you keep in one reply; the menu shows modules first, and their items only when you open one; and the first sitting ends with a new session, in a second terminal, answering from your files. The other items you chose wait under Later waves, and none is dropped.
- The drill asks one question per message, each with a recommended option that Not sure takes, asks your data rules before it suggests where anything is stored, and hands you the commands you run yourself as one block.
- `git-guardrails` 1.2.0 still blocks when jq is missing, where the 2.0.0 copy let every command through, and now also blocks history rewrites, skipped hooks, remote branch deletes and more spellings of a force-push; if you adopted it from 2.0.0, update it.
- Cards and modules now rest on dated, sourced lines in `docs/facts.md`, and wrong advice is corrected: a `CLAUDE.local.md` stops Claude Code reading `AGENTS.md` unless it starts with `@AGENTS.md`, a `!` command is no longer offered for passwords or sign-ins, and an MCP secret passed with `--env` or `--header` is treated as stored in plain text in `~/.claude.json`, so the cards use a `${VAR}` reference instead.

**Changed:** `agent:atlas-operator`, `agent:bob-builder`, `agent:fred-advocate`, `agent:jony-designer`, `agent:linus-reviewer`, `agent:lorn-founder`, `agent:saul-counsel`, `agent:sherlock-researcher`, `skill:brainstorming`, `skill:building-pydantic-ai-agents`, `skill:claim-auditor`, `skill:claude-md-curator`, `skill:codebase-design`, `skill:council`, `skill:diagnosing-bugs`, `skill:dispatching-parallel-agents`, `skill:drawio-diagrams`, `skill:drill-to-plan`, `skill:executing-plans`, `skill:finishing-a-development-branch`, `skill:frontend-design`, `skill:git-cleanup`, `skill:git-guardrails`, `skill:handoff`, `skill:improve`, `skill:modern-python`, `skill:production-fastapi`, `skill:receiving-code-review`, `skill:requesting-code-review`, `skill:subagent-driven-development`, `skill:supply-chain-risk-auditor`, `skill:tdd`, `skill:using-agent-skills`, `skill:using-git-worktrees`, `skill:verification-before-completion`, `skill:writing-great-skills`, `skill:writing-plans`

## v2.0.0 (2026-11-02)

- Studio OS v2: a clean adoption kit. You adopt the studio's way of working piece by piece through drill-to-adopt and vet-and-adopt; nothing is installed for you.
- Replaces the populated v1 export, whose history is archived privately.

**Added:** `agent:atlas-operator`, `agent:bob-builder`, `agent:fred-advocate`, `agent:jony-designer`, `agent:karen-skeptic`, `agent:linus-reviewer`, `agent:lorn-founder`, `agent:marie-architect`, `agent:midas-treasurer`, `agent:saul-counsel`, `agent:sherlock-researcher`, `skill:brainstorming`, `skill:building-pydantic-ai-agents`, `skill:claim-auditor`, `skill:claude-md-curator`, `skill:codebase-design`, `skill:council`, `skill:diagnosing-bugs`, `skill:dispatching-parallel-agents`, `skill:drawio-diagrams`, `skill:drill-to-plan`, `skill:executing-plans`, `skill:finishing-a-development-branch`, `skill:frontend-design`, `skill:git-cleanup`, `skill:git-guardrails`, `skill:handoff`, `skill:improve`, `skill:modern-python`, `skill:production-fastapi`, `skill:receiving-code-review`, `skill:requesting-code-review`, `skill:subagent-driven-development`, `skill:supply-chain-risk-auditor`, `skill:tdd`, `skill:using-agent-skills`, `skill:using-git-worktrees`, `skill:verification-before-completion`, `skill:writing-great-skills`, `skill:writing-plans`

