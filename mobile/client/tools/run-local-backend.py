"""Isolated mobile development backend; never touches production data/config."""
import argparse
import os
from pathlib import Path
import secrets
import sys

repo = Path(__file__).resolve().parents[3]
backend = repo / 'backend'
sys.path.insert(0, str(backend))
from dotenv import dotenv_values

parser = argparse.ArgumentParser()
parser.add_argument('--host', choices=['127.0.0.1', '0.0.0.0'], default='127.0.0.1')
parser.add_argument('--live-ai', action='store_true')
args = parser.parse_args()
config = backend / '.env.mobile'
if not config.exists():
    fd = os.open(config, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
    with os.fdopen(fd, 'w') as target:
        target.write('AUTH_SECRET=' + secrets.token_hex(32) + '\n')
secret = dotenv_values(config)['AUTH_SECRET']
os.environ.update({
    'ENVIRONMENT': 'development', 'DEBUG': 'false',
    'DATABASE_URL': 'sqlite+pysqlite:///' + str(backend / 'mobile-dev.db'),
    'AUTH_ACCESS_KEYS': '{}', 'AUTH_REQUIRED': 'true', 'AUTH_SECRET': secret,
    'GUEST_ENABLED': 'true', 'SIGNUP_ENABLED': 'true', 'MOBILE_ENABLED': 'true',
    'FRONTEND_URL': 'http://localhost:8082', 'LLM_PROVIDER': 'mock',
    'LLM_API_KEY': '', 'MEMORY_EXTRACTION': 'rules',
    'DOCUMENT_SEMANTIC_SEARCH': 'false', 'PUSH_ENABLED': 'false', 'TEAM_ENABLED': 'false',
})
if args.live_ai:
    production = dotenv_values(repo / 'deploy/.env')
    key = production.get('LLM_API_KEY')
    if not key:
        raise SystemExit('No provider key available. Use the default mock mode.')
    os.environ.update({'LLM_PROVIDER': 'groq', 'LLM_API_KEY': key, 'LLM_MODEL': 'openai/gpt-oss-120b'})
os.chdir(backend)
# The agents' model overrides are normally configured for Anthropic. Use the same
# Groq model for this isolated development process without editing their configs.
if args.live_ai:
    from app.agents.registry import all_agents
    for agent in all_agents():
        agent.model.model = 'openai/gpt-oss-120b'
import uvicorn
uvicorn.run('app.main:app', host=args.host, port=8083, log_level='warning')
