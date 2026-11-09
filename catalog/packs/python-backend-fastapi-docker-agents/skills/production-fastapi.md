---
name: production-fastapi
description: "Production FastAPI: structured logging, health checks, graceful shutdown, middleware, Pydantic models (v2), async, error handling, security, Uvicorn/Gunicorn setup, best practices. Use for fastapi/starlette/pydantic/uvicorn code or /production fastapi. Not Django or Flask unless asked."
metadata:
  category: backend
  author: Richicinschi
  domain: backend / production FastAPI patterns (logging, health, shutdown, Pydantic v2, security), kept ready for the SaaS ventures
---

# Production FastAPI

A service that serves real traffic fails in predictable ways: leaked connections, a blocked event loop, errors nobody can trace, probes that kill healthy pods. This skill lists the habits that prevent those failures. It is a reviewer's opinion, not a tutorial: where it says "always" or "never", it means it.

Files next to this one, under `production-fastapi/`:

- `templates/logging_config.py`, `middleware.py`, `error_handlers.py`, `health_checks.py`: modules to copy into the project.
- `templates/main.py.template`: all of them joined together in one file.
- `checklist.md`: the pre-ship list, one box per rule below.

---

## 1. Application lifecycle

Create shared resources in a `lifespan` context manager. The old `on_event` hooks are deprecated, and they cannot hand state from startup to shutdown.

```python
from contextlib import asynccontextmanager

import httpx
import structlog
from fastapi import FastAPI
from sqlalchemy.ext.asyncio import create_async_engine

log = structlog.get_logger()


@asynccontextmanager
async def lifespan(app: FastAPI):
    configure_logging(settings.environment)

    app.state.db_engine = create_async_engine(
        settings.database_url,
        pool_size=settings.db_pool_size,
        max_overflow=settings.db_max_overflow,
        pool_pre_ping=True,   # drop dead connections before use
        pool_recycle=3600,    # retire connections after an hour
    )
    app.state.http_client = httpx.AsyncClient(
        timeout=httpx.Timeout(10.0, connect=5.0),
        limits=httpx.Limits(max_connections=100, max_keepalive_connections=20),
    )
    log.info("startup_done", version=settings.app_version)

    yield  # the app serves requests here

    await app.state.http_client.aclose()
    await app.state.db_engine.dispose()
    log.info("shutdown_done")


app = FastAPI(title="Orders API", lifespan=lifespan)
```

Why this shape:

- Whatever is built before `yield` is released after it, so a cleanup step cannot be forgotten.
- `app.state` carries the shared objects, so no module-level globals.
- If startup raises, the process never accepts a request.

Build at startup: the database engine, one pooled HTTP client, logging, cache connections (Redis), background schedulers.

Tear down in the opposite order: stop background tasks, close HTTP clients, dispose the engine (it waits for checked-out connections), flush logs.

---

## 2. Structured logging

Use structlog. Print JSON in production and readable console lines in development. Do not call `print()` or `logging.basicConfig()`.

```python
import logging

import structlog


def configure_logging(environment: str) -> None:
    steps = [
        structlog.contextvars.merge_contextvars,
        structlog.processors.add_log_level,
        structlog.processors.StackInfoRenderer(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.format_exc_info,
    ]
    last_step = (
        structlog.processors.JSONRenderer()
        if environment == "production"
        else structlog.dev.ConsoleRenderer()
    )

    structlog.configure(
        processors=[*steps, structlog.stdlib.ProcessorFormatter.wrap_for_formatter],
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )

    # Route plain stdlib records (SQLAlchemy, httpx, uvicorn) through the same renderer.
    handler = logging.StreamHandler()
    handler.setFormatter(
        structlog.stdlib.ProcessorFormatter(
            processors=[structlog.stdlib.ProcessorFormatter.remove_processors_meta, last_step]
        )
    )
    root = logging.getLogger()
    root.handlers.clear()
    root.addHandler(handler)
    root.setLevel(logging.INFO)

    for noisy in ("uvicorn.access", "httpx"):
        logging.getLogger(noisy).setLevel(logging.WARNING)
```

**Do not use `BaseHTTPMiddleware` to inject a request id or to log.** It runs the endpoint in a different task from the middleware, so the context variables you bound are gone by the time the handler logs. Write a pure ASGI class:

