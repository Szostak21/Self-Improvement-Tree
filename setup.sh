#!/bin/bash

# Quick Start Script for Self-Improvement Tree
# This script helps you set up the project from scratch

echo "🌱 Self-Improvement Tree - Quick Setup"
echo "======================================"
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from template..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "✅ .env file created!"
        echo "⚠️  Please edit .env and add your credentials:"
        echo "   - Gmail email and app password"
        echo "   - Stripe API keys (from dashboard.stripe.com)"
        echo ""
        echo "Press Enter when ready..."
        read
    else
        echo "❌ .env.example not found!"
        exit 1
    fi
else
    echo "✅ .env file already exists"
fi

# Check Java
echo ""
echo "🔍 Checking Java installation..."
if command -v java &> /dev/null; then
    JAVA_VERSION=$(java -version 2>&1 | awk -F '"' '/version/ {print $2}')
    echo "✅ Java found: $JAVA_VERSION"
else
    echo "❌ Java not found! Please install Java 17+"
    exit 1
fi

# Check Node
echo ""
echo "🔍 Checking Node.js installation..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo "✅ Node.js found: $NODE_VERSION"
else
    echo "❌ Node.js not found! Please install Node.js LTS"
    exit 1
fi

# Install frontend dependencies
echo ""
echo "📦 Installing frontend dependencies..."
cd Frontend
if [ ! -d "node_modules" ]; then
    npm install
    echo "✅ Frontend dependencies installed"
else
    echo "✅ Frontend dependencies already installed"
fi
cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "🚀 To start the app:"
echo ""
echo "Terminal 1 - Backend:"
echo "  ./run-backend.sh"
echo ""
echo "Terminal 2 - Frontend:"
echo "  ./run-frontend.sh"
echo ""
echo "Terminal 3 - Stripe Webhooks (optional for payments):"
echo "  cd Backend && stripe listen --forward-to http://localhost:8080/api/stripe/webhook"
echo ""
echo "📖 For more details, see SETUP.md"
echo ""
