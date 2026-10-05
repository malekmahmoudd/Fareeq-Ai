"""Bound untrusted bodies before framework parsing or temporary upload files.

Only bounded bodies are replayed to the app. Multipart boundaries are inspected
incrementally without creating files; admission limits bound buffering per worker.
Endpoint file limits still enforce the actual file size, excluding MIME overhead.
"""

from __future__ import annotations

import asyncio

from python_multipart import MultipartParser
from python_multipart.multipart import parse_options_header
from starlette.responses import JSONResponse
from starlette.types import ASGIApp, Receive, Scope, Send

from app.core.config import Settings


class Rejected(Exception):
    def __init__(self, status: int, detail: str):
        self.status, self.detail = status, detail


class BodyLimits:
    def __init__(self, app: ASGIApp, config: Settings):
        self.app, self.config = app, config
        self.reading = 0

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return
        headers = scope["headers"]
        lengths = [value for name, value in headers if name.lower() == b"content-length"]
        config = self.config
        limit = config.request_max_bytes
        if scope["path"].rstrip("/") == "/api/documents":
            limit = config.document_max_bytes + 64 * 1024
        elif scope["path"].rstrip("/") == "/api/voice/transcribe":
            limit = config.voice_max_bytes + 64 * 1024
        admitted = False
        try:
            declared = None
            if lengths:
                if len(lengths) != 1 or not lengths[0].isdigit():
                    raise Rejected(400, "Invalid request length.")
                declared = int(lengths[0])
                if declared > limit:
                    raise Rejected(413, "Request body is over the size limit.")
            if self.reading >= config.request_body_concurrency:
                raise Rejected(503, "Upload capacity is busy. Try again shortly.")
            self.reading += 1
            admitted = True
            content_type = next(
                (v for k, v in headers if k.lower() == b"content-type"), b""
            )
            mime, options = parse_options_header(content_type)
            parser = None
            parts, header_bytes, complete = 0, 0, False

            def part_begin():
                nonlocal parts, header_bytes
                parts += 1
                header_bytes = 0
                if parts > config.request_max_parts:
                    raise Rejected(413, "Too many multipart parts.")

            def part_header(data, start, end):
                nonlocal header_bytes
                header_bytes += end - start
                if header_bytes > 8192:
                    raise Rejected(413, "Multipart headers are too large.")

            def ended():
                nonlocal complete
                complete = True

            if mime == b"multipart/form-data":
                boundary = options.get(b"boundary", b"")
                if not boundary or len(boundary) > 200:
                    raise Rejected(400, "Invalid multipart boundary.")
                parser = MultipartParser(boundary, {
                    "on_part_begin": part_begin,
                    "on_header_field": part_header,
                    "on_header_value": part_header,
                    "on_end": ended,
                })
            body = bytearray()
            async with asyncio.timeout(config.request_body_seconds):
                while True:
                    message = await asyncio.wait_for(receive(), config.request_body_idle_seconds)
                    if message["type"] == "http.disconnect":
                        return
                    chunk = message.get("body", b"")
                    if len(body) + len(chunk) > limit:
                        raise Rejected(413, "Request body is over the size limit.")
                    if parser:
                        parser.write(chunk)
                    body.extend(chunk)
                    if not message.get("more_body", False):
                        break
            if declared is not None and len(body) != declared:
                raise Rejected(400, "Request length does not match body.")
            if parser:
                parser.finalize()
                if not complete:
                    raise Rejected(400, "Incomplete multipart body.")
        except TimeoutError:
            await self._error(scope, receive, send, 408, "Request body timed out.")
            return
        except Rejected as exc:
            await self._error(scope, receive, send, exc.status, exc.detail)
            return
        except ValueError:
            await self._error(scope, receive, send, 400, "Invalid multipart body.")
            return
        finally:
            if admitted:
                self.reading -= 1

        # Release the buffer as soon as the framework consumes it. Subsequent
        # receive calls must reach the server's real disconnect notification.
        replayed = False

        async def replay():
            nonlocal replayed, body
            if replayed:
                return await receive()
            replayed = True
            data = bytes(body)
            body.clear()
            return {"type": "http.request", "body": data, "more_body": False}

        await self.app(scope, replay, send)

    @staticmethod
    async def _error(scope, receive, send, status, detail):
        await JSONResponse(
            {"detail": detail}, status_code=status,
            headers={"Cache-Control": "no-store", "Connection": "close"},
        )(scope, receive, send)
