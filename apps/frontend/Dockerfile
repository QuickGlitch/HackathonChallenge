FROM node:22-alpine AS builder

WORKDIR /app

# Copy workspace root package.json
COPY package*.json ./

# Copy workspace packages for local dependencies
COPY packages ./packages

# Copy frontend app files
COPY apps/frontend/package*.json ./apps/frontend/

# Install dependencies from frontend directory
WORKDIR /app/apps/frontend
RUN npm install

# Copy rest of frontend source code and build
COPY apps/frontend ./
RUN npm run build

####################
# Production stage #
####################
FROM node:22-alpine

WORKDIR /app

# Install curl for healthcheck and serve for static files
RUN apk add --no-cache curl && npm install -g serve

# Copy built files from builder
COPY --from=builder /app/apps/frontend/dist ./dist

# Create serve.json for proper SPA routing
RUN echo '{"rewrites": [{"source": "**", "destination": "/index.html"}]}' > serve.json

# Expose port
EXPOSE 3000

# Start serve with config
CMD ["serve", "dist", "-l", "3000", "-c", "/app/serve.json"]