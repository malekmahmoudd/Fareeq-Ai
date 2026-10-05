"""Concrete MVP credential exposure and replay regressions."""

from concurrent.futures import ThreadPoolExecutor
from threading import Barrier

import pytest
from fastapi.testclient import TestClient

from app.core import passwords, totp
from app.core.config import settings
from app.db.base import utcnow
from app.db.models import User
from app.main import app


@pytest.mark.parametrize(
    "path,body,secrets",
    [
        (
            "login",
            {
                "access_key": "synthetic-key-" * 4,
                "email": "test@example.com",
                "password": "synthetic-private-password",
                "code": "synthetic-recovery-code",
            },
            ["synthetic-key-", "synthetic-private-password", "synthetic-recovery-code"],
        ),
        (
            "signup",
            {"email": "test@example.com", "display_name": "Test", "password": "short!"},
            ["short!"],
        ),
        (
            "recover",
            {
                "email": "test@example.com",
                "code": "synthetic-recovery-code",
                "new_password": "short!",
            },
            ["synthetic-recovery-code", "short!"],
        ),
    ],
)
def test_validation_errors_never_return_credentials(client, path, body, secrets):
    response = client.post("/api/auth/" + path, json=body)
    assert response.status_code == 422
    for secret in secrets:
        assert secret not in response.text
    assert response.headers.get("Cache-Control") == "no-store"
    assert all(set(error) <= {"loc", "msg", "type"} for error in response.json()["detail"])


def test_concurrent_logins_cannot_reuse_totp(monkeypatch, db):
    from app.api.routes import auth

    secret = totp.new_secret()
    step = totp.current_step()
    monkeypatch.setattr(totp, "current_step", lambda now=None: step)
    user = User(
        display_name="Replay probe",
        email="replay@example.com",
        password_hash=passwords.hash_password("synthetic-test-password"),
        totp_secret=secret,
        totp_enabled_at=utcnow(),
        totp_last_step=step - 1,
    )
    db.add(user)
    db.commit()
    monkeypatch.setattr(settings, "auth_required", True)
    monkeypatch.setattr(settings, "auth_secret", "s" * 40)
    barrier = Barrier(2)
    original = auth._by_email

    def both_read_old_state(session, email):
        account = original(session, email)
        barrier.wait(timeout=5)
        return account

    monkeypatch.setattr(auth, "_by_email", both_read_old_state)

    def login(_):
        with TestClient(app) as client:
            return client.post(
                "/api/auth/login",
                headers={"Origin": settings.frontend_url},
                json={
                    "email": user.email,
                    "password": "synthetic-test-password",
                    "code": totp.code_at(secret, step),
                },
            ).status_code

    with ThreadPoolExecutor(max_workers=2) as pool:
        statuses = list(pool.map(login, range(2)))
    assert sorted(statuses) == [200, 401]


def test_suspended_recovery_does_not_spend_code_or_issue_session(client, monkeypatch, db):
    from app.db.models import RecoveryCode

    code = "SYNTHETIC-RECOVERY-CODE"
    user = User(
        display_name="Suspended",
        email="suspended@example.com",
        password_hash=passwords.hash_password("synthetic-old-password"),
        suspended_at=utcnow(),
    )
    db.add(user)
    db.flush()
    row = RecoveryCode(user_id=user.id, code_hash=passwords.hash_recovery_code(code))
    db.add(row)
    db.commit()
    original_hash = user.password_hash
    monkeypatch.setattr(settings, "auth_required", True)
    monkeypatch.setattr(settings, "auth_secret", "s" * 40)
    response = client.post(
        "/api/auth/recover",
        headers={"Origin": settings.frontend_url},
        json={"email": user.email, "code": code, "new_password": "synthetic-new-password"},
    )
    assert response.status_code == 403
    assert "set-cookie" not in response.headers
    db.refresh(user)
    db.refresh(row)
    assert user.password_hash == original_hash and row.used_at is None
