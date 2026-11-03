# Contributing

Thank you for reading the kit closely enough to want to change it. This page says how a change reaches it.

## How the kit is kept

The public repository takes one commit per release. The kit is developed in a separate, private history, so a pull request cannot be merged here as it is ([`docs/MAINTAINING.md`](docs/MAINTAINING.md), "History" and "Publishing a release"). That shapes the routes below.

## Issues are the main route

Open an issue. There are two forms:

- **Bug:** something in the kit does not work as written.
- **A step confused me:** a phase, card or page was unclear, or Claude said something that did not match what you expected.

Questions are welcome as issues too.

## A pull request is a proposal

You can send a pull request. The maintainer applies the change in the development history and ships it in the next release. `CHANGELOG.md` credits you by GitHub handle. The pull request is then closed with a link to the release.

## What is generated

`catalog/` is generated from the studio's own skills by the export ([`docs/MAINTAINING.md`](docs/MAINTAINING.md)). A change there comes as an issue, not a pull request.

A problem in a third-party skill is not ours to fix. Report it to its upstream, listed in [`docs/THIRD_PARTY_NOTICES.md`](docs/THIRD_PARTY_NOTICES.md).

## Before you propose a change

- Run `npm test` and `npm run lint`. The kit needs Node 22 or later (`package.json`).
- Keep the house style: plain words, one idea per sentence.
- Never add personal data, real addresses or secrets. The kit's privacy gates refuse them at release.

## Security problems

Do not open an issue. Use private vulnerability reporting; [`SECURITY.md`](SECURITY.md) says how.

## Licence

Contributions are under the kit's MIT licence ([`LICENSE`](LICENSE)).
