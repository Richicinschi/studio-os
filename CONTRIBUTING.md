# Contributing

Thank you for reading the kit closely enough to want to change it. This page says how a change reaches it.

## How the kit is kept

The public repository takes one commit per release. The kit is developed in a separate, private history, so a pull request cannot be merged here as it is ([`docs/MAINTAINING.md`](docs/MAINTAINING.md), "History" and "Publishing a release"). That shapes the routes below.

## Issues are the main route

Open an issue. There are three forms:

- **Bug:** something in the kit does not work as written.
- **A step confused me:** a phase, card or page was unclear, or Claude said something that did not match what you expected.
- **Adoption report:** how an adoption went, with the receipt the drill writes at the end of phase 5, `adoption/receipt.md`. It names kit items, counts and times only. The drill offers the form once and never sends anything itself.

Questions are welcome as issues too.

## A pull request is a proposal

You can send a pull request. The maintainer applies the change in the development history and ships it in the next release. `CHANGELOG.md` credits you by GitHub handle. The pull request is then closed with a link to the release.

## What is generated

`catalog/` is generated from the studio's own skills by the export ([`docs/MAINTAINING.md`](docs/MAINTAINING.md)). A change there comes as an issue, not a pull request.

A problem in a third-party skill is not ours to fix. Report it to its upstream, listed in [`docs/THIRD_PARTY_NOTICES.md`](docs/THIRD_PARTY_NOTICES.md).

## Before you propose a change

- Run `npm test` and `npm run lint`. The kit needs Node 22.2 or later (`package.json`): `tools/upload-bundle.mjs` uses `zlib.crc32`, which Node.js added in 22.2.0.
- Keep the house style: plain words, one idea per sentence.
- Never add personal data, real addresses or secrets. The kit's privacy gates refuse them at release.

## Security problems

Do not open an issue. Use private vulnerability reporting; [`SECURITY.md`](SECURITY.md) says how.

## If the maintainer stops

The kit has one maintainer. If a year passes with no release, the README's first line gets a dated note that the kit is no longer kept, and then the public repository is archived, which makes it read-only ([docs/facts.md](docs/facts.md), "GitHub: archiving a repository"). Nothing is deleted. The releases, their signed tags and the history stay where they are.

Anyone may carry the kit on under the MIT licence ([`LICENSE`](LICENSE)): fork it and keep the licence and its copyright notice. Please give a fork a name of its own, so adopters can tell the two apart. The release key in [`SECURITY.md`](SECURITY.md) signs this repository's releases only; a fork's releases are not signed with it.

## Licence

Contributions are under the kit's MIT licence ([`LICENSE`](LICENSE)).
