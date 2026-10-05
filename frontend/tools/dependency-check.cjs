/* Release gate: no runtime advisories; the one unpatched build advisory is
   narrowly recorded, never silently removed from npm's output. Run after build. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
function audit(args) {
  const result = spawnSync('npm', ['audit', '--json', ...args], {
    encoding: 'utf8', cwd: path.resolve(__dirname, '..'), timeout: 60000,
  });
  assert.ok(result.status === 0 || result.status === 1, result.stderr);
  const data = JSON.parse(result.stdout);
  assert.ok(!data.error && data.metadata, 'audit service must return a valid report');
  return data;
}
const runtime = audit(['--omit=dev']);
assert.equal(runtime.metadata.vulnerabilities.total, 0, 'runtime dependencies must have zero advisories');
const full = audit([]);
for (const finding of Object.values(full.vulnerabilities)) {
  assert.equal(finding.isDirect && !finding.via.every(v => typeof v === 'string'), false,
    'a new direct package advisory needs review');
  for (const advisory of finding.via.filter(v => typeof v !== 'string')) {
    assert.equal(advisory.url, 'https://github.com/advisories/GHSA-vfj7-8cjw-p6xm',
      'new build advisory: do not widen the exception automatically');
    assert.equal(advisory.name, 'braces');
  }
}
const root = path.resolve(__dirname, '../.next/standalone');
assert.ok(fs.existsSync(path.join(root, 'server.js')), 'production standalone build required');
const buildOnly = new Set(['braces', 'micromatch', 'fast-glob', 'tailwindcss', 'eslint',
                          'eslint-config-next', '@next/eslint-plugin-next', 'chokidar']);
function inspect(directory) {
  for (const entry of fs.readdirSync(directory, {withFileTypes: true})) {
    if (!entry.isDirectory()) continue;
    const child = path.join(directory, entry.name);
    const manifest = path.join(child, 'package.json');
    if (fs.existsSync(manifest)) {
      const pkg = JSON.parse(fs.readFileSync(manifest));
      assert.ok(!buildOnly.has(pkg.name), `${pkg.name} must not ship in the runtime image`);
    }
    inspect(child);
  }
}
inspect(path.join(root, 'node_modules'));
console.log(`PASS: runtime audit clear; ${full.metadata.vulnerabilities.total} build-chain findings confined to the recorded braces advisory; standalone excludes affected build tools.`);
