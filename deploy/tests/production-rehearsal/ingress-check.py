"""Anonymous HTTPS probes. Only loopback rehearsal; never sends credentials."""

import http.client
import json
import ssl
from contextlib import closing
from urllib.parse import urlsplit

base = urlsplit("https://localhost:8443")
context = ssl._create_unverified_context()  # disposable Caddy local CA only
results = {}


def connect():
    return http.client.HTTPSConnection(base.hostname, base.port, context=context, timeout=20)


with closing(connect()) as conn:
    conn.putrequest("POST", "/api/documents")
    conn.putheader("Content-Type", "multipart/form-data; boundary=a")
    conn.putheader("Content-Length", "999999999")
    conn.endheaders()  # no body: rejection must precede receiving/parsing it
    response = conn.getresponse()
    assert response.status == 413, response.status
    results["declared_oversize_without_body"] = response.status

with closing(connect()) as conn:
    body = b'--abc\r\nContent-Disposition: form-data; name="x"\r\n\r\nx\r\n' * 9 + b"--abc--\r\n"
    conn.request(
        "POST",
        "/api/documents",
        iter([body[:31], body[31:]]),
        {"Content-Type": "multipart/form-data; boundary=abc"},
        encode_chunked=True,
    )
    response = conn.getresponse()
    assert response.status == 413, response.status
    results["chunked_excessive_parts"] = response.status

with closing(connect()) as conn:
    conn.request(
        "POST",
        "/api/auth/login",
        iter([b"x" * 65536] * 16 + [b"x"]),
        {"Content-Type": "application/json"},
        encode_chunked=True,
    )
    response = conn.getresponse()
    assert response.status == 413, response.status
    results["chunked_oversize_json"] = response.status

with closing(connect()) as conn:
    conn.putrequest("POST", "/api/documents")
    conn.putheader("Content-Length", "1")
    conn.endheaders()  # stall instead of sending the advertised byte
    response = conn.getresponse()
    assert response.status == 408, response.status
    results["stalled_body"] = response.status

print(json.dumps(results, indent=2))