```python
import uuid

import structlog
from starlette.types import ASGIApp, Receive, Scope, Send


class RequestIDMiddleware:
    def __init__(self, app: ASGIApp) -> None:
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] not in ("http", "websocket"):
            return await self.app(scope, receive, send)

        rid = str(uuid.uuid4())
        scope.setdefault("state", {})["request_id"] = rid
        structlog.contextvars.clear_contextvars()
        structlog.contextvars.bind_contextvars(request_id=rid)

        async def send_tagged(message):
            if message["type"] == "http.response.start":
                message["headers"] = [*message.get("headers", []), (b"x-request-id", rid.encode())]
            await send(message)

        await self.app(scope, receive, send_tagged)
```

Full versions: `templates/logging_config.py` and `templates/middleware.py` (the latter also reuses an id sent by the caller or a proxy, but only when it is short and made of letters, digits, dot, underscore and hyphen; otherwise it makes a new one). The snippet above always generates its own.

---

## 3. Health checks

Give every service two endpoints, a liveness probe and a readiness probe.

```python
import asyncio
from datetime import UTC, datetime

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from sqlalchemy import text

health_router = APIRouter(tags=["health"])


@health_router.get("/health/live")
async def liveness() -> dict:
    return {"status": "alive", "timestamp": datetime.now(UTC).isoformat()}


@health_router.get("/health/ready")
async def readiness(request: Request) -> JSONResponse:
    checks: dict[str, dict] = {}

    async def probe(name: str, call) -> None:
        try:
            async with asyncio.timeout(2.0):
                await call()
            checks[name] = {"status": "healthy"}
        except Exception as exc:
            checks[name] = {"status": "unhealthy", "error": str(exc)}

    async def ping_db():
        async with request.app.state.db_engine.connect() as conn:
            await conn.execute(text("SELECT 1"))

    await probe("database", ping_db)
    redis = getattr(request.app.state, "redis", None)
    if redis is not None:  # skip only when Redis is not part of this service
        await probe("redis", redis.ping)

    ok = all(c["status"] == "healthy" for c in checks.values())
    return JSONResponse(
        status_code=200 if ok else 503,
        content={
            "status": "ready" if ok else "not_ready",
            "checks": checks,
            "timestamp": datetime.now(UTC).isoformat(),
        },
    )
```

Rules:

- Liveness checks nothing outside the process. If the process answers, it returns 200. A slow database must not get the pod restarted.
- Readiness checks each dependency, each under its own 2-second timeout. A 503 takes the instance out of rotation until the dependency returns.
- Leave both paths out of access logs and out of authentication.
- Reply with JSON that names the failing dependency; a bare status code tells the on-call person nothing.

`templates/health_checks.py` adds per-check latency, a startup probe, and Kubernetes probe settings.

---

## 4. Error handling

Answer every error in the "problem details" shape (RFC 9457, which replaced RFC 7807 and keeps the same type, title, status, detail and instance members), so clients parse one format.

```python
import structlog
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

log = structlog.get_logger()


class AppError(Exception):
    def __init__(self, detail: str, status_code: int = 500, error_type: str = "internal_error"):
        super().__init__(detail)
        self.detail, self.status_code, self.error_type = detail, status_code, error_type


def problem(request: Request, status: int, kind: str, detail: str) -> JSONResponse:
    return JSONResponse(
        status_code=status,
        content={
            "type": f"https://billing.example.org/errors/{kind}",
            "title": kind.replace("_", " ").title(),
            "status": status,
            "detail": detail,
            "instance": str(request.url),
            "request_id": getattr(request.state, "request_id", None),
        },
    )


async def on_app_error(request: Request, exc: AppError) -> JSONResponse:
    log.warning("app_error_returned", error_type=exc.error_type, detail=exc.detail)
    return problem(request, exc.status_code, exc.error_type, exc.detail)


async def on_crash(request: Request, exc: Exception) -> JSONResponse:
    log.exception("request_crashed")
    try:
        import sentry_sdk
        sentry_sdk.capture_exception(exc)
    except ImportError:
        pass
    return problem(request, 500, "internal_error", "Unexpected error. Contact support with the request_id.")


def register(app: FastAPI) -> None:
    app.add_exception_handler(AppError, on_app_error)
    app.add_exception_handler(Exception, on_crash)
```

