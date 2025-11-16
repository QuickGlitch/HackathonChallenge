#!/bin/bash

# Honeypot Activity Monitor
# This script monitors for honeypot access attempts in the logs

LOGFILE="/home/anton/projects/store-hackathon/apps/backend/logs/access.log"
HONEYPOT_LOG="/home/anton/projects/store-hackathon/honeypot-activity.log"

echo "🍯 Honeypot Monitor Started - $(date)" >> "$HONEYPOT_LOG"

# Monitor for honeypot endpoints being accessed
tail -f "$LOGFILE" 2>/dev/null | grep -E "(admin|debug|backup|legacy)" --line-buffered | while read line; do
    echo "[$(date)] HONEYPOT ACCESS: $line" >> "$HONEYPOT_LOG"
    echo "🚨 Potential security scanner detected: $line"
done &

# Monitor application logs for honeypot hits
tail -f /dev/null 2>/dev/null | while read line; do
    if [[ "$line" == *"[HONEYPOT]"* ]]; then
        echo "[$(date)] $line" >> "$HONEYPOT_LOG"
        echo "🍯 Honeypot triggered: $line"
    fi
done &

echo "Honeypot monitoring active. Check $HONEYPOT_LOG for activity."
echo "Press Ctrl+C to stop monitoring."

# Keep script running
wait