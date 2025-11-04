# 🔓 Security Vulnerabilities Documentation

This document outlines the intentional security vulnerabilities present in the Store Hackathon application for educational pentesting purposes. 

⚠️ **WARNING**: This application is designed for educational purposes only. These vulnerabilities are intentional and should NEVER be present in production applications.

## 📋 Vulnerability Categories

1. [Basic Input Validation Gaps](#1-basic-input-validation-gaps)
2. [Potential SQL Injection Points](#2-potential-sql-injection-points)
3. [XSS Vulnerability Opportunities](#3-xss-vulnerability-opportunities)
4. [Weak Authentication Patterns](#4-weak-authentication-patterns)
5. [Information Disclosure](#5-information-disclosure)

---

## 1. Basic Input Validation Gaps

### 1.1 Missing Server-Side Validation - Product Creation
**Location**: `apps/backend/src/routes/products.js` (Lines 26-42)

```javascript
router.post('/', async (req, res) => {
  try {
    const { name, description, price, image, category } = req.body
    
    // Minimal validation - only checks for presence, not content
    if (!name || !description || !price) {
      return res.status(400).json({ error: 'Missing required fields' })
    }
    
    // No validation for:
    // - Price format (could be negative, string, etc.)
    // - Name length limits
    // - Description content
    // - Image URL format
    // - Category enumeration
```

**Vulnerability**: Accepts malformed data that could cause application errors or unexpected behavior.

**Exploitation**: Send requests with negative prices, extremely long names, or malicious URLs.

### 1.2 Frontend-Only Validation - Order Creation
**Location**: `apps/frontend/src/views/Checkout.vue` (Lines 45-75)

```vue
<template>
  <!-- Form validation only occurs on frontend -->
  <input v-model="form.name" type="text" class="form-input" required />
  <input v-model="form.email" type="email" class="form-input" required />
  <input v-model="form.cardNumber" type="text" class="form-input" placeholder="1234 5678 9012 3456" required />
</template>
```

**Vulnerability**: Client-side validation can be bypassed by sending direct API requests.

**Exploitation**: Use tools like Burp Suite to intercept and modify requests, bypassing frontend validation.

### 1.3 Unrestricted File Upload Simulation
**Location**: `apps/backend/src/routes/products.js` (Lines 35-37)

```javascript
// Accepts any image URL without validation
image: image || 'https://via.placeholder.com/300x200',
```

**Vulnerability**: No validation of image URLs, could lead to SSRF or content injection.

---

## 2. Potential SQL Injection Points

### 2.1 Dynamic Query Construction (Simulated)
**Location**: `apps/backend/src/routes/products.js` (Lines 15-20)

While using Prisma ORM provides some protection, there are still potential injection points:

```javascript
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    // Converting to parseInt provides some protection, but...
    const product = await req.prisma.product.findUnique({
      where: { id: parseInt(id) } // What if id is not a number?
    })
```

**Vulnerability**: If `parseInt(id)` returns `NaN`, unexpected behavior could occur.

**Exploitation**: Try sending non-numeric IDs or special characters.

### 2.2 Order Status Update Vulnerability
**Location**: `apps/backend/src/routes/orders.js` (Lines 71-79)

```javascript
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body
    
    // Limited validation of status values
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' })
    }
```

**Vulnerability**: While status is validated, the ID parameter is not properly sanitized.

### 2.3 Search Functionality (Not Implemented - Vulnerability Opportunity)
**Potential Location**: Future search endpoint

```javascript
// EXAMPLE of vulnerable search implementation
router.get('/search', async (req, res) => {
  const { query } = req.query
  // VULNERABLE: Direct string interpolation
  const products = await prisma.$queryRaw`
    SELECT * FROM products WHERE name LIKE '%${query}%'
  `
})
```

**Note**: This is not currently implemented but represents a common injection point.

---

## 3. XSS Vulnerability Opportunities

### 3.1 Unescaped Product Data Display
**Location**: `apps/frontend/src/views/Products.vue` (Lines 14-22)

```vue
<template>
  <div v-for="product in productStore.products" :key="product.id" class="card product-card">
    <!-- Potential XSS if product data contains scripts -->
    <h3>{{ product.name }}</h3>
    <p class="product-description">{{ product.description }}</p>
    <!-- Vue's double braces provide some XSS protection, but v-html would be vulnerable -->
  </div>
</template>
```

**Vulnerability**: While Vue.js templates provide some XSS protection by default, stored XSS could occur if product data contains malicious scripts and is rendered with `v-html`.

### 3.2 Customer Information Display
**Location**: `apps/frontend/src/views/Checkout.vue` (Lines 95-99)

```vue
<template>
  <div v-if="orderComplete" class="alert alert-success">
    <h3>Order Placed Successfully!</h3>
    <!-- Potential XSS if orderId contains malicious content -->
    <p>Thank you for your purchase. Your order ID is: {{ orderId }}</p>
  </div>
</template>
```

**Vulnerability**: If order IDs are not properly sanitized server-side, XSS could occur.

### 3.3 Error Message Display
**Location**: `apps/frontend/src/stores/products.js` (Lines 21-24)

```javascript
async function fetchProducts() {
  try {
    // ... fetch logic
  } catch (err) {
    error.value = 'Failed to fetch products' // Static message is safe
    console.error('Error fetching products:', err) // But console might expose sensitive data
  }
}
```

**Vulnerability**: Console logging could expose sensitive information in development tools.

---

## 4. Weak Authentication Patterns

### 4.1 No Authentication Implementation
**Location**: All API endpoints in `apps/backend/src/routes/`

```javascript
// NO authentication middleware
router.post('/', async (req, res) => {
  // Anyone can create/modify products
})

router.delete('/:id', async (req, res) => {
  // Anyone can delete products
})
```

**Vulnerability**: Complete lack of authentication and authorization.

**Exploitation**: Any user can perform admin operations like creating, updating, or deleting products.

### 4.2 Missing Session Management
**Location**: `apps/backend/src/index.js`

```javascript
// No session management implemented
app.use(express.json({ limit: '10mb' }))
// Missing: app.use(session(...))
// Missing: Authentication middleware
```

**Vulnerability**: No way to track user sessions or implement proper logout.

### 4.3 JWT Secret in Environment (Simulated)
**Location**: `apps/backend/.env`

```env
JWT_SECRET="your-secret-key-here-change-in-production"
```

**Vulnerability**: Weak/default JWT secret that could be easily guessed.

### 4.4 No Rate Limiting on Sensitive Operations
**Location**: `apps/backend/src/index.js` (Lines 19-23)

```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests - very permissive
  message: 'Too many requests from this IP, please try again later.'
})
```

**Vulnerability**: Rate limiting is too permissive and doesn't distinguish between different types of operations.

---

## 5. Information Disclosure

### 5.1 Verbose Error Messages
**Location**: `apps/backend/src/routes/products.js` (Lines 50-53)

```javascript
} catch (error) {
  console.error('Error creating product:', error)
  // Generic error message is good, but console.error might expose internal details
  res.status(500).json({ error: 'Failed to create product' })
}
```

**Vulnerability**: Detailed error information logged to console could expose internal application structure.

### 5.2 Database Error Exposure
**Location**: `apps/backend/src/routes/orders.js` (Lines 89-95)

```javascript
} catch (error) {
  if (error.code === 'P2025') {
    return res.status(404).json({ error: 'Order not found' })
  }
  console.error('Error updating order status:', error)
  // Could expose Prisma error codes and database structure
  res.status(500).json({ error: 'Failed to update order status' })
}
```

**Vulnerability**: Prisma error codes and detailed error logging could reveal database schema information.

### 5.3 API Endpoint Enumeration
**Location**: `apps/backend/src/index.js` (Lines 45-47)

```javascript
// Health check endpoint reveals server status
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' })
})
```

**Vulnerability**: Easily discoverable endpoints that confirm server status and technology stack.

### 5.4 Client-Side Sensitive Data
**Location**: `apps/frontend/src/views/Checkout.vue` (Lines 55-68)

```javascript
const orderData = {
  items: cartStore.items,
  total: cartStore.totalPrice,
  customer: { /* customer data */ },
  payment: {
    cardNumber: form.value.cardNumber, // Sensitive payment data in client-side code
    expiryDate: form.value.expiryDate,
    cvv: form.value.cvv
  }
}
```

**Vulnerability**: Payment information handled in client-side JavaScript, visible in browser dev tools.

---

## 🛠️ Exploitation Scenarios

### Scenario 1: Admin Privilege Escalation
1. Discover the `/api/products` POST endpoint
2. Create malicious products with XSS payloads in name/description
3. Delete legitimate products using DELETE endpoint
4. No authentication required for any of these operations

### Scenario 2: Data Injection
1. Use intercepting proxy to modify product creation requests
2. Send negative prices, extremely long descriptions
3. Inject malicious URLs in image fields
4. Observe application behavior and error messages

### Scenario 3: Information Gathering
1. Access `/api/health` to confirm server status
2. Trigger various error conditions to gather system information
3. Analyze client-side code for API endpoints and data structures
4. Use browser dev tools to inspect payment form data

### Scenario 4: Cross-Site Scripting
1. Create a product with malicious script in name/description (if v-html is used)
2. Social engineer users to view the malicious product
3. Execute JavaScript in victim's browser context

---

## 🔧 Recommended Security Improvements

### For Production Use (Educational Purposes):

1. **Input Validation**
   - Implement comprehensive server-side validation
   - Use schema validation libraries (e.g., Joi, Yup)
   - Sanitize all user inputs

2. **Authentication & Authorization**
   - Implement proper JWT authentication
   - Add role-based access control (RBAC)
   - Secure admin endpoints

3. **Data Protection**
   - Never handle payment data client-side
   - Use HTTPS for all communications
   - Implement proper session management

4. **Error Handling**
   - Use generic error messages for users
   - Log detailed errors securely server-side
   - Implement proper error monitoring

5. **Rate Limiting**
   - Implement stricter rate limits
   - Use different limits for different operations
   - Add IP-based blocking for abuse

---

## 📚 Testing Tools

Recommended tools for testing these vulnerabilities:

- **Burp Suite**: For intercepting and modifying HTTP requests
- **OWASP ZAP**: For automated vulnerability scanning
- **SQLMap**: For testing SQL injection points
- **XSSHunter**: For testing XSS vulnerabilities
- **Browser Dev Tools**: For client-side analysis

---

**Remember**: These vulnerabilities are intentional and for educational purposes only. Always practice ethical hacking in controlled environments with proper authorization.