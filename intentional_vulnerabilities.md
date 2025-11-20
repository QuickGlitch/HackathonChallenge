
# Intentional Vulnerabilities Documentation

## Placing free orders

This example is very much gamified - a real webshop would (heopfully) never put the total price in the client side code, but rather calculate it on the server side. However for the hackathon this is an intentional vulnerability that serves as an easy entry point for scoring points.
This exploit is repeatable - meaning an attacker can place multiple free orders and build up points quickly until they hit a defence mechanism: rate limiting. This serves as a good example of how rate limiting can be used to slow down attackers but also means a hacker team can try to find ways around rate limiting (e.g. rotating proxies, distributed attacks etc) in order to keep scoring points.

## Tricking users into paying the attacker

For gamification's sake the payable account (`payableTo`) is sent from the client side when placing an order. This means an attacker can modify this field to point to their own account and trick users into paying them instead of the webshop. A smiliar mehcanism that is more realistic is having users tricking into paying for a product but having it shipped to the attacker instead of themselves.

## PII

A user can only access their own information via the API. However, either by using admin privelages or by exploiting SQL in the searchbar they can access other users PII.

## Explotiing Admin Privelages

Several endpoints are protected behind admin access. So how can an attacker get their hands on admin privelages?
As mentioned in the forum the admin will be clicking any links posted - which means an attacker can post links that snoop on admin sessions or perform actions on behalf of the admin.

### Exploits possible with admin privelages

1. **Access all user PII data** - Admin users can access the `/api/users` endpoint to retrieve all users' personally identifiable information, including the PII field containing sensitive data.

2. **View unreleased products** - Admins can see products that have `released: false`, giving them access to upcoming product information that should be hidden from regular users.

3. **Create unreleased products** - Only admins can create products with `released: false` status, allowing them to control product visibility.

4. **Modify product release status** - Admins can update any product's `released` field, controlling what products are visible to regular users.

5. **Delete any forum messages** - Admins can delete any forum message regardless of who authored it, while regular users can only delete their own messages.

6. **Create admin accounts** - Admins can create new admin users through the `/api/users` endpoint with `role: "admin"`.

7. **Update user roles** - Admins can modify any user's role through the user update endpoint, potentially promoting users to admin status.

8. **Delete any user account** - The `/api/users/:username` DELETE endpoint is restricted to admin access only.

9. **Access all order data** - The `/api/orders` GET endpoint returns all orders from all users without authentication checks (vulnerability - should require admin auth but doesn't).

## File Upload Vulnerability

Users can upload files to the server and create a web shell.
