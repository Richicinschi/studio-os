"""RFC 9457 (formerly 7807) "problem details" errors for a FastAPI service.

How to use it:
  1. Copy the file into the project, for example as app/error_handlers.py.
  2. Register the handlers once, where the app is created:

         from app.error_handlers import register_error_handlers
         register_error_handlers(app)

  3. Raise a subclass from any route or service:

         raise NotFoundError("No such user")
         raise AuthenticationError("Session has ended")

  4. Anything not derived from AppError ends in a safe 500 (no traceback, SQL or path in
     the body), is logged in full, and goes to Sentry when sentry_sdk is installed.

Third-party packages: fastapi and structlog.
"""

import structlog
from fastapi import Request, FastAPI
from fastapi.responses import JSONResponse

log = structlog.get_logger()

# Prefix of the "type" URI in each response. Point it at your own API's error docs.
ERROR_TYPE_BASE_URI = "https://errors.example.com/problems"


class AppError(Exception):
    """Parent of every error the application raises on purpose.

    Carries what the response needs: a message for the client, an HTTP status, and a
    short snake_case code that becomes the "type" URI and the title
    """

    # constructor stores the three response fields
    def __init__(
        self,
        detail: str,  # message shown to the client
        status_code: int = 500,  # HTTP status of the reply
        error_type: str = "internal_error",  # snake_case code
    ) -> None:
        self.error_type = error_type
        self.status_code = status_code
        self.detail = detail
        super().__init__(detail)  # also the exception message


class NotFoundError(AppError):
    """404: the thing asked for does not exist."""

    # default message below
    def __init__(self, detail: str = "Nothing matches that request."):
        super().__init__(detail, 404, error_type="not_found")  # 404


class ValidationError(AppError):
    """422: the request was understood but its content is not acceptable."""

    # default message below
    def __init__(self, detail: str = "The submitted data is not acceptable."):
        super().__init__(detail, 422, error_type="validation_error")  # 422


class AuthenticationError(AppError):
    """401: no credentials, or bad ones."""

    # default message below
    def __init__(self, detail: str = "Sign in to continue."):
        super().__init__(detail, 401, error_type="authentication_error")  # 401


class AuthorizationError(AppError):
    """403: the caller is known but not allowed."""

    # default message below
    def __init__(self, detail: str = "This account may not do that."):
        super().__init__(detail, 403, error_type="authorization_error")  # 403


class ConflictError(AppError):
    """409: clashes with current state, such as a duplicate email or a stale version."""

    # default message below
    def __init__(self, detail: str = "That clashes with what is already stored."):
        super().__init__(detail, 409, error_type="conflict")  # 409


class RateLimitedError(AppError):
    """429: the caller sent too many requests."""

    # default message below
    def __init__(self, detail: str = "Slow down and try again shortly."):
        super().__init__(detail, 429, error_type="rate_limited")  # 429


class ServiceUnavailableError(AppError):
    """503: a dependency we need is down."""

    # default message below
    def __init__(self, detail: str = "A backing service is down. Try again soon."):
        super().__init__(detail, 503, error_type="service_unavailable")


def _request_id(request: Request):
    """The id set by RequestIDMiddleware, or None if that middleware is not installed."""
    # state attributes are created lazily, so ask with a default
    try:
        return request.state.request_id
    except AttributeError:
        return None


def _problem_body(
    *,
    status_code: int,
    error_type: str,
    instance: str,
    detail: str,
    request_id: str | None,
):
    """Assemble the response body"""
    # field names follow RFC 9457, plus request_id for support lookups
    title = " ".join(error_type.split("_")).title()
    return {
        "title": title,
        "type": ERROR_TYPE_BASE_URI + "/" + error_type,
        "status": status_code,
        "instance": instance,
        "detail": detail,
        "request_id": request_id,
    }


async def app_error_handler(request: Request, exc: AppError) -> JSONResponse:
    """Turn a deliberate AppError into its response.

    These are expected outcomes rather than bugs, so they are logged as warnings.
    """
    log.warning(
        "app_error_returned",
        method=request.method,
        path=request.url.path,
        status_code=exc.status_code,
        error_type=exc.error_type,
    )
    body = _problem_body(
        status_code=exc.status_code,
        error_type=exc.error_type,
        instance=str(request.url),
        detail=exc.detail,
        request_id=_request_id(request),
    )
    return JSONResponse(content=body, status_code=exc.status_code)


async def crash_handler(request: Request, exc: Exception) -> JSONResponse:
    """Last-resort handler for any exception nobody planned for.

    The traceback goes to the log and to Sentry. The client only gets a fixed message and
    the request id, so nothing internal leaks.
    """
    request_id = _request_id(request)
    log.exception(
        "request_crashed",
        method=request.method,
        path=request.url.path,
        request_id=request_id,
    )

    try:
        import sentry_sdk
    except ImportError:
        pass  # Sentry is optional
    else:
        sentry_sdk.capture_exception(exc)

    body = _problem_body(
        status_code=500,
        error_type="internal_error",
        instance=str(request.url),
        detail="Something went wrong on our side. Quote the request_id when you contact support.",
        request_id=request_id,
    )
    return JSONResponse(status_code=500, content=body)


def register_error_handlers(app: FastAPI):
    """Attach both handlers to the app. Call once, right after creating it."""
    app.add_exception_handler(Exception, crash_handler)  # the fallback
    app.add_exception_handler(AppError, app_error_handler)  # more specific, wins
