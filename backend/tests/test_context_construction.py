from __future__ import annotations

from types import SimpleNamespace

import pytest

from app.agents.context import build_context
from app.agents.registry import all_agents, require_agent


def _mem(category, key, value):
    return SimpleNamespace(category=category, key=key, value=value)


def _user():
    return SimpleNamespace(display_name="Sam", profile={}, onboarded=True, id="u1")


def test_shared_context_is_injected_with_markers():
    agent = require_agent("career")
    packet = build_context(
        agent=agent,
        user=_user(),
        shared=[_mem("career", "career_goal", "become a data scientist")],
        agent_memory=[],
        goals=[],
        history=[],
        user_message="what next?",
    )
    assert "<<PERSONAL_CONTEXT>>" in packet.system
    assert "become a data scientist" in packet.system
    assert packet.diagnostics["personal_context_count"] == 1


def test_agent_memory_block_is_separate_from_shared():
    agent = require_agent("study")
    packet = build_context(
        agent=agent,
        user=_user(),
        shared=[_mem("education", "major", "physics")],
        agent_memory=[_mem("weak_topics", "weak_topic", "integrals")],
        goals=[],
        history=[],
        user_message="help",
    )
    assert "<<PERSONAL_CONTEXT>>" in packet.system
    assert "<<AGENT_MEMORY>>" in packet.system
    assert "integrals" in packet.system
    assert packet.diagnostics["agent_memory_used"] == ["weak_topics.weak_topic"]


def test_empty_memory_renders_placeholder_not_crash():
    packet = build_context(
        agent=require_agent("career"), user=_user(), shared=[], agent_memory=[],
        goals=[], history=[], user_message="hi",
    )
    assert "(none recorded yet)" in packet.system
    assert packet.diagnostics["personal_context_count"] == 0


def test_history_maps_roles_and_excludes_system():
    agent = require_agent("study")
    history = [
        SimpleNamespace(role="user", content="hi"),
        SimpleNamespace(role="assistant", content="hello"),
        SimpleNamespace(role="system", content="internal note"),
    ]
    packet = build_context(
        agent=agent, user=_user(), shared=[], agent_memory=[], goals=[],
        history=history, user_message="next",
    )
    roles = [m.role for m in packet.messages]
    assert roles == ["user", "assistant", "user"]
    assert all("internal note" not in m.content for m in packet.messages)


def test_guardrails_always_present():
    for slug in ("modeer", "study", "finance", "email"):
        packet = build_context(
            agent=require_agent(slug), user=_user(), shared=[], agent_memory=[],
            goals=[], history=[], user_message="hi",
        )
        assert "no tools and no external access" in packet.system.lower()
        assert "hidden reasoning" in packet.system.lower()


@pytest.mark.parametrize("agent", all_agents(), ids=lambda agent: agent.id)
@pytest.mark.parametrize("dialect,spoken", [(None, False), ("egyptian", True)])
def test_short_default_reaches_every_agent_after_persona_and_context(agent, dialect, spoken):
    # Existing verbose replies must not displace the shared instruction. Both
    # native and web chat use this packet, including Arabic and voice mode.
    packet = build_context(
        agent=agent, user=_user(), shared=[], agent_memory=[], goals=[],
        history=[
            SimpleNamespace(role="user", content="Help me plan"),
            SimpleNamespace(role="assistant", content="A very long explanation. " * 100),
        ],
        user_message="Give me a complete fourteen-day plan.",
        dialect=dialect, spoken=spoken,
    )
    final_policy = packet.system.rsplit("## Before you send", 1)[1]
    assert "40–80 words" in final_policy
    assert "120 words" in final_policy
    assert "cover every requested item" in final_policy
    assert "safety guidance and document citations" in final_policy
    assert packet.system.index("## Before you send") > packet.system.index(agent.system_prompt)
    assert packet.messages[-1].content == "Give me a complete fourteen-day plan."
    if spoken:
        assert "at most 100 words" in packet.system
