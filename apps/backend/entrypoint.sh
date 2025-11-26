#!/bin/sh

# Start logrotate in the background
# Run logrotate every hour
(
  while true; do
    logrotate -f /etc/logrotate.d/backend-logs
    sleep 3600
  done
) &

# Run database migrations and seeding
npx prisma migrate deploy
npm run db:seed

# Start the Node.js application
exec npm start
