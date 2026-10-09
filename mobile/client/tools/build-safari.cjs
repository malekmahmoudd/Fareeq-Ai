// Build a credential-free Pages package alongside the existing delivery proxy.
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const client = path.resolve(__dirname, '..');
const repo = path.resolve(client, '../..');
const output = path.join(repo, 'deploy/dist/safari-pages');
const result = spawnSync(process.execPath, [require.resolve('expo/bin/cli'), 'export', '--platform', 'web', '--output-dir', 'dist/safari'], {
  cwd: client, stdio: 'inherit', env: { ...process.env, FAREEQ_WEB_BASE_PATH: '/mobile', EXPO_PUBLIC_API_URL: 'https://fareeqai.pages.dev', EXPO_PUBLIC_SAMPLE_MODE: 'false' },
});
if (result.status !== 0) process.exit(result.status ?? 1);
fs.mkdirSync(output, { recursive: true });
fs.rmSync(path.join(output, 'mobile'), { recursive: true, force: true });
fs.cpSync(path.join(client, 'dist/safari'), path.join(output, 'mobile'), { recursive: true });
for (const file of ['_worker.js', 'index.html']) fs.copyFileSync(path.join(repo, 'deploy/cloudflare-pages', file), path.join(output, file));
console.log(`Pages upload package: ${output}`);
