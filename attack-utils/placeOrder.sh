#!/bin/bash

# Usage: ./placeOrder.sh [spoofed_ip]
# Example: ./placeOrder.sh 192.168.1.100

SPOOFED_IP=$1

# Build curl command with proper arrays
CURL_ARGS=(
  "http://localhost:3000/api/orders"
  "-H" "Accept: application/json, text/plain, */*"
  "-H" "Accept-Language: en-US,en;q=0.9,ru;q=0.8"
  "-H" "Connection: keep-alive"
  "-H" "Content-Type: application/json"
  "-b" "adminer_key=932442d9d9ca0b411613ada8e36dd6b0; adminer_sid=74d60747a63cfc128c0bdeff9e13f1cd; OptanonConsent=%7B%7D"
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
curl "${CURL_ARGS[@]}" --data-raw '{
  "items": [
    {
      "id": 8,
      "name": "Desk Lamp",
      "price": 39.99,
      "image": "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=300&h=200&fit=crop",
      "quantity": 7
    }
  ],
  "total": 276786786789.93,
  "customer": {
    "name": "asd",
    "email": "",
    "address": "",
    "city": "",
    "zipCode": ""
  },
  "payment": {
    "cardNumber": "",
    "expiryDate": "",
    "cvv": ""
  }
}'