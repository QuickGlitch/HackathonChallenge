FROM node:22-alpine

# Install OpenSSL for Prisma and curl for healthcheck
RUN apk add --no-cache openssl curl

WORKDIR /app

# Copy package files
COPY package*.json ./

COPY prisma ./prisma/

RUN npm install --omit=dev

# Copy rest of source code
COPY . .

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3001/api/health || exit 1

# Start the application with migrations and seeding
CMD sh -c "npx prisma migrate deploy && npm run db:seed && npm start"