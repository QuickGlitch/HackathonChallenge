# 🛒 Store Hackathon - Pentesting Web Shop

A full-stack web application built for educational pentesting purposes. This project features a Vue.js frontend and Express.js backend in a Turbo monorepo setup.

## 🏗️ Project Structure

```
store-hackathon/
├── apps/
│   ├── frontend/          # Vue.js application
│   └── backend/           # Express.js API server
├── .github/               # GitHub workflows and copilot instructions
├── docker-compose.yml     # Production Docker setup
├── docker-compose.dev.yml # Development Docker setup
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose
- Git

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd store-hackathon
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the database**
   ```bash
   npm run docker:up -- -f docker-compose.dev.yml
   ```

4. **Set up the backend**
   ```bash
   cd apps/backend
   cp .env.example .env
   
   # Run database migrations
   npm run db:migrate
   
   # Seed the database with sample data
   npm run db:seed
   ```

5. **Start the development servers**
   ```bash
   # From the root directory
   npm run dev
   ```

   This will start:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

## 🐋 Docker Deployment

### Development with Docker

```bash
# Start only the database
docker-compose -f docker-compose.dev.yml up -d

# Run migrations and seed data
cd apps/backend
npm run db:migrate
npm run db:seed
```

### Production Deployment

```bash
# Build and start all services
docker-compose up -d

# Run migrations in the backend container
docker-compose exec backend npm run db:migrate
docker-compose exec backend npm run db:seed
```

## 🛠️ Available Scripts

### Root Level

- `npm run dev` - Start all apps in development mode
- `npm run build` - Build all apps for production
- `npm run lint` - Lint all packages
- `npm run docker:up` - Start Docker services
- `npm run docker:down` - Stop Docker services

### Frontend (`apps/frontend`)

- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Backend (`apps/backend`)

- `npm run dev` - Start with nodemon (auto-reload)
- `npm run start` - Start production server
- `npm run db:migrate` - Run Prisma migrations
- `npm run db:reset` - Reset database
- `npm run db:seed` - Seed database with sample data

## 🎯 Features

### Frontend (Vue.js)
- Modern Vue 3 with Composition API
- Vue Router for navigation
- Pinia for state management
- Responsive design with CSS Grid/Flexbox
- Shopping cart functionality
- Product browsing and search
- Checkout process

### Backend (Express.js)
- RESTful API design
- Prisma ORM with PostgreSQL
- Rate limiting and security headers
- CORS enabled for cross-origin requests
- Comprehensive error handling
- Health check endpoint

### Database Schema
- **Products**: Store items with details and pricing
- **Orders**: Customer orders with items
- **OrderItems**: Junction table for order-product relationships

## 🔒 Security Features

This application includes several security vulnerabilities intentionally for educational purposes:

- Basic input validation (may have gaps)
- Simple authentication patterns
- Rate limiting (configurable)
- CORS configuration
- Security headers via Helmet.js

⚠️ **Warning**: This application is designed for educational pentesting purposes only. Do not use in production environments without proper security auditing.

## 📊 API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Orders
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get single order
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id/status` - Update order status

### Health
- `GET /api/health` - Server health check

## 🔧 Environment Variables

### Backend (`.env`)
```env
PORT=3001
NODE_ENV=development
DATABASE_URL="postgresql://storeuser:storepass@localhost:5432/storedb?schema=public"
JWT_SECRET="your-secret-key-here"
```

## 🐛 Debugging

### Check service logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Database access
```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U storeuser -d storedb

# Or using a GUI tool:
# Host: localhost
# Port: 5432
# Database: storedb
# Username: storeuser
# Password: storepass
```

## 🚧 Intentional Vulnerabilities

This application contains various security vulnerabilities for educational purposes:

1. **SQL Injection possibilities** - Limited input sanitization
2. **XSS vulnerabilities** - Minimal output encoding
3. **Authentication bypasses** - Weak session management
4. **CSRF vulnerabilities** - Limited CSRF protection
5. **Information disclosure** - Verbose error messages
6. **Insecure direct object references** - Predictable IDs

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## ⚖️ License

This project is for educational purposes only. Use responsibly and only in authorized testing environments.

## 🤝 Support

For questions or issues:
1. Check the troubleshooting section
2. Review the logs
3. Open an issue on GitHub

---

**Remember**: This application is designed for pentesting education. Always use in controlled, authorized environments only.