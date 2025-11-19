#!/bin/bash

# Test script for controlled SQL injection vulnerability
# This script demonstrates what works and what is blocked

echo "=== Testing Controlled SQL Injection in Products Search ==="
echo ""

BASE_URL="http://localhost:3001"

# Function to test a query
test_query() {
    local description="$1"
    local query="$2"
    
    echo "Testing: $description"
    echo "Query: $query"
    
    # Use curl with proper URL encoding
    response=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/products/search" -G --data-urlencode "q=$query")
    status_code=$(echo "$response" | tail -n 1)
    body=$(echo "$response" | sed '$d')  # Remove last line (status code)
    
    if [[ "$status_code" == "200" ]]; then
        echo "✅ Status: $status_code (Allowed)"
        # Count products in response
        if command -v jq &> /dev/null; then
            product_count=$(echo "$body" | jq '. | length' 2>/dev/null || echo "0")
            echo "Products returned: $product_count"
        else
            echo "Response received (jq not available for counting)"
        fi
    elif [[ "$status_code" == "400" ]]; then
        echo "❌ Status: $status_code (Blocked)"
        if command -v jq &> /dev/null; then
            error_msg=$(echo "$body" | jq -r '.error' 2>/dev/null || echo "$body")
        else
            error_msg="$body"
        fi
        echo "Error: $error_msg"
    else
        echo "⚠️  Status: $status_code (Unexpected)"
        echo "Body: $body"
    fi
    echo "---"
    sleep 0.2  # Small delay between requests
}

# Test server availability
echo "🔍 Testing server availability..."
health_check=$(curl -s -w "%{http_code}" "$BASE_URL/api/products" -o /dev/null)
if [[ "$health_check" != "200" ]]; then
    echo "❌ Server not responding at $BASE_URL"
    echo "Please make sure the backend server is running."
    exit 1
fi
echo "✅ Server is responding"
echo ""

echo "🟢 ALLOWED ATTACKS (Should work):"
echo ""

# Basic injection
test_query "Basic SQL injection" "' OR '1'='1' --"

# Find expensive products
test_query "Price-based filtering" "' OR price > 100 --"

# Category search  
test_query "Category search injection" "' OR category='Electronics' --"

echo ""
echo "🔴 BLOCKED ATTACKS (Should be prevented):"
echo ""

# Try to access users table
test_query "Access users table" "' UNION SELECT * FROM users --"

# Try DELETE operation
test_query "DELETE operation" "'; DELETE FROM products; --"

# Try UPDATE operation  
test_query "UPDATE operation" "'; UPDATE products SET price=0; --"

# Try information_schema
test_query "Schema information" "' UNION SELECT table_name FROM information_schema.tables --"

# Try to access orders table
test_query "Access orders table" "' UNION SELECT * FROM orders --"

echo ""
echo "=== Test completed ==="
echo "Note: Backend server should be running on $BASE_URL"