Rules:

- Every error body carries `request_id`. It is how a support ticket finds the log line.
- Expected failures (bad input, no auth, missing row) get a precise status and a message a person can read.
- Unexpected failures get a flat 500 and a generic sentence. Never put a traceback, SQL text or a file path in a response; those belong in the log.
- Log each error with its context, and send the unexpected ones to Sentry or your tracker along with the request id.

`templates/error_handlers.py` has the full exception hierarchy and a `register_error_handlers` helper.

---

## 5. Middleware stack

Middleware wraps the app like an onion. In Starlette, `add_middleware` puts the new layer on the outside, so **the last one you add is the outermost**. The order you want, outside to inside, is CORS, security headers, request id, logging. That means adding them in the opposite sequence:

```python
app.add_middleware(LoggingMiddleware)          # innermost: sees the request id
app.add_middleware(RequestIDMiddleware)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(CORSMiddleware, ...)        # outermost: answers preflights first
# Authentication and rate limits belong in Depends(), not in middleware.
```

### CORS: no wildcard with credentials

```python
from fastapi.middleware.cors import CORSMiddleware

# Good: named origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://portal.example.org", "https://preview.example.org"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)

# Bad: this pairing is a red flag. Browsers refuse credentials with a "*" origin,
# but writing it shows the policy was never decided.
# allow_origins=["*"], allow_credentials=True
```

### Skeleton for your own middleware

Start every custom layer from this, not from `BaseHTTPMiddleware`:

```python
from starlette.types import ASGIApp, Receive, Scope, Send


class MyMiddleware:
    def __init__(self, app: ASGIApp) -> None:
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            return await self.app(scope, receive, send)

        # before: read scope, start a timer, bind context

        async def send_wrapped(message):
            if message["type"] == "http.response.start":
                pass  # change status or headers here
            await send(message)

        await self.app(scope, receive, send_wrapped)
        # after: record the duration, clean up
```

Reasons to avoid `BaseHTTPMiddleware`:

- It buffers the request body in memory instead of streaming it.
- The endpoint runs in a separate `anyio` task, which loses context variables.
- It intercepts exceptions, so error-handling middleware behaves unpredictably.
- A plain ASGI class adds almost no overhead and gives full control.

`templates/middleware.py` has working RequestID, Logging and SecurityHeaders classes.

---

## 6. Pydantic v2

Use the v2 API throughout; the v1 names are deprecated or gone.

```python
from datetime import datetime
from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class SignupRequest(BaseModel):
    model_config = ConfigDict(strict=True)  # no silent type coercion

    email: Annotated[str, Field(max_length=255, pattern=r"^[\w.-]+@[\w.-]+\.\w+$")]
    name: Annotated[str, Field(min_length=1, max_length=100)]
    age: Annotated[int, Field(ge=0, le=150)] | None = None

    @model_validator(mode="after")
    def check_fields_together(self):
        return self  # rules that span several fields go here


class AccountView(BaseModel):
    model_config = ConfigDict(from_attributes=True)  # build from ORM rows

    public_id: str
    email: str
    name: str
    created_at: datetime


view = AccountView.model_validate(db_row)
as_dict = view.model_dump(exclude_none=True)
as_json = view.model_dump_json()


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", case_sensitive=False, extra="ignore"
    )

    app_name: str = "orders-api"
    app_version: str = "0.1.0"
    environment: str = "development"
    debug: bool = False
    database_url: str          # no default: a missing value stops startup
    db_pool_size: int = 10
    db_max_overflow: int = 5
    redis_url: str = "redis://localhost:6379/0"
    cors_origins: list[str] = ["http://localhost:3000"]
    log_level: str = "INFO"
```

| If you find this (v1) | Write this (v2) |
|---|---|
| `orm_mode = True` | `from_attributes = True` |
| `Field(regex=...)` | `Field(pattern=...)` |
| `class Config:` | `model_config = ConfigDict(...)` |
| `@root_validator` | `@model_validator` |
| `@validator` | `@field_validator` |
| `.parse_raw()` | `.model_validate_json()` |
| `.parse_obj()` | `.model_validate()` |
| `.json()` | `.model_dump_json()` |
| `.dict()` | `.model_dump()` |

