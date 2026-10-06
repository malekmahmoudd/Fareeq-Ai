"""Encrypted managed-PostgreSQL backup and isolated local restore verification.

Requires Docker, openssl and backend Python dependencies. Never prints secrets.
The restore container has no network or published ports; only its own data is removed.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import secrets
import shutil
import subprocess
import tempfile
import time
from pathlib import Path
from urllib.parse import parse_qs, unquote, urlsplit

from dotenv import dotenv_values

parser = argparse.ArgumentParser()
parser.add_argument("--env-file", type=Path, required=True)
parser.add_argument("--output", type=Path, required=True)
parser.add_argument("--image", default="postgres:18-alpine")
args = parser.parse_args()
docker = shutil.which("docker") or "/Applications/Docker.app/Contents/Resources/bin/docker"
output = args.output.expanduser().resolve()
output.mkdir(parents=True, exist_ok=True, mode=0o700)
output.chmod(0o700)
key = output / "restore-key.txt"
archive = output / "database.dump.enc"
if key.exists() or archive.exists():
    raise SystemExit("Refusing to overwrite an existing backup or key.")
key.write_text(secrets.token_urlsafe(48) + "\n")
key.chmod(0o600)
url = urlsplit(dotenv_values(args.env_file).get("DATABASE_URL") or "")
if url.scheme not in ("postgresql", "postgresql+psycopg") or not url.hostname:
    raise SystemExit("Invalid PostgreSQL configuration; values withheld.")
sslmode = parse_qs(url.query).get("sslmode", [""])[0]
if sslmode not in ("require", "verify-full"):
    raise SystemExit("A TLS-protected source connection is required.")
name = "fareeqai-restore-" + secrets.token_hex(6)
created = False
children = []

def command(argv: list[str], **kwargs):
    return subprocess.run(argv, capture_output=True, check=True, timeout=180, **kwargs)

try:
    with tempfile.TemporaryDirectory() as temporary:
        pg_env = Path(temporary) / "source.env"
        values = {
            "PGHOST": url.hostname, "PGPORT": str(url.port or 5432),
            "PGUSER": unquote(url.username or ""), "PGPASSWORD": unquote(url.password or ""),
            "PGDATABASE": unquote(url.path.lstrip("/")), "PGSSLMODE": sslmode,
            "PGCONNECT_TIMEOUT": "15",
        }
        if any("\n" in value or "\r" in value for value in values.values()):
            raise ValueError("Multiline connection value")
        pg_env.write_text("\n".join(f"{k}={v}" for k, v in values.items()))
        pg_env.chmod(0o600)
        # Pipe directly into encryption; the plaintext archive is never saved on disk.
        with tempfile.TemporaryFile() as errors:
            dump = subprocess.Popen(
                [docker, "run", "--rm", "--env-file", str(pg_env), args.image,
                 "pg_dump", "-Fc", "--no-owner", "--no-privileges"],
                stdout=subprocess.PIPE, stderr=errors,
            )
            children.append(dump)
            with archive.open("wb") as encrypted:
                archive.chmod(0o600)
                encrypt = subprocess.Popen(
                    ["openssl", "enc", "-aes-256-cbc", "-pbkdf2", "-iter", "240000",
                     "-salt", "-pass", "file:" + str(key)],
                    stdin=dump.stdout, stdout=encrypted, stderr=errors,
                )
                children.append(encrypt)
                dump.stdout.close()
                if encrypt.wait(timeout=180) or dump.wait(timeout=30):
                    raise RuntimeError("Backup pipeline failed")
        print("PASS encrypted managed database snapshot created; no plaintext archive saved.", flush=True)
        target_env = Path(temporary) / "target.env"
        target_env.write_text("POSTGRES_PASSWORD=" + secrets.token_urlsafe(32) + "\nPOSTGRES_DB=verification\n")
        target_env.chmod(0o600)
        command([docker, "run", "-d", "--name", name, "--network", "none",
                 "--memory", "512m", "--tmpfs", "/var/lib/postgresql:rw,nosuid,size=384m",
                 "--env-file", str(target_env), args.image])
        created = True
        for _ in range(30):
            ready = subprocess.run([docker, "exec", name, "pg_isready", "-U", "postgres",
                                    "-d", "verification"], capture_output=True, timeout=10)
            if ready.returncode == 0:
                break
            time.sleep(1)
        else:
            raise RuntimeError("Isolated restore database did not become ready")
        with tempfile.TemporaryFile() as errors:
            decrypt = subprocess.Popen(
                ["openssl", "enc", "-d", "-aes-256-cbc", "-pbkdf2", "-iter", "240000",
                 "-pass", "file:" + str(key), "-in", str(archive)],
                stdout=subprocess.PIPE, stderr=errors,
            )
            restore = subprocess.Popen(
                [docker, "exec", "-i", name, "pg_restore", "-U", "postgres", "-d",
                 "verification", "--clean", "--if-exists", "--no-owner", "--no-privileges",
                 "--exit-on-error"], stdin=decrypt.stdout, stdout=errors, stderr=errors,
            )
            children.extend([decrypt, restore])
            decrypt.stdout.close()
            if restore.wait(timeout=180) or decrypt.wait(timeout=30):
                raise RuntimeError("Isolated restore failed")
        sql = (
            "SELECT version_num FROM alembic_version; "
            "SELECT count(*) FROM users; SELECT count(*) FROM documents; "
            "SELECT count(*) FROM conversations; SELECT count(*) FROM messages;"
        )
        result = command([docker, "exec", name, "psql", "-U", "postgres", "-d",
                          "verification", "-At", "-c", sql], text=True)
        lines = result.stdout.strip().splitlines()
        assert len(lines) == 5 and all(value.isdigit() for value in lines[1:])
        proof = {
            "result": "encrypted snapshot restored successfully",
            "source": "live Neon managed PostgreSQL", "restore": "local PostgreSQL 18 container",
            "network": "none", "published_ports": [], "schema_revision": lines[0],
            "row_counts": dict(zip(["users", "documents", "conversations", "messages"],
                                   map(int, lines[1:]), strict=True)),
            "encrypted_bytes": archive.stat().st_size,
            "encrypted_sha256": hashlib.sha256(archive.read_bytes()).hexdigest(),
            "image": args.image,
        }
        (output / "verification.json").write_text(json.dumps(proof, indent=2) + "\n")
        (output / "verification.json").chmod(0o600)
        print("PASS isolated restore and schema/data readback; production database unchanged.", flush=True)
except Exception as exc:
    print("FAIL managed backup/restore:", type(exc).__name__, "details and credentials withheld.")
    raise SystemExit(1) from None
finally:
    for child in children:
        if child.poll() is None:
            child.terminate()
            try:
                child.wait(timeout=3)
            except subprocess.TimeoutExpired:
                child.kill()
                child.wait(timeout=3)
    if created:
        subprocess.run([docker, "rm", "-f", name], capture_output=True, timeout=30, check=False)
