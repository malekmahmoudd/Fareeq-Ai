from datetime import timedelta

from sqlalchemy import select

from app.db.base import utcnow
from app.db.models import Goal, UsageBucket, User, UserSession
from app.users.guest_cleanup import purge_expired_guests


def test_cleanup_erases_only_expired_guests_and_their_work(db):
    now = utcnow().replace(tzinfo=None)
    old = now - timedelta(days=40)
    expired = User(id="g_expired", display_name="Guest", created_at=old)
    active = User(id="g_active", display_name="Guest", created_at=old)
    promoted = User(
        id="g_promoted", display_name="Saved", password_hash="registered", created_at=old
    )
    recent = User(id="g_recent", display_name="Guest")
    ordinary = User(id="ordinary", display_name="Operator", created_at=old)
    db.add_all([expired, active, promoted, recent, ordinary])
    db.flush()
    db.add_all(
        [
            Goal(user_id=expired.id, title="Erase this"),
            Goal(user_id=promoted.id, title="Keep this"),
            UsageBucket(account=expired.id, kind="tokens", window=1, amount=20),
            UserSession(
                user_id=active.id, epoch=0, method="guest", expires_at=now + timedelta(days=1)
            ),
            UserSession(user_id=expired.id, epoch=0, method="guest", expires_at=old),
        ]
    )
    db.commit()
    assert purge_expired_guests(db) == 1
    db.commit()
    assert db.get(User, "g_expired") is None
    assert db.scalar(select(Goal).where(Goal.user_id == "g_expired")) is None
    assert db.scalar(select(UsageBucket).where(UsageBucket.account == "g_expired")) is None
    assert db.scalar(select(UserSession).where(UserSession.user_id == "g_expired")) is None
    for identity in ("g_active", "g_promoted", "g_recent", "ordinary"):
        assert db.get(User, identity) is not None
    assert purge_expired_guests(db) == 0


def test_semantic_search_can_be_explicitly_disabled(monkeypatch):
    from app.core.config import settings
    from app.documents import embedding

    monkeypatch.setattr(settings, "document_semantic_search", False)
    monkeypatch.setattr(
        embedding,
        "_load",
        lambda _: (_ for _ in ()).throw(AssertionError("Must not load the model")),
    )
    assert embedding.get_embedder() is None


def test_document_ingestion_is_serialized(monkeypatch):
    import asyncio

    from app.documents import service

    active = peak = 0

    async def fake_ingest(*args):
        nonlocal active, peak
        active += 1
        peak = max(peak, active)
        await asyncio.sleep(0.01)
        active -= 1

    monkeypatch.setattr(service, "_ingest", fake_ingest)

    async def run():
        await asyncio.gather(*(service.ingest(str(i), b"synthetic") for i in range(8)))

    asyncio.run(run())
    assert peak == 1


def test_restart_marks_only_incomplete_uploads_for_retry(db):
    from app.db.models import Document
    from app.documents.service import fail_interrupted_uploads

    guest = User(id="g_upload", display_name="Guest")
    db.add(guest)
    db.flush()
    rows = [
        Document(
            user_id=guest.id,
            agent_id="study",
            filename="verification.txt",
            kind="txt",
            size_bytes=100,
            sha256=(status[0] * 64),
            status=status,
        )
        for status in ("processing", "ready", "failed")
    ]
    db.add_all(rows)
    db.commit()
    assert fail_interrupted_uploads(db) == 1
    db.commit()
    db.refresh(rows[0])
    assert rows[0].status == "failed" and "upload the file again" in rows[0].error
    assert rows[1].status == "ready" and rows[2].status == "failed"


def test_wake_page_returns_to_only_the_configured_frontend(client):
    from app.core.config import settings

    response = client.get("/wake?return_to=https://evil.test")
    assert response.status_code == 200
    assert settings.frontend_url in response.text
    assert "evil.test" not in response.text
    assert "set-cookie" not in response.headers
    assert response.headers["cache-control"] == "no-store"
