#!/bin/bash

# Load environment variables from .env file if it exists
if [ -f "../.env" ]; then
    export $(grep -v '^#' ../.env | xargs)
fi

# Export Expo public environment variables
export EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY="${EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY}"

cd "$(dirname "$0")/Frontend"

npx expo start --lan