# CSRF Attack Demonstration App

This app demonstrates a Cross-Site Request Forgery (CSRF) attack against the webshop's order endpoint.

## 🎯 Attack Overview

This is a malicious website that appears to offer a "90% OFF Special Deal" on a Coffee Maker. When a victim who is logged into the webshop visits this page and clicks the "CLAIM YOUR DEAL NOW!" button, it performs a CSRF attack.

### How the Attack Works

1. **Victim is logged in**: The victim must be authenticated on the webshop (has a valid `accessToken` cookie)
2. **Victim visits malicious site**: They click a link (e.g., from a forum post or phishing email) to this CSRF app
3. **Malicious order is placed**: When they click the button, a POST request is sent to `http://localhost:3001/api/orders` with:
   - The victim's cookies automatically included (`credentials: 'include'`)
   - `payableTo` set to attacker's user ID (999) instead of the legitimate seller
   - The order appears legitimate to the victim (they see a Coffee Maker)
4. **Funds are diverted**: The payment goes to the attacker (user ID 999) instead of the product seller

### Key Vulnerability Exploited

- **Missing CSRF Protection**: The order endpoint doesn't validate CSRF tokens
- **Payment Diversion**: The `payableTo` field in order items can be manipulated to redirect funds
- **Cookie-based Authentication**: The browser automatically sends authentication cookies with cross-origin requests

## 🚀 Running the App

```bash
cd apps/csrf-app
npm run dev
```

The app will be served at `http://localhost:8080`

## 🧪 Testing the Attack

1. **Start the webshop backend**:
   ```bash
   cd apps/backend
   npm run dev
   ```

2. **Start the webshop frontend**:
   ```bash
   cd apps/frontend
   npm run dev
   ```

3. **Login to the webshop**: Navigate to `http://localhost:3000` and log in as any user

4. **Visit the malicious CSRF site**: Open `http://localhost:8080` in the same browser

5. **Click the "CLAIM YOUR DEAL NOW!" button**: The CSRF attack will execute

6. **Check the results**:
   - Open the browser console to see attack logs
   - Check the webshop's orders to see the new order with `payableTo: 999`

## 🔒 Mitigations

To prevent this attack, the webshop should implement:

1. **CSRF Tokens**: Include anti-CSRF tokens in forms and validate them server-side
2. **SameSite Cookies**: Set cookies with `SameSite=Strict` or `SameSite=Lax`
3. **Origin Validation**: Check the `Origin` and `Referer` headers
4. **Additional Authentication**: Require password re-entry for sensitive operations
5. **PayableTo Validation**: Validate that `payableTo` matches the product's actual `sellerId`

## ⚠️ Educational Purpose Only

This demonstration is for educational purposes only. Performing CSRF attacks against real systems without authorization is illegal.
