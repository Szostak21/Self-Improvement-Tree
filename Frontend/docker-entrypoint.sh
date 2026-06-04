#!/bin/sh
set -e

HOST="${HOSTNAME:-localhost}"

export REACT_NATIVE_PACKAGER_HOSTNAME="$HOST"
export EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0
export EXPO_PUBLIC_API_BASE="${EXPO_PUBLIC_API_BASE:-http://${HOST}:8080}"
export CI=1

echo ""
echo "=============================================="
echo "  Expo Go — wpisz ręcznie (ta sama sieć Wi‑Fi):"
echo "    exp://${HOST}:8081"
echo ""
echo "  Backend API:"
echo "    ${EXPO_PUBLIC_API_BASE}"
echo "=============================================="
echo ""

if [ "${EXPO_START_WEB:-0}" = "1" ]; then
  exec npx expo start --host lan --port 8081 --web
fi

exec npx expo start --host lan --port 8081
