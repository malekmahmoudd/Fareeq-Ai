"""Validate a private deployment env file without printing credential values.

Run using backend/.venv/bin/python before deployment; this is a configuration
check, not proof of DNS, database connectivity or provider credential validity.
"""

import argparse
import json
import re
import sys
from pathlib import Path
from urllib.parse import parse_qs, urlsplit

from dotenv import dotenv_values
from pydantic import ValidationError
from pydantic_settings import SettingsError

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend"))
try:
    from app.core.config import Settings
except (ValidationError, SettingsError):
    print("FAIL: startup settings are invalid; credential values withheld.")
    raise SystemExit(1) from None

parser = argparse.ArgumentParser()
parser.add_argument("--env-file", type=Path, default=Path(__file__).with_name(".env"))
parser.add_argument("--target", choices=("compose", "managed"), default="compose")
args = parser.parse_args()
if not args.env_file.is_file():
    parser.exit(1, "FAIL: private production env file is missing.\n")
config = dotenv_values(args.env_file)
errors = []
required = ["AUTH_SECRET", "LLM_PROVIDER", "LLM_API_KEY", "LLM_MODEL"]
required += (
    ["DOMAIN", "DB_PASSWORD"] if args.target == "compose" else ["DATABASE_URL", "FRONTEND_URL"]
)
for key in required:
    value = config.get(key) or ""
    if not value or any(marker in value.lower() for marker in ("replace-with", "your-domain")):
        errors.append(f"{key}: missing or placeholder")
domain = config.get("DOMAIN") or ""
if args.target == "compose" and (
    not re.fullmatch(r"[a-zA-Z0-9.-]+", domain)
    or "." not in domain
    or domain.lower().endswith((".example", ".test", ".invalid", ".localhost"))
):
    errors.append("DOMAIN: requires a real host name without scheme, path or port")
password = config.get("DB_PASSWORD") or ""
if args.target == "compose" and not re.fullmatch(r"[A-Za-z0-9_-]{32,}", password):
    errors.append(
        "DB_PASSWORD: requires at least 32 URL-safe characters; preserve existing DB secrets"
    )
if args.target == "managed":
    try:
        database = urlsplit(config.get("DATABASE_URL") or "")
        frontend = urlsplit(config.get("FRONTEND_URL") or "")
        if (
            database.scheme != "postgresql+psycopg"
            or not database.hostname
            or database.hostname in ("localhost", "127.0.0.1", "db")
            or not database.username
            or not database.password
            or not database.path.strip("/")
            or parse_qs(database.query).get("sslmode", [""])[0] not in ("require", "verify-full")
        ):
            errors.append("DATABASE_URL: requires hosted PostgreSQL using psycopg and TLS")
        if (
            frontend.scheme != "https"
            or not frontend.hostname
            or frontend.hostname in ("localhost", "127.0.0.1")
            or frontend.hostname.endswith((".example", ".invalid", ".test"))
            or frontend.username
            or frontend.password
            or frontend.path not in ("", "/")
            or frontend.query
            or frontend.fragment
        ):
            errors.append("FRONTEND_URL: requires the real HTTPS frontend origin")
    except ValueError:
        errors.append("Deployment URLs are invalid; values withheld")
    for key, expected in (
        ("ENVIRONMENT", "production"),
        ("DEBUG", "false"),
        ("AUTH_REQUIRED", "true"),
    ):
        if (config.get(key) or "").lower() != expected:
            errors.append(f"{key}: invalid production setting")
if (config.get("LLM_PROVIDER") or "").lower() not in ("groq", "openai"):
    errors.append("LLM_PROVIDER: limited MVP uses the verified OpenAI-compatible contract")
for key in (
    "SIGNUP_ENABLED",
    "PUSH_ENABLED",
    "VOICE_ENABLED",
    "TTS_ENABLED",
    "TEAM_ENABLED",
):
    if (config.get(key) or "").lower() != "false":
        errors.append(f"{key}: set false for the initial limited MVP")
try:
    values = {key.lower(): value for key, value in config.items() if value is not None}
    for field in ("auth_access_keys", "admin_accounts"):
        if field in values:
            try:
                values[field] = json.loads(values[field])
            except ValueError:
                errors.append(f"{field}: invalid JSON configuration")
                values[field] = {} if field == "auth_access_keys" else []
    if args.target == "compose":
        values.update(
            environment="production",
            debug=False,
            auth_required=True,
            frontend_url=f"https://{domain}",
            database_url=f"postgresql+psycopg://modeer:{password}@db:5432/modeer",
        )
    settings = Settings(_env_file=None, **values)
    if settings.account_requests_per_minute > 10 or settings.account_daily_token_budget > 60000:
        errors.append(
            "Account quotas exceed the initial MVP envelope (10/minute, 60000 tokens/day)"
        )
except ValidationError as exc:
    # Do not stringify ValidationError: its representation includes input values.
    for error in exc.errors():
        field = ".".join(map(str, error["loc"])) or "production settings"
        errors.append(f"{field}: invalid configuration")
except SettingsError:
    errors.append("Environment settings are invalid; credential values withheld")
if errors:
    for error in dict.fromkeys(errors):
        print("FAIL:", error)
    raise SystemExit(1)
print(
    "PASS: required private configuration, HTTPS origin, authentication and limited MVP switches."
)
print("Pending live checks: DNS/TLS, database access, provider models/key and spending budget.")
