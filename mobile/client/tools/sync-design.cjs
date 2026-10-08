// Keep the independently installable client aligned with the approved design.
const fs = require('node:fs');
const path = require('node:path');
const source = path.resolve(__dirname, '../../design/tokens.json');
const target = path.resolve(__dirname, '../src/tokens.json');
JSON.parse(fs.readFileSync(source, 'utf8'));
fs.copyFileSync(source, target);