Rules:

- Put `strict=True` on any model that takes outside input, so `"5"` is not quietly accepted as `5`.
- Put `from_attributes=True` on response models filled from ORM objects.
- Build `Settings()` at import time. A missing required value should crash the boot, not the first customer request.
- Response models list the public fields only. Keep `id`, `password_hash` and similar out of them.

---

## 7. Async patterns

The worst mistake in an async service is running blocking code on the event loop: one slow call freezes every other request.

```python
# Wrong: each line stalls the whole server
@app.get("/profiles/{profile_id}")
async def get_profile(profile_id: int):
    reply = requests.get(f"https://billing.example.org/profiles/{profile_id}")
    cfg = open("config.json").read()
    time.sleep(1)
    return reply.json()


# Right: awaitable I/O, a shared client, a deadline
@app.get("/profiles/{profile_id}")
async def get_profile(profile_id: int, request: Request):
    async with asyncio.timeout(5.0):
        reply = await request.app.state.http_client.get(f"https://billing.example.org/profiles/{profile_id}")
    async with aiofiles.open("config.json") as f:
        cfg = await f.read()
    return reply.json()
```

Run independent calls together. Sequential awaits cost the sum of the calls; `gather` costs the slowest one:

```python
account, invoices, settings_doc = await asyncio.gather(
    fetch_account(acct_id), fetch_invoices(acct_id), fetch_settings(acct_id)
)
```

Put a timeout on every outbound dependency, at the client and again around single operations where needed:

```python
client = httpx.AsyncClient(timeout=httpx.Timeout(10.0, connect=5.0))
engine = create_async_engine(url, pool_timeout=30, connect_args={"timeout": 10})
redis = aioredis.from_url(url, socket_timeout=5.0, socket_connect_timeout=2.0)

async with asyncio.timeout(3.0):
    result = await one_slow_call()
```

Rules:

- No `requests` import in a FastAPI app. Use `httpx.AsyncClient`.
- No bare `open()`. Use `aiofiles.open()`.
- No `time.sleep()`. Use `asyncio.sleep()`.
- Create the HTTP client once and keep it on `app.state`; one client per request leaks sockets.
- Every external call has a deadline, so a hung dependency cannot hang you.
- Use `asyncio.gather()` for calls that do not depend on each other.
- Sync code you cannot replace goes to a worker thread: `await asyncio.to_thread(fn)`.

---

## 8. Deployment

### Gunicorn with Uvicorn workers

```bash
gunicorn app.main:app \
    --worker-class uvicorn_worker.UvicornWorker \
    --workers "$WORKERS" \
    --bind 0.0.0.0:8000 \
    --timeout 30 \
    --graceful-timeout 30 \
    --max-requests "$MAX_REQUESTS" \
    --max-requests-jitter "$MAX_JITTER" \
    --forwarded-allow-ips="*" \
    --access-logfile -
```

Install the worker with `pip install gunicorn uvicorn-worker`. The old `uvicorn.workers.UvicornWorker` that ships inside Uvicorn is deprecated; the `uvicorn-worker` package replaces it. `--timeout 30` and `--graceful-timeout 30` are Gunicorn's defaults, written out so they are visible.

- **Workers.** Gunicorn's docs suggest `(2 x cores) + 1` as a starting point; measure and adjust from there.
- **`max-requests` and jitter.** Each worker restarts after N requests, which contains slow memory leaks. Choose N from how fast your memory grows, and set the jitter to a fraction of N so the workers do not all restart together.
- **`graceful-timeout`.** After SIGTERM, a worker has this long to finish in-flight requests. Set it equal to Kubernetes `terminationGracePeriodSeconds`.

### Behind a reverse proxy

```python
from uvicorn.middleware.proxy_headers import ProxyHeadersMiddleware

app.add_middleware(ProxyHeadersMiddleware, trusted_hosts=["*"])
```

Without it, `request.client.host` is the proxy's address, and per-client rate limits and audit logs record the wrong machine. Narrow `trusted_hosts` to your proxy's address when you know it.

