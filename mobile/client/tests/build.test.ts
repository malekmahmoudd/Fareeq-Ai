import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const { validateBuild } = createRequire(import.meta.url)('../tools/check-build.cjs');
test('design builds use fixtures and connected builds require an explicit backend', () => {
  assert.doesNotThrow(() => validateBuild('design-preview', { EXPO_PUBLIC_SAMPLE_MODE: 'true' }));
  assert.throws(() => validateBuild('design-preview', {}));
  assert.throws(() => validateBuild('production', { EXPO_PUBLIC_SAMPLE_MODE: 'true', EXPO_PUBLIC_API_URL: 'https://api.example.com' }));
  assert.throws(() => validateBuild('design-preview', { EXPO_PUBLIC_API_URL: 'https://api.example.com' }));
  assert.throws(() => validateBuild('production', {}));
  assert.doesNotThrow(() => validateBuild('preview', { EXPO_PUBLIC_API_URL: 'https://api.example.com' }));
});
test('release builds reject development origins and credential-bearing URLs', () => {
  for (const address of ['http://192.168.1.1:8083', 'https://localhost', 'https://127.0.0.1', 'https://device.local', 'https://user:password@api.example.com', 'https://api.example.com/api', 'https://api.example.com?token=secret']) {
    assert.throws(() => validateBuild('production', { EXPO_PUBLIC_API_URL: address }));
  }
});
test('provider credentials cannot be embedded as public build variables', () => {
  assert.throws(() => validateBuild('design-preview', { EXPO_PUBLIC_LLM_API_KEY: 'fake-test-key' }));
});
