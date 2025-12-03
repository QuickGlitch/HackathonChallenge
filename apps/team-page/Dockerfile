FROM node:22-alpine AS builder

WORKDIR /app

# Copy workspace root package.json
COPY package*.json ./

# Copy workspace packages for local dependencies
COPY packages ./packages

# Copy team-page app files
COPY apps/team-page/package*.json ./apps/team-page/

# Accept build arguments for environment variables
ARG VITE_API_BASE_URL
ARG VITE_FRONTEND_URL
ARG VITE_SCOREBOARD_URL

# Set them as environment variables for the build
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_FRONTEND_URL=$VITE_FRONTEND_URL
ENV VITE_SCOREBOARD_URL=$VITE_SCOREBOARD_URL

# Install dependencies from team-page directory
WORKDIR /app/apps/team-page
RUN npm install

# Copy rest of team-page source code and build
COPY apps/team-page ./
RUN npm run build

####################
# Production stage #
####################
FROM node:22-alpine

WORKDIR /app

# Install serve globally
RUN npm install -g serve

# Copy built files from builder
COPY --from=builder /app/apps/team-page/dist ./dist

# Create serve.json for proper SPA routing
RUN echo '{"rewrites": [{"source": "**", "destination": "/index.html"}]}' > serve.json

# Expose port
EXPOSE 5175

# Start serve with config
CMD ["serve", "dist", "-l", "5175", "-c", "/app/serve.json"]
