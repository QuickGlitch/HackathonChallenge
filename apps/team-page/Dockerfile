FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

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
