"""ASGI probes: rejected bodies must never reach any framework parser."""
import asyncio

import pytest

from app.core.config import Settings
from app.core.ingress import BodyLimits


async def probe(chunks, *, headers=(), path='/api/documents', config=None, delay=0):
    calls, responses = [], []

    async def downstream(scope, receive, send):
        calls.append(await receive())

    async def receive():
        if delay:
            await asyncio.sleep(delay)
        return chunks.pop(0)

    async def send(message):
        responses.append(message)

    middleware = BodyLimits(downstream, config or Settings())
    await middleware({'type': 'http', 'path': path, 'method': 'POST',
                      'headers': list(headers)}, receive, send)
    assert middleware.reading == 0
    return calls, responses


def request(body=b'', more=False):
    return {'type': 'http.request', 'body': body, 'more_body': more}


@pytest.mark.asyncio
async def test_declared_oversize_rejected_without_reading_or_parsing():
    calls, responses = await probe([], headers=[(b'content-length', b'999999999')])
    assert not calls
    assert responses[0]['status'] == 413


@pytest.mark.asyncio
async def test_chunked_limit_rejected_before_framework():
    calls, responses = await probe([request(b'x' * 1000, True), request(b'x' * 25)],
                                   path='/api/auth/login', config=Settings(request_max_bytes=1024))
    assert not calls
    assert responses[0]['status'] == 413


@pytest.mark.asyncio
async def test_multipart_limit_across_single_byte_chunks():
    body = (b'--abc\r\nContent-Disposition: form-data; name="a"\r\n\r\nx\r\n' * 3
            + b'--abc--\r\n')
    calls, responses = await probe([request(bytes([b]), True) for b in body] + [request()],
        headers=[(b'content-type', b'multipart/form-data; boundary=abc')],
        config=Settings(request_max_parts=2))
    assert not calls
    assert responses[0]['status'] == 413


@pytest.mark.asyncio
async def test_valid_multipart_replayed_byte_for_byte():
    body = b'--abc\r\nContent-Disposition: form-data; name="a"\r\n\r\nx\r\n--abc--\r\n'
    calls, responses = await probe([request(body[:20], True), request(body[20:])],
        headers=[(b'content-type', b'multipart/form-data; boundary=abc')])
    assert not responses
    assert calls == [request(body)]


@pytest.mark.asyncio
@pytest.mark.parametrize('headers', [[(b'content-length', b'no')],
    [(b'content-length', b'2'), (b'content-length', b'2')]])
async def test_ambiguous_length(headers):
    calls, responses = await probe([], headers=headers)
    assert not calls
    assert responses[0]['status'] == 400


@pytest.mark.asyncio
async def test_idle_timeout_never_invokes_parser():
    config = Settings()
    # Short timing for the test only; production Settings validates >=1 second.
    config.request_body_idle_seconds = .01
    calls, responses = await probe([request()], config=config, delay=.05)
    assert not calls
    assert responses[0]['status'] == 408


@pytest.mark.asyncio
async def test_total_timeout_even_with_active_upload():
    config = Settings()
    config.request_body_seconds = .01
    config.request_body_idle_seconds = 1
    calls, responses = await probe([request(b'x', True)] * 10, config=config, delay=.005)
    assert not calls
    assert responses[0]['status'] == 408


@pytest.mark.asyncio
async def test_disconnect_does_not_invoke_app():
    calls, responses = await probe([{'type': 'http.disconnect'}])
    assert not calls and not responses


@pytest.mark.asyncio
async def test_malformed_multipart_does_not_invoke_parser():
    calls, responses = await probe([request(b'bad')],
        headers=[(b'content-type', b'multipart/form-data; boundary=abc')])
    assert not calls
    assert responses[0]['status'] == 400


@pytest.mark.asyncio
async def test_capacity_rejects_without_receiving():
    middleware = BodyLimits(None, Settings(request_body_concurrency=1))
    middleware.reading = 1
    responses = []
    async def send(message):
        responses.append(message)
    async def receive():
        pytest.fail('must not read the next upload')
    await middleware({'type': 'http', 'method': 'POST', 'path': '/api/documents',
                      'headers': []}, receive, send)
    assert middleware.reading == 1
    assert responses[0]['status'] == 503


def test_anonymous_upload_rejected_before_starlette_parser(client, monkeypatch):
    from starlette.formparsers import MultiPartParser
    def refuse(*args, **kwargs):
        pytest.fail('oversized anonymous request reached multipart parser')
    monkeypatch.setattr(MultiPartParser, 'parse', refuse)
    response = client.post('/api/documents', content=b'',
        headers={'Content-Type': 'multipart/form-data; boundary=a',
                 'Content-Length': '999999999'})
    assert response.status_code == 413
