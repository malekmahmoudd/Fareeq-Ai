"""Erase expired guest work, with the same account lock used by signup."""

from datetime import timedelta

from sqlalchemy import exists, select, update
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.base import utcnow
from app.db.models import User, UserSession
from app.users.service import delete_user


def purge_expired_guests(db: Session, *, batch_size: int = 100) -> int:
    now = utcnow().replace(tzinfo=None)
    cutoff = now - timedelta(seconds=settings.session_seconds)
    candidates = list(
        db.scalars(
            select(User.id)
            .where(
                User.id.startswith("g_", autoescape=True),
                User.password_hash.is_(None),
                User.created_at <= cutoff,
                ~exists().where(UserSession.user_id == User.id, UserSession.expires_at > now),
            )
            .order_by(User.created_at)
            .limit(batch_size)
        )
    )
    removed = 0
    for identity in candidates:
        # Signup takes this row's write lock too. Recheck after acquiring it:
        # a concurrent promotion must never lose the newly registered account.
        locked = db.execute(
            update(User)
            .where(
                User.id == identity,
                User.password_hash.is_(None),
                User.created_at <= cutoff,
            )
            .values(session_epoch=User.session_epoch),
            execution_options={"synchronize_session": False},
        )
        if locked.rowcount != 1:
            continue
        account = db.get(User, identity)
        db.refresh(account)
        if not account.is_guest:
            continue
        live_device = db.scalar(
            select(
                exists().where(
                    UserSession.user_id == identity,
                    UserSession.expires_at > now,
                )
            )
        )
        if live_device:
            continue
        delete_user(db, account)
        removed += 1
    return removed
