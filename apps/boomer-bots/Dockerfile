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

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev

# Copy application files
COPY . .

# Run the boomer bot with PM2 in no-daemon mode to keep container running
CMD ["node_modules/.bin/pm2-runtime", "start", "ecosystem.config.json"]
