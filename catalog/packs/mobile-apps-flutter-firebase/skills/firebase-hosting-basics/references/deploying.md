# Deploying to Hosting

All commands use the CLI through npx, so the newest version runs with no install. The user must approve a live deploy first.

## Live deploy

```bash
npx -y firebase-tools@latest deploy --only hosting
```

The site appears on the project's two default addresses, `PROJECT_ID.web.app` and `PROJECT_ID.firebaseapp.com`. `--only hosting` leaves functions, rules and other services untouched.

## Preview channels

A channel is a temporary copy of the site on its own URL. Use it for review before going live.

```bash
npx -y firebase-tools@latest hosting:channel:deploy CHANNEL_ID
```

Pick a short name such as `spring-sale`. The command prints a URL in the shape `PROJECT_ID--CHANNEL_ID-HASH.web.app`; share that link for testing.

A channel is removed after 7 days unless told otherwise:

```bash
npx -y firebase-tools@latest hosting:channel:deploy CHANNEL_ID --expires 3d
```

## Promote a channel to live

To publish what was already reviewed, copy the channel to the live channel. Nothing is rebuilt, so the live site is byte for byte what was previewed.

```bash
npx -y firebase-tools@latest hosting:clone SOURCE_SITE_ID:SOURCE_CHANNEL_ID TARGET_SITE_ID:live
```

Example, promoting `spring-sale` on the default site of a project named `shop-demo-42`:

```bash
npx -y firebase-tools@latest hosting:clone shop-demo-42:spring-sale shop-demo-42:live
```
