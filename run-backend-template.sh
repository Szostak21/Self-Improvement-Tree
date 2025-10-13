#!/bin/bash

# Template for running the backend with environment variables
# Copy this to run-backend.sh and fill in your actual values
# Or create a .env file and source it

# Load environment variables from .env file if it exists
if [ -f ".env" ]; then
    export $(grep -v '^#' .env | xargs)
fi

# Email configuration
export GMAIL_USER="${GMAIL_USER:-your_gmail_address@gmail.com}"
export GMAIL_APP_PASSWORD="${GMAIL_APP_PASSWORD:-your_app_password_here}"

# Stripe configuration
export STRIPE_SECRET_KEY="${STRIPE_SECRET_KEY:-sk_test_YOUR_STRIPE_SECRET_KEY}"
export STRIPE_PUBLISHABLE_KEY="${STRIPE_PUBLISHABLE_KEY:-pk_test_YOUR_STRIPE_PUBLISHABLE_KEY}"

./auto-config-api.sh

# Change to the backend directory
cd "$(dirname "$0")/Backend"

# Run the Spring Boot application
./mvnw spring-boot:run