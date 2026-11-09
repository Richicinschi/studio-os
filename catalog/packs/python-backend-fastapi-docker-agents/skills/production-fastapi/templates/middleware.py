"""Pure ASGI middleware for a FastAPI service: request id, access log, security headers.

How to use it:
  1. Copy the file into the project, for example as app/middleware.py.
  2. Starlette puts each newly added layer on the OUTSIDE, so add them innermost first:

         app.add_middleware(LoggingMiddleware)          # innermost
         app.add_middleware(RequestIDMiddleware)
         app.add_middleware(SecurityHeadersMiddleware)
         app.add_middleware(CORSMiddleware, ...)        # outermost

     Requests then pass CORS, security headers, request id, logging, in that order.

Do not turn these into BaseHTTPMiddleware subclasses. That base class buffers request
bodies, runs the endpoint in a separate anyio task (so contextvars set here are lost),
and intercepts exceptions. Plain ASGI classes avoid all three problems.

Third-party packages: structlog and starlette.
"""

import re
import uuid
import time

import structlog
from starlette.types import ASGIApp, Message, Receive, Scope, Send

log = structlog.get_logger()

# Probe paths hit every few seconds; logging them would swamp real traffic.
QUIET_PATHS = frozenset({"/health/ready", "/health", "/health/live"})


ID_HEADER = b"x-request-id"  # ASGI header names are lowercase bytes
SAFE_ID = re.compile(r"[A-Za-z0-9._-]{1,64}")


class RequestIDMiddleware:
    """Tag each HTTP or WebSocket connection with a request id.

    The id is
      - kept in scope["state"]["request_id"], so handlers read request.state.request_id,
      - bound into structlog contextvars, so every log line in the request has it,
      - returned to the caller in an X-Request-ID response header.
    An incoming X-Request-ID is reused only if it passes SAFE_ID (letters, digits, dot,
    underscore, hyphen, at most 64 characters; the cap is this template's own choice).
    Anything else is replaced by a fresh uuid, so a caller cannot inject odd characters
    into your logs or response headers
    """

    # keep a reference to the wrapped app
    def __init__(self, app: ASGIApp):
        self.app = app

    # entry point, called once per connection
    async def __call__(self, scope: Scope, receive: Receive, send: Send):
        if scope["type"] not in {"http", "websocket"}:
            await self.app(scope, receive, send)
            return

        incoming = dict(scope.get("headers", [])).get(ID_HEADER)
        offered = incoming.decode("latin-1") if incoming else ""
        request_id = offered if SAFE_ID.fullmatch(offered) else str(uuid.uuid4())

        request_state = scope.setdefault("state", {})
        request_state["request_id"] = request_id
        structlog.contextvars.clear_contextvars()  # drop values from the previous request
        structlog.contextvars.bind_contextvars(request_id=request_id)  # now on every log line

        async def add_header(message: Message):
            if message.get("type") == "http.response.start":
                existing = [*message.get("headers", [])]
                existing += [(ID_HEADER, request_id.encode("latin-1"))]
                message["headers"] = existing
            await send(message)

        # hand over to the next layer with the wrapped send
        await self.app(scope, receive, add_header)


class LoggingMiddleware:
    """Write one log event per HTTP request: method, path, status, duration in ms.

    Level follows the status: 5xx is an error, 4xx a warning, the rest info.
    A request that raises is recorded as status 500 and the exception continues upward.
    Health probe paths are skipped
    """

    # keep a reference to the wrapped app
    def __init__(self, app: ASGIApp):
        self.app = app

    # entry point, called once per connection
    async def __call__(self, scope: Scope, receive: Receive, send: Send):
        path = scope.get("path") or ""
        if scope.get("type") != "http" or path in QUIET_PATHS:
            await self.app(scope, receive, send)
            return

        started = time.perf_counter()
        seen = {"status": 0}

        async def note_status(message: Message):
            if message.get("type") == "http.response.start":
                seen["status"] = message.get("status") or 0
            await send(message)

        # the finally block logs even when the app raises
        try:
            await self.app(scope, receive, note_status)
        except Exception:
            seen["status"] = 500
            raise
        finally:
            status = seen["status"]
            emit = log.error if status >= 500 else log.warning if status >= 400 else log.info
            emit(
                "http_request",
                method=scope.get("method") or "UNKNOWN",
                path=path,
                status_code=status,
                duration_ms=round((time.perf_counter() - started) * 1000, 2),
            )


class SecurityHeadersMiddleware:
    """Append a fixed set of security headers to every HTTP response.

    HSTS for two years, nosniff, no framing, the legacy XSS filter switched off
    (a Content-Security-Policy is the modern control), a strict referrer policy,
    and a permissions policy that denies camera, microphone and location.
    """

    _HEADER_MAP = {
        b"x-content-type-options": b"nosniff",
        b"x-frame-options": b"DENY",
        b"strict-transport-security": b"max-age=63072000; includeSubDomains",
        b"referrer-policy": b"strict-origin-" b"when-cross-origin",
        b"x-xss-protection": b"0",
        b"permissions-policy": b"camera=(), " b"microphone=(), " b"geolocation=()",
    }
    SECURITY_HEADERS = list(_HEADER_MAP.items())

    def __init__(self, app: ASGIApp):
        self.app = app

    # entry point, called once per connection
    async def __call__(self, scope: Scope, receive: Receive, send: Send):
        if scope.get("type") != "http":  # websocket and lifespan pass straight through
            await self.app(scope, receive, send)
            return

        async def add_headers(message: Message):
            if message.get("type") == "http.response.start":
                message["headers"] = [*message.get("headers", []), *self.SECURITY_HEADERS]
            await send(message)

        # hand over to the next layer with the wrapped send
        await self.app(scope, receive, add_headers)
