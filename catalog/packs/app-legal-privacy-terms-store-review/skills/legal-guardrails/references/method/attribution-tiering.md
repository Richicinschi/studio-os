# Source-attribution tiering

Adapted from `anthropics/claude-for-legal` (Apache-2.0). The point: a legal sign-off is only as trustworthy as its citations, and an LLM must be stopped from asserting law it cannot source.

## The tiers

| Tag | When to use | May it drive a BLOCK? |
|---|---|---|
| `[settled — <source>, verified <date>]` | Black-letter law confirmed against the primary source in `nl-eu-law/` or `platform/` | Yes |
| `[verify]` | Believed correct, not confirmed against primary source this run | No — confirm first |
| `[verify-pinpoint]` | Right substance, exact article/paragraph/letter not yet pinned | No — pin first |
| `[low-confidence]` | Novel / contested / fact-specific call | No — surface to the human |

## Rules

1. **Every legal proposition carries a tag.** No bare assertions.
2. **Primary over paraphrase.** If the only basis is a summary site, it is at best `[verify]`. Upgrade to `[settled]` only after checking the primary URL recorded in the reference file.
3. **Pin before redlining.** A redline that recites a statute must cite the exact provision (`BW 6:236(h)`, not "Dutch law").
4. **Date everything settled.** Law moves (e.g. EU ODR shut down 2025-07-19; cookiewet enforcement shifted to the AP). A `[settled]` tag without a verified-date is incomplete.
5. **Confidence ≠ severity.** A 🔴 blocker can still be `[verify]` if unconfirmed — in which case it becomes a condition "confirm X" rather than an outright BLOCK.

## Verified anchors (re-check dates on each major run)

- GDPR Art. 8 + UAVG → NL digital-consent age = **16** `[settled — verified 2026-06-06]`
- ePrivacy 5(3) + Tw 11.7a + AP GA4 position → Firebase Analytics/Crashlytics = **opt-in** in NL `[settled — verified 2026-06-06]`
- BW **6:236** = black (void) list; **6:237** = grey (presumed-unfair) list `[settled — wetten.overheid.nl/BWBR0005289, verify-pinpoint lettering each run]`
- EU **ODR platform shut down 2025-07-19** — never link it `[settled — verified 2026-06-06]`
- EU-US **DPF** adequacy decision 2023/1795, in force `[settled — verified 2026-06-06]`
