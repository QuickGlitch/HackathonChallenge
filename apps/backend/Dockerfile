FROM node:22-alpine

# Install OpenSSL for Prisma, curl for healthcheck, and logrotate for log management
RUN apk add --no-cache openssl curl logrotate

WORKDIR /app

# Copy package files
COPY package*.json ./

COPY prisma ./prisma/

RUN npm install --omit=dev

# Copy rest of source code
COPY . .

# Copy logrotate configuration
COPY logrotate.conf /etc/logrotate.d/backend-logs

# Create logs directory with proper permissions
RUN mkdir -p /app/logs && chmod 755 /app/logs

# Expose port
EXPOSE 3001
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=60s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3001/api/health || exit 1

# Copy and set entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Start the application with migrations, seeding, and logrotate
ENTRYPOINT ["/entrypoint.sh"]