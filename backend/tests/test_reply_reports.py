from app.core.config import settings
from app.db.models import Conversation, Message, User


def test_report_ownership_validation_idempotence_and_admin_review(client, db, user, monkeypatch):
    conversation = Conversation(user_id=user.id, agent_id="study")
    db.add(conversation)
    db.flush()
    reply = Message(conversation_id=conversation.id, role="assistant", content="Test reply")
    question = Message(conversation_id=conversation.id, role="user", content="Test question")
    db.add_all([reply, question])
    db.commit()
    endpoint = f"/api/conversations/{conversation.id}/messages/{reply.id}/report"
    assert client.post(endpoint, json={"reason": "unsafe"}).status_code == 201
    db.expire_all()
    first = db.get(Message, reply.id).meta["safety_report"]
    assert first["reason"] == "unsafe"
    assert "created_at" in first
    assert client.post(endpoint, json={"reason": "other"}).status_code == 201
    db.expire_all()
    assert db.get(Message, reply.id).meta["safety_report"] == first
    assert client.post(endpoint, json={"reason": "invalid"}).status_code == 422
    assert client.post(
        f"/api/conversations/{conversation.id}/messages/{question.id}/report",
        json={"reason": "unsafe"},
    ).status_code == 404
    other = User(display_name="Other")
    db.add(other)
    db.commit()
    assert client.post(
        endpoint, json={"reason": "unsafe"}, headers={"X-User-Id": other.id}
    ).status_code == 404
    assert client.get("/api/admin/reply-reports").status_code == 404
    monkeypatch.setattr(settings, "admin_accounts", [user.id])
    rows = client.get("/api/admin/reply-reports").json()
    assert len(rows) == 1
    assert rows[0]["content"] == "Test reply"
    assert rows[0]["report"] == first
    assert client.get(
        "/api/admin/reply-reports", headers={"X-User-Id": other.id}
    ).status_code == 404
    reply_id = reply.id
    assert client.post("/api/users/me/delete", json={"confirm": "DELETE"}).status_code == 204
    db.expire_all()
    assert db.get(Message, reply_id) is None