### Dockerfile

```dockerfile
FROM python:3.12-slim AS builder
WORKDIR /app
COPY requirements.txt .
# requirements.txt must list gunicorn and uvicorn-worker next to fastapi
RUN pip install --no-cache-dir --target=/app/deps -r requirements.txt

FROM python:3.12-slim
RUN useradd --create-home appuser
WORKDIR /app
COPY --from=builder /app/deps /usr/local/lib/python3.12/site-packages
COPY . .
USER appuser
EXPOSE 8000
CMD ["gunicorn", "app.main:app", "-k", "uvicorn_worker.UvicornWorker", \
     "--bind", "0.0.0.0:8000"]
# worker count comes from the WEB_CONCURRENCY environment variable, which Gunicorn reads
```

Image hardening (distroless, secrets, scanning) is the job of the `production-docker` skill.

---

## 9. Rate limiting

Limit by client address and by user, and keep the auth routes much tighter.

```python
from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)


@app.exception_handler(RateLimitExceeded)
async def too_many(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content={
            "type": "https://billing.example.org/errors/rate_limited",
            "title": "Rate Limit Exceeded",
            "status": 429,
            "detail": "Too many requests. Try again later.",
            "request_id": getattr(request.state, "request_id", None),
        },
        headers={"Retry-After": str(exc.retry_after)},
    )


@app.get("/api/products")
@limiter.limit("60/minute")
async def list_products(request: Request): ...


@app.post("/auth/login")
@limiter.limit("5/minute")
async def login(request: Request): ...


def user_key(request: Request) -> str:
    return getattr(request.state, "user_id", get_remote_address(request))


per_user = Limiter(key_func=user_key)
```

Rules:

- Cover every public endpoint, not only login.
- Login, registration and password reset get limits 5 to 10 times lower than the rest.
- A 429 response includes `Retry-After`, so well-behaved clients know when to come back.
- Log each rejection; a burst of them can be an attack.
- A sliding window is smoother than a fixed one.

---

## 10. Security

### Validate input with Pydantic

Bad input should be rejected before your handler runs:

```python
class RefundRequest(BaseModel):
    model_config = ConfigDict(strict=True)

    order_ref: Annotated[str, Field(pattern=r"^ORD-\d{8}$")]
    reason: Annotated[str, Field(min_length=3, max_length=500)]
    amount: Annotated[Decimal, Field(gt=0, le=5_000)]
    currency: Annotated[str, Field(pattern=r"^[A-Z]{3}$")]
```

### Parameterise every query

```python
# Injectable: user text spliced into the SQL
await conn.execute(f"SELECT * FROM users WHERE email = '{email}'")

# Safe: the driver sends the value separately
await conn.execute(text("SELECT * FROM users WHERE email = :email"), {"email": email})
```

### Security headers

Add them in one middleware so no response misses them. The full class is in `templates/middleware.py`. The set:

| Header | Value |
|---|---|
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains` |
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `X-XSS-Protection` | `0` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` |

### Force HTTPS

```python
from starlette.middleware.httpsredirect import HTTPSRedirectMiddleware

if settings.environment == "production":
    app.add_middleware(HTTPSRedirectMiddleware)
```

### Cap request size

Neither Uvicorn nor Gunicorn caps the size of a request body. Gunicorn's `--limit-request-*` flags bound the request line and headers only, and under the Uvicorn worker class they are not applied at all. Cap the body in a reverse proxy (nginx: `client_max_body_size`) or with a small ASGI middleware that rejects an oversized `Content-Length` or stops reading past a limit.

Rules:

- Validate outside input with `strict=True` models.
- Parameterise queries, and watch for raw SQL even when an ORM is in use.
- Apply security headers through middleware, never per route.
- Serve HTTPS in production, no exceptions.
- Limit body size at the proxy or server.

---

## Related skills

These sibling skills are not part of this pack; the names are for orientation:

- `production-docker` (in this pack): container hardening and multi-stage builds.
- production-postgres: connection pooling and safe migrations.
- production-deploy: checks before a release.
- production-monitoring: OpenTelemetry traces and alerts.
- production-review: full security review.
- production-planner: architecture and failure-mode planning.
