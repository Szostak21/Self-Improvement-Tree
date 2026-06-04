const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Required in Docker: Metro must listen on all interfaces (port is published to the host).
config.server = {
  ...config.server,
  host: '0.0.0.0',
};

module.exports = config;
