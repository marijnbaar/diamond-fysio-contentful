#!/bin/bash

# Test script voor webhook endpoint
# Gebruik: ./test-webhook.sh

WEBHOOK_URL="${1:-https://www.fysiodiamondfactory.nl/api/webhooks/team-member}"
SECRET="${WEBHOOK_SECRET:-test-secret}"

echo "🧪 Testing webhook endpoint: $WEBHOOK_URL"
echo ""

# Test 1: GET request (should return 405)
echo "Test 1: GET request (should return 405)"
curl -X GET "$WEBHOOK_URL" -v 2>&1 | grep -E "(HTTP|Method|405)"
echo ""
echo ""

# Test 2: POST without auth (should return 401 if secret is set)
echo "Test 2: POST without auth"
curl -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{"test":"data"}' \
  -v 2>&1 | grep -E "(HTTP|401|Unauthorized)"
echo ""
echo ""

# Test 3: POST with auth but invalid data
echo "Test 3: POST with auth but invalid data"
curl -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SECRET" \
  -d '{"test":"data"}' \
  -v 2>&1 | head -30
echo ""

