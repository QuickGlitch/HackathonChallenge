FROM node:22-alpine AS builder

WORKDIR /app

# Copy workspace root package.json
COPY package*.json ./

# Copy workspace packages for local dependencies
COPY packages ./packages

# Copy scoreboard app files
COPY apps/scoreboard/package*.json ./apps/scoreboard/

# Accept build arguments for environment variables
ARG VITE_API_BASE_URL
ARG VITE_FRONTEND_URL
ARG VITE_SCOREBOARD_URL

# Set them as environment variables for the build
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_FRONTEND_URL=$VITE_FRONTEND_URL
ENV VITE_SCOREBOARD_URL=$VITE_SCOREBOARD_URL

# Install dependencies from scoreboard directory
WORKDIR /app/apps/scoreboard
RUN npm install

# Copy rest of scoreboard source code and build
COPY apps/scoreboard ./
RUN npm run build

####################
# Production stage #
####################
FROM node:22-alpine

WORKDIR /app

# Install serve globally
RUN npm install -g serve

# Copy built files from builder
COPY --from=builder /app/apps/scoreboard/dist ./dist

# Create serve.json for proper SPA routing
RUN echo '{"rewrites": [{"source": "**", "destination": "/index.html"}]}' > serve.json

# Expose port
EXPOSE 5174

# Start serve with config
CMD ["serve", "dist", "-l", "5174", "-c", "/app/serve.json"]