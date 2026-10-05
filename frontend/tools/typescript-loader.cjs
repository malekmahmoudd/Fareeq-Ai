// Test-only loader for actual source modules, aliases and translations.
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
for (const extension of ['.ts', '.tsx']) {
  require.extensions[extension] = (module, filename) => module._compile(
    ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020,
        jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
    }).outputText, filename);
}
const resolve = Module._resolveFilename;
Module._resolveFilename = function(name, ...args) {
  if (name.startsWith('@/')) name = path.join(__dirname, '../src', name.slice(2));
  return resolve.call(this, name, ...args);
};
// Load context definitions with real React before a hook harness substitutes
// controlled hook state. Translation/draft behavior remains the actual code.
require('../src/lib/i18n');
require('../src/lib/offline');
