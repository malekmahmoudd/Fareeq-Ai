"""Launch-profile checks with synthetic credentials; never contact a provider."""
import os
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BASE = {
    "ENVIRONMENT": "production", "DEBUG": "false", "AUTH_REQUIRED": "true",
    "AUTH_SECRET": "S" * 64, "LLM_PROVIDER": "groq", "LLM_API_KEY": "synthetic-private-key",
    "LLM_MODEL": "openai/gpt-oss-120b",
    "DATABASE_URL": "postgresql+psycopg://user:synthetic-db-secret@db.example.net/app?sslmode=require",
    "FRONTEND_URL": "https://fareeqai.pages.dev", "SIGNUP_ENABLED": "true",
    "GUEST_ENABLED": "true", "PUSH_ENABLED": "false", "VOICE_ENABLED": "false",
    "TTS_ENABLED": "false", "TEAM_ENABLED": "false",
}
CASES = [
    ("public", {}, True),
    ("invited", {"SIGNUP_ENABLED": "false", "GUEST_ENABLED": "false"}, True),
    ("invited", {}, False),
    ("public", {"GUEST_ENABLED": "false"}, False),
    ("public", {"SIGNUP_ENABLED": "false"}, False),
    ("public", {"PUBLIC_DAILY_TOKEN_BUDGET": "100001"}, False),
    ("public", {"PUBLIC_GUEST_SESSIONS_PER_DAY": "201"}, False),
    ("public", {"ACCOUNT_REQUESTS_PER_MINUTE": "7"}, False),
    ("public", {"AUTH_SECRET": "short-private-marker"}, False),
    ("public", {"AUTH_REQUIRED": "false"}, False),
]
with tempfile.TemporaryDirectory() as directory:
    env_file = Path(directory) / "launch.env"
    for audience, changes, expected in CASES:
        values = {**BASE, **changes}
        env_file.write_text("\n".join(f"{key}={value}" for key, value in values.items()))
        env_file.chmod(0o600)
        result = subprocess.run(
            [sys.executable, str(ROOT / "deploy/check-mvp-config.py"), "--target", "managed",
             "--audience", audience, "--env-file", str(env_file)],
            capture_output=True, text=True, cwd=ROOT, env=os.environ.copy(), check=False,
        )
        assert (result.returncode == 0) == expected, (audience, list(changes), result.stdout)
        for secret in [values["AUTH_SECRET"], values["LLM_API_KEY"], "synthetic-db-secret"]:
            assert secret not in result.stdout + result.stderr, "Credential echoed by preflight"
print("PASS: public/invited profiles, guest/auth requirements, quota ceilings and secret redaction (10 cases).")
