import pytest

from app.core.config import settings
from tests.test_auth import enable


def guest_mode(monkeypatch):
    enable(monkeypatch, [])
    monkeypatch.setattr(settings, "guest_enabled", True)
    monkeypatch.setattr(settings, "signup_enabled", True)
    return {"Origin": settings.frontend_url}


def test_guest_isolation_idempotence_and_promotion(client, monkeypatch):
    headers = guest_mode(monkeypatch)
    assert (
        client.post("/api/auth/guest", headers={"Origin": "https://evil.test"}).status_code == 403
    )
    assert client.post("/api/auth/guest", headers=headers).status_code == 200
    first = client.get("/api/users/me").json()
    assert first["is_guest"] and first["onboarded"] and not first["memory_auto"]
    goal = client.post("/api/goals", headers=headers, json={"title": "Private guest goal"}).json()
    assert client.post("/api/auth/guest", headers=headers).status_code == 200
    assert client.get("/api/users/me").json()["id"] == first["id"]
    old_cookie = client.cookies.get("modeer_session")
    promoted = client.post(
        "/api/auth/signup",
        headers=headers,
        json={
            "email": "guest@example.com",
            "password": "Strong guest password 72!",
            "display_name": "Visitor",
        },
    )
    assert promoted.status_code == 201, promoted.text
    me = client.get("/api/users/me").json()
    assert me["id"] == first["id"] and not me["is_guest"]
    assert client.get("/api/goals").json()[0]["id"] == goal["id"]
    client.cookies.clear()
    client.cookies.set("modeer_session", old_cookie)
    assert client.get("/api/users/me").status_code == 401
    client.cookies.clear()
    assert client.post("/api/auth/guest", headers=headers).status_code == 200
    second = client.get("/api/users/me", headers={"X-User-Id": first["id"]}).json()
    assert second["id"] != first["id"] and second["is_guest"]
    assert client.get("/api/goals").json() == []
    assert (
        client.patch(
            "/api/goals/" + goal["id"], headers=headers, json={"status": "done"}
        ).status_code
        == 404
    )
    assert (
        client.post("/api/users/me/delete", headers=headers, json={"confirm": "DELETE"}).status_code
        == 204
    )
    assert client.get("/api/users/me").status_code == 401
    assert (
        client.post(
            "/api/auth/login",
            headers=headers,
            json={"email": "guest@example.com", "password": "Strong guest password 72!"},
        ).status_code
        == 200
    )
    assert client.get("/api/goals").json()[0]["id"] == goal["id"]


def test_guest_access_requires_explicit_enable(client, monkeypatch):
    enable(monkeypatch, [])
    monkeypatch.setattr(settings, "guest_enabled", False)
    assert (
        client.post("/api/auth/guest", headers={"Origin": settings.frontend_url}).status_code == 404
    )
    assert client.get("/api/users/me").status_code == 401


@pytest.mark.parametrize("stream", [False, True])
def test_global_ai_budget_survives_new_guest_sessions(client, monkeypatch, stream):
    headers = guest_mode(monkeypatch)
    monkeypatch.setattr(settings, "public_daily_token_budget", 1)
    for _ in range(2):
        client.cookies.clear()
        assert client.post("/api/auth/guest", headers=headers).status_code == 200
        response = client.post(
            "/api/agents/study/chat" + ("/stream" if stream else ""),
            headers=headers,
            json={"message": "hello"},
        )
        assert response.status_code == (200 if stream else 429)
        assert "daily AI allowance" in response.text


def test_global_budget_is_shared_and_refunds_provider_failure(monkeypatch):
    import asyncio

    from sqlalchemy import select

    from app.core.usage import BudgetedProvider, BudgetExceeded, account_scope
    from app.db.models import UsageBucket
    from app.db.session import SessionLocal
    from app.llm.openai_compat_provider import ProviderError

    monkeypatch.setattr(settings, "guest_enabled", True)
    monkeypatch.setattr(settings, "public_daily_token_budget", 150)

    class Provider:
        name = "test"

        async def stream_chat(self, **kwargs):
            yield "reply"

    async def run(account, inner):
        token = account_scope.set(account)
        try:
            return [
                delta
                async for delta in BudgetedProvider(inner).stream_chat(
                    system="hello", messages=[], model="test", temperature=0, max_tokens=100
                )
            ]
        finally:
            account_scope.reset(token)

    assert asyncio.run(run("first-guest", Provider())) == ["reply"]
    with pytest.raises(BudgetExceeded):
        asyncio.run(run("second-guest", Provider()))
    with SessionLocal() as db:
        assert (
            db.scalar(select(UsageBucket.amount).where(UsageBucket.account == "second-guest")) == 0
        )

    class Failed:
        name = "failed"

        async def stream_chat(self, **kwargs):
            raise ProviderError("Unavailable")
            yield ""

    monkeypatch.setattr(settings, "public_daily_token_budget", 500)
    with pytest.raises(ProviderError):
        asyncio.run(run("third-guest", Failed()))
    with SessionLocal() as db:
        assert (
            db.scalar(select(UsageBucket.amount).where(UsageBucket.account == "public-demo")) == 118
        )
