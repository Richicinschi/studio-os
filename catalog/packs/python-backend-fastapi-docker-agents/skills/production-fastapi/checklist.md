# FastAPI pre-ship checklist

Go through this before a service takes real traffic. A box left empty is a future outage or a security report.

---

## Application lifecycle
- [ ] App is built with a `lifespan` function, not the deprecated `on_event` hooks
- [ ] Startup builds the DB engine, one HTTP client pool, logging and any cache connection
- [ ] Shutdown releases in reverse: background tasks, HTTP clients, DB engine, then flush logs
- [ ] A startup failure stops the process; it never serves half-initialised

## Logging
- [ ] structlog prints JSON in production and readable lines in development
- [ ] Standard-library logging goes through structlog, so third-party libraries match
- [ ] Chatty loggers (uvicorn.access, httpx, sqlalchemy.engine) are set to WARNING
- [ ] Every log line carries `request_id`, bound with contextvars
- [ ] No `print()` anywhere
- [ ] Log level comes from an environment variable

## Health checks
- [ ] `/health/live` returns 200 with no dependency checks
- [ ] `/health/ready` checks each dependency under its own 2-second timeout
- [ ] `/health/startup` stays 503 until bootstrap is finished
- [ ] Health paths are left out of access logs
- [ ] Health paths are left out of authentication
- [ ] Responses are JSON that names each dependency and its state

## Error handling
- [ ] Every error uses the RFC 9457 problem-details shape (RFC 7807, replaced)
- [ ] Every error body includes `request_id`
- [ ] Unhandled exceptions give a plain 500 with no traceback, SQL or file path
- [ ] The full traceback is logged on the server
- [ ] Sentry (or similar) receives unhandled exceptions together with the request id
- [ ] The error classes cover 400, 401, 403, 404, 409, 422, 429, 500 and 503

## Middleware
- [ ] All middleware is pure ASGI; none extends `BaseHTTPMiddleware`
- [ ] Outside to inside: CORS, security headers, request id, logging (added in the reverse sequence, since the last added is outermost)
- [ ] `X-Request-ID` is set on every response
- [ ] Security headers include HSTS, X-Content-Type-Options and X-Frame-Options
- [ ] The logging layer records method, path, status and duration per request
- [ ] Health paths do not appear in the access log

## Pydantic v2
- [ ] Only v2 calls: `model_dump`, `model_validate`, `ConfigDict`
- [ ] `strict=True` on models that take outside input
- [ ] `from_attributes=True` on response models built from ORM objects
- [ ] Settings come from pydantic-settings with `SettingsConfigDict`
- [ ] Required settings raise at import, not on the first request
- [ ] No `.dict()`, `.json()`, `@validator` or `class Config`

## Async patterns
- [ ] `httpx.AsyncClient` everywhere; `requests` is not imported
- [ ] File access uses `aiofiles.open()`, not `open()`
- [ ] Waiting uses `asyncio.sleep()`, never `time.sleep()`
- [ ] The HTTP client is created once and kept on `app.state`
- [ ] Every outbound call has a timeout
- [ ] Independent calls run together with `asyncio.gather()`
- [ ] Unavoidable blocking code goes through `asyncio.to_thread()`

## Deployment
- [ ] Served by Gunicorn with the `uvicorn-worker` package (`uvicorn_worker.UvicornWorker`), not the deprecated `uvicorn.workers` class
- [ ] Worker count starts at `(2 x cores) + 1`
- [ ] `max-requests` and `max-requests-jitter` are set to contain leaks
- [ ] `graceful-timeout` equals Kubernetes `terminationGracePeriodSeconds`
- [ ] `ProxyHeadersMiddleware` is on when a reverse proxy sits in front
- [ ] Dockerfile is multi-stage, runs as a non-root user, and installs with no pip cache
- [ ] Interactive docs are off in production (`docs_url=None`)

## Rate limiting
- [ ] Limits cover every public endpoint
- [ ] Auth endpoints are 5 to 10 times stricter
- [ ] A 429 response carries `Retry-After`
- [ ] Rejections are logged
- [ ] Both per-IP and per-user limits exist

## Security
- [ ] CORS lists explicit origins; no wildcard together with credentials
- [ ] HTTPS is enforced in production (`HTTPSRedirectMiddleware`)
- [ ] Security headers are added by middleware on all responses
- [ ] External input is validated by `strict=True` models
- [ ] Every database query is parameterised; no f-string SQL
- [ ] Request body size is capped at the reverse proxy or by a body-size middleware (Gunicorn's `--limit-request-*` flags do not cap bodies)
- [ ] Response models never include internal fields
