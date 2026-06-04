const fs = require('fs');
const path = require('path');

const rootEnvPath = path.resolve(__dirname, '..', '.env');

function loadRootEnv() {
  if (!fs.existsSync(rootEnvPath)) return;

  for (const line of fs.readFileSync(rootEnvPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const eq = trimmed.indexOf('=');
    if (eq < 1) continue;

    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (process.env[key] == null) {
      process.env[key] = value;
    }
  }
}

loadRootEnv();

module.exports = require('./app.json');
