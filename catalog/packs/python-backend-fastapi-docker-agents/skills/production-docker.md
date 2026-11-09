---
name: production-docker
description: "Use when writing or hardening a Dockerfile, docker-compose file or .dockerignore, or containerizing an app: multi-stage builds, non-root users, distroless, BuildKit secrets, layer caching, Trivy scans, compose limits. Triggers on any Dockerfile, Docker, containers, images, or /production docker."
metadata:
  category: backend
  author: Richicinschi
  domain: container images and compose files for production, kept ready for the SaaS ventures
---

# Production Docker

A demo Dockerfile works on one laptop. A production one has to survive an attacker, a slow deploy and a careless commit. Three failures come up again and again: a container running as root, an image of two gigabytes, and a secret baked into a layer. The ten sections below close those gaps, then an anti-pattern table and a quick reference finish the file.

Ready-made starting points sit in `production-docker/templates/` (Python and Node Dockerfiles, a compose file, a `.dockerignore`). A tick-box audit is in `production-docker/security-checklist.md`.

---

## 1. Multi-stage builds

One stage means the compiler, the package cache and the source tree all go live. Split the file: a builder stage does the heavy work, a runtime stage receives only the result.

Python, builder plus distroless:

```dockerfile
# syntax=docker/dockerfile:1

FROM python:3.11-slim-bookworm AS builder
WORKDIR /build
COPY requirements.txt .
RUN pip install --no-cache-dir --no-compile --prefix=/install -r requirements.txt

FROM gcr.io/distroless/python3-debian12
COPY --from=builder /install /usr/local
COPY --chown=65532:65532 ./app /app
WORKDIR /app
USER 65532
ENTRYPOINT ["python", "-m", "app.main"]
```

Node, builder plus slim runtime:

```dockerfile
# syntax=docker/dockerfile:1

FROM node:22-slim AS builder
WORKDIR /build
COPY package*.json ./
RUN npm ci --ignore-scripts
COPY . .
RUN npm run build && npm prune --production

FROM node:22-slim
RUN apt-get update && apt-get install -y --no-install-recommends tini && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=builder --chown=node:node /build/dist ./dist
COPY --from=builder --chown=node:node /build/node_modules ./node_modules
COPY --from=builder --chown=node:node /build/package.json ./
USER node
ENTRYPOINT ["tini", "--"]
CMD ["node", "dist/index.js"]
```

What it buys you: the final image holds the interpreter, your packages and your code, and nothing else. Compare `docker images` before and after on your own service to see the cut.

Version match matters. The Python packages are built in one image and run in another, so both must use the same Python minor version. The `distroless/python3-debian12` runtime is built on Debian 12, whose own Python is 3.11 according to the Debian package listing, so the builder is `python:3.11-slim-bookworm` (same Debian release, same minor). Confirm on the day with `docker run --rm --entrypoint python gcr.io/distroless/python3-debian12 --version`, because the distroless project's current docs list only a newer Debian release and mark other tags deprecated: check which tag is still maintained before you adopt it. If you want another Python minor, pick a runtime image that ships it and move the builder with it.

Ground rules:
- Install and compile in the builder only.
- The runtime stage gets finished artifacts and nothing else, picked one by one with `COPY --from=builder`.
- gcc, make and git never appear in the runtime stage.

---

## 2. Choosing a base image

Pick the smallest image your runtime can live in.

| Image | Size | Shell | Packages | Choose it when |
|-------|------|-------|----------|----------------|
| `gcr.io/distroless/...` | smallest | none | none | a production service where safety matters most |
| `alpine:3.x` | very small | ash | apk | you want a shell to poke around and musl is fine |
| `python:3.11-slim-bookworm`, `node:22-slim` | medium | bash | apt | you need glibc or have native extensions |
| `ubuntu:24.04` | larger | bash | apt | the native dependency chain is long and awkward |

Pinning:
- Strongest: pin the digest, `FROM python:3.12-slim@sha256:...`, so a rebuild gets the same bytes.
- Minimum: pin the minor version (`python:3.12-slim`).
- `latest` is forbidden. It moves under you and breaks a build with no change on your side.
- Refresh pinned digests on a calendar (monthly) or let Dependabot or Renovate open the PRs.

Why distroless pays off:
- With no shell, an attacker who runs code in the container cannot open one.
- With no package manager, nothing can be installed after a break-in.
- Almost nothing is on disk, so there is almost nothing to exploit.
- A vulnerability scan comes back far quieter.

---

## 3. Run as a non-root user

A process that is root inside the container and gets out of it is root on the host. Of all Docker mistakes this one is the most common.

Distroless already ships a nonroot account:

```dockerfile
USER 65532
```

Debian or Ubuntu, make your own:

```dockerfile
RUN groupadd --gid 20042 svcuser && \
    useradd --uid 20042 --gid svcuser --shell /bin/false --create-home svcuser
USER svcuser
```

Alpine:

