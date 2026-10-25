#!/usr/bin/env python3
"""Bundle the installed OMM viewer and .omm data into one offline HTML file."""

from __future__ import annotations

import hashlib
import json
import re
import subprocess
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "docs" / "FareeqAI-Architecture.html"
FIELDS = ("description", "diagram", "constraint", "concern", "context", "todo", "note")
LIBRARY_HASHES = {
    "https://cdn.jsdelivr.net/npm/dagre@0.8.5/dist/dagre.min.js":
        "62eb9787ccfdbdf4148d4d99d31dbf9ee4770eafee81e637d759b52aac22cd51",
    "https://cdn.jsdelivr.net/npm/marked/marked.min.js":
        "b82b9334406d8bdd16b6236c08de1cb65b2a859873ca9503d9cc0b292ca3c12a",
}


def download(url: str) -> str:
    with urllib.request.urlopen(url, timeout=30) as response:
        return response.read().decode("utf-8")


def script_text(text: str) -> str:
    return re.sub(r"</script", r"<\\/script", text, flags=re.IGNORECASE)


def element(directory: Path, name: str) -> dict:
    data: dict = {"name": name}
    for field in FIELDS:
        path = directory / ("diagram.mmd" if field == "diagram" else f"{field}.md")
        if path.exists():
            data[field] = path.read_text()
    meta = directory / "meta.yaml"
    if meta.exists():
        # Only scalar display metadata is needed; never execute YAML constructors.
        values = dict(re.findall(r"^(created|updated|update_count|git_commit|git_branch): (.+)$",
                                 meta.read_text(), re.MULTILINE))
        if "update_count" in values:
            values["update_count"] = int(values["update_count"])
        data["meta"] = values
    data["children"] = sorted(p.name for p in directory.iterdir() if p.is_dir())
    return data


def main() -> None:
    npm_root = Path(subprocess.check_output(["npm", "root", "-g"], text=True).strip())
    package = npm_root / "oh-my-mermaid"
    version = json.loads((package / "package.json").read_text())["version"]
    if version != "0.2.0":
        raise SystemExit(f"Exporter targets oh-my-mermaid 0.2.0, found {version}; review template first.")
    html = (package / "dist" / "viewer.html").read_text()
    perspectives = sorted(p.name for p in (ROOT / ".omm").iterdir() if p.is_dir())
    responses: dict = {"/api/classes": perspectives}
    for perspective in perspectives:
        directory = ROOT / ".omm" / perspective
        responses[f"/api/class/{perspective}"] = element(directory, perspective)
        responses[f"/api/class/{perspective}/refs"] = {"incoming": [], "outgoing": []}
        responses[f"/api/class/{perspective}/nodes"] = {
            "perspective": perspective, "children": responses[f"/api/class/{perspective}"]["children"]
        }
        for child in sorted(directory.rglob("description.md")):
            if child.parent == directory:
                continue
            node_path = child.parent.relative_to(directory).as_posix()
            responses[f"/api/class/{perspective}/node/{node_path}"] = element(child.parent, node_path)

    # This map uses filesystem nesting, not cross-perspective @references.
    for diagram in (ROOT / ".omm").rglob("diagram.mmd"):
        if re.search(r"@[\w-]+", diagram.read_text()):
            raise SystemExit("Cross-perspective references need export support before bundling.")

    assets = {
        "https://cdn.jsdelivr.net/npm/dagre@0.8.5/dist/dagre.min.js": download(
            "https://cdn.jsdelivr.net/npm/dagre@0.8.5/dist/dagre.min.js"),
        "https://cdn.jsdelivr.net/npm/marked/marked.min.js": download(
            "https://cdn.jsdelivr.net/npm/marked@18.1.1/lib/marked.umd.js"),
    }
    for url, javascript in assets.items():
        if hashlib.sha256(javascript.encode()).hexdigest() != LIBRARY_HASHES[url]:
            raise SystemExit(f"Unexpected library hash: {url}")
        tag = f'<script src="{url}"></script>'
        if html.count(tag) != 1:
            raise SystemExit(f"Unexpected viewer dependency template: {url}")
        html = html.replace(tag, "<script>\n" + script_text(javascript) + "\n</script>")
    html = re.sub(r'<link href="https://fonts.googleapis.com/[^>]+>', "", html)
    encoded = json.dumps(responses, ensure_ascii=True).replace("<", "\\u003c")
    injection = "<script>window.__projectName='FareeqAI';window.__ommSnapshot=" + encoded + ";</script>"
    html = html.replace("</head>", injection + "\n</head>", 1)
    api_line = "const api = p => fetch(p).then(r=>r.json()).catch(()=>({}));"
    if html.count(api_line) != 1:
        raise SystemExit("Unexpected API adapter template")
    html = html.replace(api_line, "const api = async p => window.__ommSnapshot[p] ?? {};")
    html, changes = re.subn(r"function setupLiveReload\(\) \{.*?\nsetupLiveReload\(\);",
                            "// Offline snapshot: no server or live-reload connection.", html, flags=re.DOTALL)
    if changes != 1:
        raise SystemExit("Unexpected live reload template")
    html = html.replace("<title>oh-my-mermaid</title>", "<title>FareeqAI — Interactive Architecture</title>")
    # Classic inline scripts also work for local file URLs with strict module policies.
    html = html.replace('<script type="module">', '<script>')
    licenses = [
        "oh-my-mermaid 0.2.0\n" + (package / "LICENSE").read_text(),
        "dagre 0.8.5\n" + download("https://cdn.jsdelivr.net/npm/dagre@0.8.5/LICENSE"),
        "marked 18.1.1\n" + download("https://cdn.jsdelivr.net/npm/marked@18.1.1/LICENSE"),
    ]
    notices = "\n\n".join(licenses).replace("--", "- -")
    html = html.replace("</body>", "<!-- Bundled open-source license notices\n" + notices + "\n-->\n</body>")
    assert not re.search(r'<script[^>]+src=|<link[^>]+href=', html)
    OUTPUT.write_text(html)
    print(f"Saved {OUTPUT} ({OUTPUT.stat().st_size:,} bytes)")
    print(f"Embedded {len(perspectives)} perspectives and {len(responses)} API responses; no server required.")
    print("SHA-256:", hashlib.sha256(OUTPUT.read_bytes()).hexdigest())


if __name__ == "__main__":
    main()
