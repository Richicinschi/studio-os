# Docker image audit checklist

Work down this list before an image goes to production. Each box maps to a section of the production-docker skill.

## Who the container runs as

- [ ] The process is not root: `USER 65532` on distroless, otherwise a named `svcuser` with a fixed UID and GID
- [ ] `USER` comes after the last install and copy step
- [ ] Files are given to that user with `COPY --chown`
- [ ] Checked live: `docker exec <container> whoami` prints something other than `root`

## Base image

- [ ] A small base: distroless, alpine or a `-slim` tag, unless the app truly needs a full distro
- [ ] The tag names at least the minor version (`python:3.11-slim-bookworm`), and is never `:latest`
- [ ] A digest pin (`@sha256:...`) is considered for byte-identical rebuilds
- [ ] Someone or something refreshes the base on a schedule (monthly, Dependabot or Renovate)

## Secrets and layers

- [ ] No secret goes through `ARG`
- [ ] No secret is set with `ENV`
- [ ] No `.env`, private key or credential file is copied in
- [ ] Build-time secrets arrive through `RUN --mount=type=secret,id=...`
- [ ] Private git dependencies use `RUN --mount=type=ssh`
- [ ] `docker history --no-trunc <image>` was read and shows no secret value

## Build context

- [ ] A `.dockerignore` sits next to every Dockerfile
- [ ] It excludes `.git`
- [ ] It excludes `.env` and `.env.*`
- [ ] It excludes `node_modules`, `.venv`, `venv` and `__pycache__`
- [ ] It excludes tests, docs and editor settings
- [ ] The context sent to the daemon is about the size of the source tree (see the size line of `docker build --no-cache .`)

## Tags and labels

- [ ] Production tags are a git SHA or a semantic version, not `:latest`
- [ ] OCI labels are set, at least `org.opencontainers.image.revision` and `org.opencontainers.image.created`

## Health

- [ ] The Dockerfile has a `HEALTHCHECK`
- [ ] The endpoint exercises something real, such as a database query, instead of a bare 200
- [ ] The command is in exec form, `CMD ["..."]`
- [ ] `--start-period` covers the slowest boot (migrations, model load)
- [ ] Distroless images call the runtime, not `curl`

## Filesystem

- [ ] The container runs with `read_only: true` or `--read-only`
- [ ] Every path that needs writes is a `tmpfs` mount (`/tmp`, caches, pid files)

## Privileges

- [ ] `cap_drop: ALL` is set
- [ ] Only capabilities that were proven necessary are added back, for example `NET_BIND_SERVICE` below port 1024
- [ ] `security_opt: [no-new-privileges:true]` is present

## Stages

- [ ] A multi-stage build keeps the builder apart from the runtime
- [ ] The runtime stage holds no gcc, make or git
- [ ] No dev dependencies made it into the final image
- [ ] The runtime stage only receives artifacts through `COPY --from=builder`

## Platforms

- [ ] If the image runs on more than one CPU type, it is built for each (`linux/amd64`, `linux/arm64`)
- [ ] Cross-platform builds go through `docker buildx`

## Scanning

- [ ] Trivy, or an equal scanner, runs in CI on every build
- [ ] HIGH and CRITICAL findings fail the build (`--exit-code 1 --severity HIGH,CRITICAL`)
- [ ] `--ignore-unfixed` is on, so unpatched CVEs do not block releases
- [ ] A multi-stage build has both its builder and runtime images scanned
- [ ] Accepted risks are written in `.trivyignore`, each with a reason
- [ ] The scanner's version is pinned so results stay comparable