```dockerfile
RUN addgroup -g 20042 -S svcuser && \
    adduser -u 20042 -S -G svcuser -s /bin/false svcuser
USER svcuser
```

Rules:
- Put `USER` near the bottom, once every install and copy is finished.
- Give files to the user at copy time with `COPY --chown`.
- The app directory and every path the app writes to must belong to that user.
- For ports 80 or 443, front the app with a reverse proxy, or grant `CAP_NET_BIND_SERVICE`. Root is not the answer.
- Check a running container: `docker exec <container> whoami` must not print `root`.

---

## 4. Build-time secrets

Whatever lands in a layer can be pulled out by anyone holding the image, through `docker history` or `docker save`. So API keys, tokens and private-repo credentials may only reach the build through BuildKit mounts.

Secret mount:

```dockerfile
# syntax=docker/dockerfile:1
RUN --mount=type=secret,id=index_creds \
    PIP_INDEX_URL=$(cat /run/secrets/index_creds) \
    pip install --no-cache-dir -r requirements.txt
```

```bash
DOCKER_BUILDKIT=1 docker build --secret id=index_creds,src=.index_creds.txt .
```

Private git dependency, through the SSH agent:

```dockerfile
RUN --mount=type=ssh pip install git+ssh://git@git.example.com/billing-lib.git
```

```bash
docker build --ssh default .
```

Never do any of these:
- `ARG TOKEN=...` leaves the value in `docker history`.
- `ENV TOKEN=...` leaves it in `docker inspect`.
- `COPY .env /app/.env` bakes the file into a layer permanently.
- `COPY id_rsa /root/.ssh/` puts a private key in the image.

Test: run `docker history --no-trunc <image>`. If a secret value shows up, treat the image as burned and rebuild it from a clean file.

---

## 5. Layer order and cache

Each instruction makes a layer, and when one layer changes every layer after it is rebuilt. Put what changes least at the top.

```dockerfile
# 1. Base image: rarely changes
FROM python:3.11-slim-bookworm AS builder

# 2. OS packages: rarely change
RUN apt-get update && apt-get install -y --no-install-recommends \
    libffi-dev \
    && rm -rf /var/lib/apt/lists/*

# 3. Python packages: change now and then
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir --no-compile -r requirements.txt

# 4. Your code: changes on every commit
COPY . .
```

Rules:
- The dependency manifest (requirements.txt, package.json) is copied before the source.
- Dependency install is its own layer, apart from the source copy.
- Join related commands with `&&` so they form one layer.
- Remove apt lists in the very `RUN` that created them.
- `pip install --no-cache-dir` keeps wheels out of the layer.
- `--no-compile` in the builder skips writing `.pyc` files.

---

## 6. The .dockerignore file

With no `.dockerignore`, `COPY . .` hands the daemon your whole folder: `.git` (its whole history), `.env`, `node_modules`, test data.

Start from this list:

```
.git
.gitignore
.env
.env.*
*.pyc
__pycache__
.venv
venv
node_modules
.npm
.idea
.vscode
*.swp
*.swo
tests/
test/
docs/
*.md
!README.md
docker-compose*.yml
Dockerfile*
.dockerignore
.coverage
htmlcov/
.pytest_cache/
.mypy_cache/
.ruff_cache/
```

Rules:
- A project that has a Dockerfile has a `.dockerignore`. No exceptions.
- Exclude broadly, then let things back in with a `!` line.
- Measure it: run `docker build --no-cache .` and read the size of the context sent.
- A context far bigger than your source tree means entries are missing. Find what is large and add it.

---

## 7. Health checks

An orchestrator sees only that the process is alive. A hung server still looks "running". A `HEALTHCHECK` is how Docker learns the app answers.

Python service:

```dockerfile
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD ["python", "-c", "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')"]
```

Node service:

```dockerfile
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD ["node", "-e", "fetch('http://localhost:3000/health').then(r => { if (!r.ok) process.exit(1) })"]
```

Distroless has no curl or wget, so use the Python form above (the language runtime does the request).

Tuning:
- `--interval`: 30s normally, 10s for something on the critical path.
- `--timeout`: 5s is usually enough; raise it if the endpoint is slow.
- `--start-period`: be generous, because migrations and model loading take time.
- `--retries`: 3 by default, lower when the service fails fast.

Rules:
- A production Dockerfile always has a `HEALTHCHECK`.
- The endpoint should prove real work, such as a database round trip, not just return 200.
- No `curl` in distroless: it is not there.
- Write the command in exec form (`CMD ["..."]`), never shell form.

---

## 8. Scanning images

Scan before anything ships. Trivy is quick, free, and covers OS packages and language dependencies.

On your machine:

```bash
trivy image --severity HIGH,CRITICAL web-image:1.4.2
```

In CI, failing the job when something is found:

```yaml
# GitHub Actions example
- name: Scan image with Trivy
  uses: aquasecurity/trivy-action@<full-40-char-commit-sha>  # vX.Y.Z
  with:
    image-ref: ${{ env.IMAGE }}
    format: table
    exit-code: 1
    severity: HIGH,CRITICAL
    ignore-unfixed: true
```

