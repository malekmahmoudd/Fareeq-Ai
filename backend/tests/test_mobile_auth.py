from app.core.config import settings
from tests.test_guest import guest_mode


def mobile_mode(monkeypatch):
    guest_mode(monkeypatch)
    monkeypatch.setattr(settings, "mobile_enabled", True)


def test_mobile_audience_origin_and_revocation(client, monkeypatch):
    mobile_mode(monkeypatch)
    assert (
        client.post("/api/auth/mobile/guest", headers={"Origin": settings.frontend_url}).status_code
        == 403
    )
    assert (
        client.post("/api/auth/mobile/guest", headers={"Sec-Fetch-Site": "same-origin"}).status_code
        == 403
    )
    response = client.post("/api/auth/mobile/guest")
    assert response.status_code == 200
    assert "set-cookie" not in response.headers
    assert response.headers["cache-control"] == "no-store"
    token = response.json()["access_token"]
    headers = {"Authorization": "Bearer " + token}
    first = client.get("/api/users/me", headers=headers).json()
    assert first["is_guest"]
    assert client.post("/api/auth/mobile/guest", headers=headers).json()["signed_in"]
    assert (
        client.get(
            "/api/users/me", headers={**headers, "Origin": settings.frontend_url}
        ).status_code
        == 401
    )
    goal = client.post("/api/goals", headers=headers, json={"title": "Mobile private goal"})
    assert goal.status_code == 201, goal.text
    client.cookies.set("modeer_session", token)
    assert client.get("/api/users/me").status_code == 401
    client.cookies.clear()
    assert (
        client.post("/api/auth/guest", headers={"Origin": settings.frontend_url}).status_code == 200
    )
    cookie = client.cookies.get("modeer_session")
    assert (
        client.get("/api/users/me", headers={"Authorization": "Bearer " + cookie}).status_code
        == 401
    )
    assert client.get("/api/goals").json() == []
    assert client.post("/api/auth/logout", headers=headers).status_code == 200
    assert client.get("/api/users/me", headers=headers).status_code == 401


def test_mobile_guest_promotion_and_login(client, monkeypatch):
    mobile_mode(monkeypatch)
    token = client.post("/api/auth/mobile/guest").json()["access_token"]
    headers = {"Authorization": "Bearer " + token}
    uid = client.get("/api/users/me", headers=headers).json()["id"]
    body = {
        "email": "mobile@example.com",
        "password": "Strong mobile password 72!",
        "display_name": "Visitor",
    }
    response = client.post("/api/auth/mobile/signup", headers=headers, json=body)
    assert response.status_code == 201, response.text
    assert response.json()["recovery_codes"]
    assert client.get("/api/users/me", headers=headers).status_code == 401
    headers = {"Authorization": "Bearer " + response.json()["access_token"]}
    me = client.get("/api/users/me", headers=headers).json()
    assert me["id"] == uid and not me["is_guest"]
    response = client.post(
        "/api/auth/mobile/login", json={"email": body["email"], "password": body["password"]}
    )
    assert response.status_code == 200
    assert "access_token" in response.json()
    monkeypatch.setattr(settings, "mobile_enabled", False)
    assert client.post("/api/auth/mobile/guest").status_code == 404
    assert client.get("/api/users/me", headers=headers).status_code == 401


def test_mobile_two_factor_requires_second_step(client, monkeypatch, db):
    from app.core import totp
    from app.db.base import utcnow
    from app.db.models import User

    mobile_mode(monkeypatch)
    body = {
        "email": "2fa@example.com",
        "password": "Strong mobile password 72!",
        "display_name": "Visitor",
    }
    result = client.post("/api/auth/mobile/signup", json=body).json()
    uid = client.get(
        "/api/users/me", headers={"Authorization": "Bearer " + result["access_token"]}
    ).json()["id"]
    account = db.get(User, uid)
    account.totp_secret = totp.new_secret()
    account.totp_enabled_at = utcnow()
    db.commit()
    response = client.post(
        "/api/auth/mobile/login", json={"email": body["email"], "password": body["password"]}
    )
    assert response.json() == {"signed_in": False, "two_factor_required": True}
    response = client.post(
        "/api/auth/mobile/login",
        json={
            "email": body["email"],
            "password": body["password"],
            "code": result["recovery_codes"][0],
        },
    )
    assert response.status_code == 200 and response.json()["access_token"]
    assert (
        client.post(
            "/api/auth/mobile/login",
            json={
                "email": body["email"],
                "password": body["password"],
                "code": result["recovery_codes"][0],
            },
        ).status_code
        == 401
    )


def test_native_chat_history_pin_and_isolation(client, monkeypatch):
    import json

    mobile_mode(monkeypatch)
    token = client.post("/api/auth/mobile/guest").json()["access_token"]
    headers = {"Authorization": "Bearer " + token}
    response = client.post(
        "/api/agents/career/chat/stream",
        headers=headers,
        json={"message": "Help me prepare for an interview."},
    )
    assert response.status_code == 200
    events = [
        json.loads(line[6:]) for line in response.text.splitlines() if line.startswith("data: ")
    ]
    start = next(event for event in events if event["type"] == "start")
    end = next(event for event in events if event["type"] == "end")
    assert end["completion"] == "completed"
    cid, mid = start["conversation_id"], end["message_id"]
    assert (
        client.patch(
            f"/api/conversations/{cid}/messages/{mid}", headers=headers, json={"pinned": True}
        ).status_code
        == 204
    )
    assert client.get("/api/conversations/pinned", headers=headers).json()[0]["message_id"] == mid
    assert len(client.get(f"/api/conversations/{cid}", headers=headers).json()["messages"]) == 2
    other = client.post("/api/auth/mobile/guest").json()["access_token"]
    assert (
        client.get(
            f"/api/conversations/{cid}", headers={"Authorization": "Bearer " + other}
        ).status_code
        == 404
    )
    assert (
        client.get("/api/conversations", headers={"Authorization": "Bearer broken"}).status_code
        == 401
    )
