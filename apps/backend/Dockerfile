FROM node:22-alpine

# Install OpenSSL for Prisma, curl for healthcheck, and logrotate for log management
RUN apk add --no-cache openssl curl logrotate

WORKDIR /app

# Copy workspace root package.json
COPY package*.json ./

# Copy workspace packages for local dependencies
COPY packages ./packages

# Copy backend app files
COPY apps/backend/package*.json ./apps/backend/
COPY apps/backend/prisma ./apps/backend/prisma/

# Install dependencies from backend directory
WORKDIR /app/apps/backend
RUN npm install --omit=dev

# Copy rest of backend source code
COPY apps/backend ./

# Create logs directory with proper permissions
RUN mkdir -p ./logs && chmod 755 ./logs

# Expose port
EXPOSE 3001
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=60s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3001/api/health || exit 1

# Set entrypoint script executable
RUN chmod +x entrypoint.sh

# Start the application with migrations, seeding, and logrotate
ENTRYPOINT ["./entrypoint.sh"]