Rules:
- Run the scan on each CI build, not now and then.
- Exit code 1 turns HIGH and CRITICAL findings into a red build.
- `ignore-unfixed` drops CVEs nobody has patched yet, which you cannot act on.
- Pin the Trivy action to a full commit SHA, never a branch; the GitHub Actions security-hardening guide recommends SHA pins because a tag can be moved or deleted if the action's repository is compromised (the action's own README shows tags in its examples). Look up the current SHA of the release you want on the action's releases page and write the release number in the trailing comment. Pin the binary version too, so results do not drift.
- With multi-stage builds, scan the builder as well as the runtime image.
- Record accepted risks in `.trivyignore`, each with a comment saying why.

---

## 9. Compose for production

By default every container can reach every other one. For production, state limits, health conditions and network boundaries yourself.

Wait for healthy dependencies:

```yaml
services:
  api:
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
```

Cap resources so a leak cannot starve the host:

```yaml
services:
  api:
    deploy:
      resources:
        limits:
          cpus: "2.0"
          memory: 768M
        reservations:
          cpus: "0.5"
          memory: 192M
```

Split the networks:

```yaml
networks:
  frontend:
  backend:

services:
  api:
    networks: [frontend, backend]
  postgres:
    networks: [backend]  # Not accessible from frontend
```

Rules:
- Always limit memory (`mem_limit` or the deploy block).
- Set `restart: unless-stopped`.
- Keep durable data on named volumes. Bind mounts do not belong in production.
- Feed settings through `env_file`; secrets are never written into the compose file.
- Pin image tags here exactly as in a Dockerfile.
- Keep dev and prod apart: `docker-compose.yml` plus `docker-compose.prod.yml`.

---

## 10. Hardening at run time

A good image is half the job. These flags add a second wall.

Read-only root filesystem with scratch space:

```yaml
services:
  api:
    read_only: true
    tmpfs:
      - /tmp
      - /app/cache
```

Drop every capability:

```yaml
services:
  api:
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE  # Only if binding to ports < 1024
```

Block privilege gain:

```yaml
services:
  api:
    security_opt:
      - no-new-privileges:true
```

The same thing with plain `docker run`:

```bash
docker run \
  --read-only \
  --tmpfs /tmp \
  --cap-drop ALL \
  --security-opt no-new-privileges:true \
  --user 65532 \
  web-image:1.4.2
```

Rules:
- Begin with `cap_drop: ALL` and add back one capability at a time, only when something breaks.
- `no-new-privileges` stops a setuid binary from raising its rights.
- A read-only filesystem makes you list every path the app really writes.
- Give those paths `tmpfs`: temp files, caches, pid files.

---

## Anti-patterns

| Mistake | What goes wrong | Do this instead |
|---|---|---|
| Container runs as root | An escape lands as root on the host | `USER 65532` or a dedicated user |
| `FROM python:latest` | Builds change without warning | Pin version and digest |
| `COPY . .` and no .dockerignore | .git, .env, node_modules reach the daemon | Write a full .dockerignore |
| `ARG SECRET_KEY=...` | Value readable via `docker history` | `--mount=type=secret` |
| Everything in one stage | Compilers and sources ship | Builder stage plus runtime stage |
| Dev dependencies in the image | Heavier, more CVEs, wider attack surface | `--only=production` or a split requirements file |
| No .dockerignore at all | Bloated context, possible secret leak | Always add one |
| `pip install` without `--no-cache-dir` | Wheel cache stays in the layer | Always pass the flag |
| `apt-get install` with no cleanup | Package lists stay in the layer | `&& rm -rf /var/lib/apt/lists/*` in that same RUN |
| No HEALTHCHECK | A hung process looks fine | Add one and tune it |
| Secrets typed into compose `environment` | They end up in version control | `env_file` or Docker secrets |
| No resource limits | One container can exhaust host memory | Set `mem_limit` and `cpus` |
| Old `docker-compose` (v1) | Deprecated, fewer features | `docker compose` (v2 plugin) |
| App listens on 127.0.0.1 | `EXPOSE` is useless, nothing connects | Bind to `0.0.0.0` inside the container |

---

## Quick reference

Production build:

```bash
DOCKER_BUILDKIT=1 docker build \
  --target runtime \
  --tag shopapi:$(git rev-parse --short HEAD) \
  --label org.opencontainers.image.revision=$(git rev-parse HEAD) \
  --label org.opencontainers.image.created=$(date -u +"%Y-%m-%dT%H:%M:%SZ") \
  .
```

Confirm the user is not root:

```bash
docker run --rm shopapi:latest whoami
# Expected: nonroot or svcuser, NEVER root
```

See image size:

```bash
docker images shopapi --format "{{.Repository}}:{{.Tag}} {{.Size}}"
```

Look for secrets in layers:

```bash
docker history --no-trunc shopapi:latest | grep -iE "(key|secret|password|token)"
```
