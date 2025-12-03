FROM node:22-alpine

# Install Chromium for Puppeteer
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Tell Puppeteer to skip installing Chrome instead using installed package.
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

ENV DEV_MODE=false

WORKDIR /app

# Copy workspace root package.json
COPY package*.json ./

# Copy workspace packages for local dependencies
COPY packages ./packages

# Copy boomer-bots app files
COPY apps/boomer-bots/package*.json ./apps/boomer-bots/

# Install dependencies from boomer-bots directory
WORKDIR /app/apps/boomer-bots
RUN npm install --omit=dev

# Copy application files
COPY apps/boomer-bots ./

# Run the boomer bot directly with Node.js
CMD ["node", "boomer-bot.js"]
