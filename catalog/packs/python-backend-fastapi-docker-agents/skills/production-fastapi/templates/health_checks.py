"""Liveness, readiness and startup probes for a FastAPI service.

How to use it:
  1. Copy the file into the project, for example as app/health_checks.py.
  2. Mount the router:

         from app import health_checks
         app.include_router(health_checks.health_router)

  3. Call mark_startup_complete() as the last line of lifespan startup, before `yield`.
  4. Point Kubernetes at the three paths:

         startupProbe:
           httpGet: {path: /health/startup, port: 8000}
           initialDelaySeconds: 3
           periodSeconds: 5
           failureThreshold: 10
         livenessProbe:
           httpGet: {path: /health/live, port: 8000}
           initialDelaySeconds: 5
           periodSeconds: 15
           failureThreshold: 3
         readinessProbe:
           httpGet: {path: /health/ready, port: 8000}
           initialDelaySeconds: 10
           periodSeconds: 5
           failureThreshold: 3

Paths:
  /health/live     200 whenever the process can answer. It looks at no dependency.
  /health/ready    200 only if every configured dependency answers within 2 seconds.
  /health/startup  503 until mark_startup_complete() has been called, then 200.

Keep these paths out of access logs and out of authentication. Responses are JSON so an
operator can see which dependency failed.

Third-party packages: fastapi and async sqlalchemy; a Redis client only if you use one.
"""

import asyncio
import time
from collections.abc import Awaitable
from datetime import UTC, datetime

from fastapi import Request, APIRouter
from fastapi.responses import JSONResponse
from sqlalchemy import text

health_router: APIRouter = APIRouter(tags=["health"])

_started = False  # becomes True once the application has finished bootstrapping


def mark_startup_complete() -> None:
    """Tell the startup probe that initialisation is finished.

        @asynccontextmanager
        async def lifespan(app):
            ...build resources...
            mark_startup_complete()
            yield
    """
    global _started
    _started = True  # the startup probe now answers 200


def mark_startup_incomplete() -> None:
    """Reset the flag. Useful at shutdown or between tests."""
    global _started
    _started = False


def _now() -> str:
    return datetime.now(UTC).isoformat()


async def _check_dependency(
    name: str,
    pending: Awaitable[object],
    timeout_seconds: float = 2.0,  # per-call deadline
) -> dict:
    """Await one dependency call under a deadline and describe the outcome.

    Returns {"status": "healthy" | "unhealthy", "latency_ms": float} and, when unhealthy,
    an "error" entry that is either "timeout" or the exception text. `name` is only for
    the caller's own bookkeeping.
    """
    began = time.perf_counter()

    def elapsed_ms() -> float:
        return round((time.perf_counter() - began) * 1000, 2)

    # one deadline covers the whole call
    try:
        async with asyncio.timeout(timeout_seconds):
            _ = await pending
    except TimeoutError:
        return {"latency_ms": elapsed_ms(), "error": "timeout", "status": "unhealthy"}
    except Exception as exc:
        return {"latency_ms": elapsed_ms(), "error": str(exc), "status": "unhealthy"}
    return {"latency_ms": elapsed_ms(), "status": "healthy"}


@health_router.get("/health/live", summary="Liveness probe")
async def liveness() -> dict[str, str]:
    """Process-is-up probe. Never touches the database or any other service,
    because a slow dependency must not make the orchestrator kill a working process"""
    # no I/O here on purpose
    return {"timestamp": _now(), "status": "alive"}


@health_router.get("/health/ready", summary="Readiness probe")
async def readiness(request: Request):
    """Can this instance take traffic right now?

    A 503 here removes the instance from the load balancer until it recovers.
    Dependencies that are not configured on app.state are reported or skipped, not failed.
    To add one, extend `results` the same way as the database and Redis below.
    """
    results: dict[str, dict] = {}

    shared = request.app.state
    engine = getattr(shared, "db_engine", None)
    if engine is None:
        results["database"] = dict(status="not_configured")
    else:
        async def select_one() -> None:
            async with engine.connect() as link:
                await link.execute(text("SELECT 1"))

        results["database"] = await _check_dependency("database", select_one())

    redis = getattr(shared, "redis", None)
    if redis is not None:
        results["redis"] = await _check_dependency("redis", redis.ping())

    failed = [r for r in results.values() if r["status"] == "unhealthy"]
    return JSONResponse(
        status_code=503 if failed else 200,
        content={
            "status": "not_ready" if failed else "ready",
            "checks": results,
            "timestamp": _now(),
        },
    )


@health_router.get("/health/startup", summary="Startup probe")
async def startup_check():
    """Has startup finished? Kubernetes holds the other probes back until this passes,
    so slow-booting containers are not killed while they warm up."""
    if _started:
        return JSONResponse({"timestamp": _now(), "status": "started"}, status_code=200)
    return JSONResponse({"timestamp": _now(), "status": "starting"}, status_code=503)
