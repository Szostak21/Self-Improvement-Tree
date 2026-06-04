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

// Expo/Metro: hostname advertised to clients (Expo Go manual URL: exp://HOSTNAME:8081)
if (process.env.HOSTNAME && !process.env.REACT_NATIVE_PACKAGER_HOSTNAME) {
  process.env.REACT_NATIVE_PACKAGER_HOSTNAME = process.env.HOSTNAME;
}

if (process.env.HOSTNAME && !process.env.EXPO_PUBLIC_API_BASE) {
  process.env.EXPO_PUBLIC_API_BASE = `http://${process.env.HOSTNAME}:8080`;
}

module.exports = require('./app.json');
