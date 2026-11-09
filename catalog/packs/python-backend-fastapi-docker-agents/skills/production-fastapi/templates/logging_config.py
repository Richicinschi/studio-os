"""structlog setup for a FastAPI service.

How to use it:
  1. Copy the file into the project, for example as app/logging_config.py.
  2. Call configure_logging("production") once, early in the lifespan startup.
  3. Log with structlog.get_logger(). Do not use print() or logging.basicConfig().

What you get:
  - JSON lines when environment is "production", coloured console lines otherwise.
  - Records from plain stdlib loggers (SQLAlchemy, httpx, uvicorn) rendered the same way.
  - Chatty libraries held at WARNING.
  - Values bound with structlog.contextvars (request_id, user_id) on every line, which
    works because the middleware in middleware.py is pure ASGI.

Third-party packages: structlog only.
"""

import logging
import sys

import structlog

# Libraries that log on every request or query and bury the useful lines.
CHATTY_LOGGERS = (
    "httpx",
    "httpcore",
    "uvicorn.error",
    "uvicorn.access",
    "sqlalchemy.pool",
    "sqlalchemy.engine",
    "multipart",
    "asyncio",
)


def configure_logging(
    environment: str,
    log_level: str | int = "INFO",
    *,  # options below are keyword-only
    silence_noisy_libraries: bool = True,  # see CHATTY_LOGGERS
) -> None:
    """Set up structlog and the root logger.

    environment: "production" selects JSON output; any other value selects the console renderer.
    log_level: name of the root level, such as "DEBUG" or "WARNING". Unknown names fall back to INFO.
    silence_noisy_libraries: when True, CHATTY_LOGGERS are raised to WARNING.
    """
    # Steps that run for every event, whichever renderer is chosen.
    common_steps = [
        # first, so values bound per request show up in the event
        structlog.contextvars.merge_contextvars,
        structlog.processors.TimeStamper(utc=True, fmt="iso"),
        structlog.processors.add_log_level,
        structlog.processors.format_exc_info,
        structlog.processors.StackInfoRenderer(),
    ]

    final_renderer: structlog.types.Processor
    if environment == "production":
        final_renderer = structlog.processors.JSONRenderer()
    else:
        final_renderer = structlog.dev.ConsoleRenderer()

    # Events from structlog loggers are handed to the stdlib handler, which renders them.
    structlog.configure(
        processors=[*common_steps, structlog.stdlib.ProcessorFormatter.wrap_for_formatter],
        # loggers are created through the stdlib so handlers and levels apply
        logger_factory=structlog.stdlib.LoggerFactory(),
        # bound loggers support .bind() and the stdlib level methods
        wrapper_class=structlog.stdlib.BoundLogger,
        # freeze each logger after first use; faster, but configure before logging
        cache_logger_on_first_use=True,
    )

    # One handler on the root logger renders both structlog events and foreign stdlib records.
    stdout_handler = logging.StreamHandler(sys.stdout)
    strip_meta = structlog.stdlib.ProcessorFormatter.remove_processors_meta
    render_pipeline = structlog.stdlib.ProcessorFormatter(processors=[strip_meta, final_renderer])
    stdout_handler.setFormatter(render_pipeline)

    root = logging.getLogger()
    root.handlers.clear()
    root.addHandler(stdout_handler)
    if isinstance(log_level, int):
        root.setLevel(log_level)
    else:
        root.setLevel(logging.getLevelNamesMapping().get(log_level.upper(), logging.INFO))

    if silence_noisy_libraries:
        for name in CHATTY_LOGGERS:
            quiet = logging.getLogger(name)
            quiet.setLevel(logging.WARNING)  # only warnings and worse get through


def get_logger(**initial_bindings: object) -> "structlog.stdlib.BoundLogger":
    """Return a structlog logger with some values already bound.

    Example:
        log = get_logger(component="billing")
        log.info("invoice_sent", invoice_id=invoice_id)
    """
    return structlog.get_logger(**initial_bindings)
