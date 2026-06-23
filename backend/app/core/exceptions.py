import logging
from typing import Any

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

logger = logging.getLogger(__name__)


def sanitize_validation_errors(errors: list[dict[str, Any]]) -> list[dict[str, Any]]:
    sanitized_errors: list[dict[str, Any]] = []
    for error in errors:
        sanitized = {key: value for key, value in error.items() if key != "input"}
        if isinstance(sanitized.get("ctx"), dict):
            sanitized["ctx"] = {
                key: value
                for key, value in sanitized["ctx"].items()
                if isinstance(value, str | int | float | bool) or value is None
            }
        sanitized_errors.append(sanitized)
    return sanitized_errors


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
        if exc.status_code >= 500:
            logger.error("HTTP error", extra={"path": request.url.path, "status_code": exc.status_code})
        elif exc.status_code in {401, 403, 404, 409, 422}:
            logger.info("HTTP error", extra={"path": request.url.path, "status_code": exc.status_code})
        return JSONResponse(
            status_code=exc.status_code,
            content={"error": {"message": exc.detail, "status_code": exc.status_code}},
            headers=getattr(exc, "headers", None),
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
        logger.info("Request validation failed", extra={"path": request.url.path})
        return JSONResponse(
            status_code=422,
            content={
                "error": {
                    "message": "Erro de validacao dos dados enviados.",
                    "status_code": 422,
                    "details": sanitize_validation_errors(exc.errors()),
                }
            },
        )
