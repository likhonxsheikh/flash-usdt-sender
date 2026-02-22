#!/bin/bash
# Enterprise Readiness Check for Flash USDT Sender

echo "🚀 Starting Enterprise Readiness Validation..."

# 1. Environment Check
if [ ! -f .env ]; then
    echo "⚠️  WARNING: .env file missing. Using .env.example values."
    cp .env.example .env
fi

# 2. Python Validation
echo "🐍 Validating Python Desktop Source..."
pip install pyflakes --quiet
python -m pyflakes flash-usdt-sender/src/
if [ $? -eq 0 ]; then
    echo "✅ Python Source: OK"
else
    echo "❌ Python Source: Issues detected."
fi

# 3. Node.js Validation
echo "🟢 Validating Node.js CLI Source..."
if [ -f "package.json" ]; then
    npm install --quiet
    npm run lint
    if [ $? -eq 0 ]; then
        echo "✅ Node.js Source: OK"
    else
        echo "❌ Node.js Source: Lint errors detected."
    fi
fi

# 4. Docker Validation
echo "🐳 Checking Docker Configurations..."
if [ -f "Dockerfile" ] && [ -f "Dockerfile.cli" ]; then
    echo "✅ Dockerfiles: Found"
else
    echo "❌ Dockerfiles: Missing"
fi

echo "🏁 Validation Complete!"
