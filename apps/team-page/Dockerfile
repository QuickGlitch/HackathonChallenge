FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Accept build arguments for environment variables
ARG VITE_API_BASE_URL
ARG VITE_FRONTEND_URL
ARG VITE_SCOREBOARD_URL

# Set them as environment variables for the build
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_FRONTEND_URL=$VITE_FRONTEND_URL
ENV VITE_SCOREBOARD_URL=$VITE_SCOREBOARD_URL

# Build the application
RUN npm run build

####################
# Production stage #
####################
FROM node:22-alpine

WORKDIR /app

# Install serve globally
RUN npm install -g serve

# Copy built files
COPY --from=builder /app/dist ./dist

# Create serve.json for proper SPA routing
RUN echo '{"rewrites": [{"source": "**", "destination": "/index.html"}]}' > serve.json

# Expose port
EXPOSE 5175

# Start serve with config
CMD ["serve", "dist", "-l", "5175", "-c", "/app/serve.json"]
