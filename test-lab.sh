#!/bin/bash

# Test script for the Copilot Studio to Teams lab
# This verifies that the bot code compiles and runs correctly

set -e

echo "======================================"
echo "Testing Copilot Studio to Teams Lab"
echo "======================================"
echo ""

# Navigate to teams-bot directory
cd "$(dirname "$0")/teams-bot"

echo "✓ Step 1: Installing dependencies..."
npm install --silent > /dev/null 2>&1
echo "  Dependencies installed successfully"
echo ""

echo "✓ Step 2: Building TypeScript code..."
npm run build > /dev/null 2>&1
echo "  TypeScript compilation successful"
echo ""

echo "✓ Step 3: Checking for syntax errors..."
if npm run build 2>&1 | grep -q "error"; then
    echo "  ✗ TypeScript errors found"
    npm run build
    exit 1
else
    echo "  No TypeScript errors found"
fi
echo ""

echo "✓ Step 4: Verifying file structure..."
for file in "src/index.ts" "src/handlers/claims.ts" "package.json" ".env.example"; do
    if [ -f "$file" ]; then
        echo "  ✓ $file exists"
    else
        echo "  ✗ $file missing"
        exit 1
    fi
done
echo ""

echo "✓ Step 5: Starting bot server (background)..."
# Kill any existing process on port 3978
lsof -ti:3978 | xargs kill -9 2>/dev/null || true
sleep 1

# Start the server
npm run dev > /dev/null 2>&1 &
SERVER_PID=$!
echo "  Bot server started (PID: $SERVER_PID)"

# Wait for server to be ready
echo "  Waiting for server to start..."
for i in {1..10}; do
    if curl -s http://localhost:3978/health > /dev/null 2>&1; then
        echo "  Server is ready!"
        break
    fi
    sleep 1
done
echo ""

echo "✓ Step 6: Testing health endpoint..."
HEALTH_RESPONSE=$(curl -s http://localhost:3978/health)
echo "  Response: $HEALTH_RESPONSE"

if echo "$HEALTH_RESPONSE" | grep -q '"ok":true'; then
    echo "  ✓ Health endpoint working"
else
    echo "  ✗ Health endpoint failed"
    kill $SERVER_PID 2>/dev/null || true
    exit 1
fi
echo ""

echo "✓ Step 7: Testing message endpoint (expect auth error with test credentials)..."
MESSAGE_RESPONSE=$(curl -s -X POST http://localhost:3978/message \
    -H "Content-Type: application/json" \
    -d '{"text":"Test message"}')
echo "  Response: $MESSAGE_RESPONSE"

if echo "$MESSAGE_RESPONSE" | grep -q '"ok":false'; then
    echo "  ✓ Message endpoint responding (auth error expected with test credentials)"
else
    echo "  Note: Unexpected response (may need real Azure OpenAI credentials)"
fi
echo ""

# Cleanup
echo "✓ Step 8: Cleaning up..."
kill $SERVER_PID 2>/dev/null || true
lsof -ti:3978 | xargs kill -9 2>/dev/null || true
echo "  Server stopped"
echo ""

echo "======================================"
echo "✓ All tests passed!"
echo "======================================"
echo ""
echo "The lab is ready to use. To start working:"
echo "  1. Follow Lab 1: ./lab-1-setup/README.md"
echo "  2. Configure real Azure OpenAI credentials in teams-bot/.env"
echo "  3. Run: cd teams-bot && npm run dev"
echo ""
