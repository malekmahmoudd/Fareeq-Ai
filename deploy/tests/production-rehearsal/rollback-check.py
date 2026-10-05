"""Compatible-image rollback in the disposable loopback rehearsal only."""

import http.client
import json
import re
import ssl
import subprocess
import tempfile
import time
from pathlib import Path

root = Path(__file__).resolve().parents[3]
assert re.search(
    r"^name: modeer-rehearsal$",
    (root / "deploy/tests/production-rehearsal/compose.yml").read_text(),
    re.M,
), "Rollback helper requires the disposable rehearsal project"
compose = ["docker", "compose", "-f", str(root / "deploy/tests/production-rehearsal/compose.yml")]
context = ssl._create_unverified_context()


def request(method, path, data=None, cookie=None):
    conn = http.client.HTTPSConnection("localhost", 8443, context=context, timeout=10)
    headers = {"Origin": "https://localhost:8443"}
    if cookie:
        headers["Cookie"] = cookie
    if data is not None:
        headers["Content-Type"] = "application/json"
    conn.request(method, path, json.dumps(data) if data is not None else None, headers)
    response = conn.getresponse()
    body = response.read()
    result = response.status, body, response.getheader("Set-Cookie")
    conn.close()
    return result


status, _, cookie = request("POST", "/api/auth/login", {"access_key": "q" * 40})
assert status == 200
cookie = cookie.split(";")[0]
status, baseline, _ = request("GET", "/api/conversations/recent", cookie=cookie)
assert status == 200
before = json.loads(baseline)


def ready():
    for _ in range(50):
        try:
            status, _, _ = request("GET", "/api/health/detail")
            page, _, _ = request("GET", "/login")
            if status == 200 and page == 200:
                return
        except (OSError, http.client.HTTPException):
            pass
        time.sleep(0.2)
    raise AssertionError("release failed to become ready")


patch = Path(tempfile.gettempdir()) / "fareeq-rollback-compose.yml"
patch.write_text(
    "services:\n  backend:\n    image: fareeq-backend:audited-baseline\n"
    "  frontend:\n    image: fareeq-frontend:p0-before-layout\n"
)
try:
    subprocess.run(
        [*compose, "-f", str(patch), "up", "-d", "--no-build", "--no-deps", "backend", "frontend"],
        check=True,
    )
    ready()
    patch.unlink(missing_ok=True)
    status, body, _ = request("GET", "/api/conversations/recent", cookie=cookie)
    assert status == 200 and json.loads(body) == before
finally:
    subprocess.run(
        [*compose, "up", "-d", "--no-build", "--no-deps", "backend", "frontend"], check=True
    )
    ready()
status, body, _ = request("GET", "/api/conversations/recent", cookie=cookie)
assert status == 200 and json.loads(body) == before
status, _, _ = request("POST", "/api/documents", None, cookie)
assert status in (400, 422)
print(
    json.dumps(
        {
            "checks": [
                "audited backend and previous patched frontend become ready",
                "existing signed session and conversations survive image rollback",
                "current images become ready again with the same session and conversations",
            ],
            "schema": "0012 unchanged; no automatic database downgrade",
            "scope": "Loopback only; retired backend is not approved for public deployment",
        }
    )
)
