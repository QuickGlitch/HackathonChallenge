FROM node:22-alpine

WORKDIR /app

# Copy workspace root package.json
COPY package*.json ./

# Copy workspace packages for local dependencies
COPY packages ./packages

# Copy csrf-app app files
COPY apps/csrf-app/package*.json ./apps/csrf-app/

# Install dependencies from csrf-app directory
WORKDIR /app/apps/csrf-app
RUN npm install

# Copy application files
COPY apps/csrf-app ./

# Expose port
EXPOSE 8081

# Start the CSRF server
CMD ["npm", "start"]
