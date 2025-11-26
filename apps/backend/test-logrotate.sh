#!/bin/bash

# Test script to verify logrotate is working correctly

echo "=== Testing Logrotate Setup ==="
echo ""

# Check if logrotate is installed
echo "1. Checking if logrotate is installed..."
docker exec store-hackathon-backend which logrotate
if [ $? -eq 0 ]; then
    echo "✓ logrotate is installed"
else
    echo "✗ logrotate is not installed"
    exit 1
fi
echo ""

# Check if logrotate config exists
echo "2. Checking if logrotate config exists..."
docker exec store-hackathon-backend cat /etc/logrotate.d/backend-logs
if [ $? -eq 0 ]; then
    echo "✓ Logrotate config found"
else
    echo "✗ Logrotate config not found"
    exit 1
fi
echo ""

# Check if logs directory exists
echo "3. Checking if logs directory exists..."
docker exec store-hackathon-backend ls -ld /app/logs
if [ $? -eq 0 ]; then
    echo "✓ Logs directory exists"
else
    echo "✗ Logs directory not found"
    exit 1
fi
echo ""

# Check if access.log exists
echo "4. Checking if access.log exists..."
docker exec store-hackathon-backend ls -lh /app/logs/access.log
if [ $? -eq 0 ]; then
    echo "✓ Access log file found"
else
    echo "✗ Access log file not found (this is OK if the app just started)"
fi
echo ""

# Test logrotate manually
echo "5. Testing manual logrotate execution..."
docker exec store-hackathon-backend logrotate -d /etc/logrotate.d/backend-logs
if [ $? -eq 0 ]; then
    echo "✓ Logrotate dry-run successful"
else
    echo "✗ Logrotate dry-run failed"
    exit 1
fi
echo ""

# Check current log files
echo "6. Current log files in /app/logs/:"
docker exec store-hackathon-backend ls -lh /app/logs/
echo ""

echo "=== All tests completed successfully! ==="
echo ""
echo "To manually rotate logs, run:"
echo "  docker exec store-hackathon-backend logrotate -f /etc/logrotate.d/backend-logs"
echo ""
echo "To view current logs, run:"
echo "  docker exec store-hackathon-backend tail -f /app/logs/access.log"
