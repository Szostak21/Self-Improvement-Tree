const fs = require('fs');
const path = require('path');

const rootEnvPath = path.resolve(__dirname, '..', '.env');
const appJson = require('./app.json');

function loadRootEnv() {
  if (!fs.existsSync(rootEnvPath)) return;

  for (const line of fs.readFileSync(rootEnvPath, 'utf8').split(/\r?\n/')) {
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

if (process.env.HOSTNAME && !process.env.REACT_NATIVE_PACKAGER_HOSTNAME) {
  process.env.REACT_NATIVE_PACKAGER_HOSTNAME = process.env.HOSTNAME;
}

if (process.env.HOSTNAME && !process.env.EXPO_PUBLIC_API_BASE) {
  process.env.EXPO_PUBLIC_API_BASE = `http://${process.env.HOSTNAME}:8080`;
}

const buildProfile = process.env.EAS_BUILD_PROFILE;

module.exports = {
  ...appJson,
  expo: {
    ...appJson.expo,
    android: {
      ...appJson.expo.android,
      // Preview APK przed AWS: pozwala na http://IP-LAN:8080. Production = tylko HTTPS.
      ...(buildProfile === 'preview' && { usesCleartextTraffic: true }),
    },
  },
};
