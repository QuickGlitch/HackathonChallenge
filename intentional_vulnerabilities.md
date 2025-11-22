
# Intentional Vulnerabilities Documentation

## Placing free orders

This example is very much gamified - a real webshop would (heopfully) never put the total price in the client side code, but rather calculate it on the server side. However for the hackathon this is an intentional vulnerability that serves as an easy entry point for scoring points.
This exploit is repeatable - meaning an attacker can place multiple free orders and build up points quickly until they hit a defence mechanism: rate limiting. This serves as a good example of how rate limiting can be used to slow down attackers but also means a hacker team can try to find ways around rate limiting (e.g. rotating proxies, distributed attacks etc) in order to keep scoring points.

## Tricking users into paying the attacker (CSRF)

For gamification's sake the payable account (`payableTo`) is sent from the client side when placing an order. This means an attacker can modify this field to point to their own account and trick users into paying them instead of the webshop. A smiliar mehcanism that is more realistic is having users tricking into paying for a product but having it shipped to the attacker instead of themselves.

An example of this implementation is done in `apps/csrf-demo`, exploiting the bots that visit the forum posts (simulating users/victims who might click on links or emails). If you run this application (while the frontend & backend are running) and post a link to it in the forum, the bots will visit the link, disguised as a sale, and place an order paying into the attacker's account.

## PII

A user can only access their own information via the API. Obtaining admin privelages they can access other users PII.

## Obtaining unreleased products

Some products in the database are not yet released to the general public. An attacker can obtain admin privelages and access these unreleased products - leaking the data.
The attacker may achieve this by exploiting SQL injection in the search endpoint, by gaining admin privelages or IDOR (see below).

## Obtaining unreleased products via IDOR

The product details endpoint `/api/products/:id` does not check if a product is released or not when accessed by a regular user. This means an attacker can simply iterate over product IDs (they are autoincremented integers) and access unreleased products that way.

## Obtaining Admin Privelages

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

9. **Access all order data** - The `/api/orders` GET endpoint returns all orders from all users without authentication checks

## File Upload Vulnerability / Web Shell Upload

As part of the reseller functionality, users can upload images for the products they want to resell. However, the image upload endpoint does not properly validate the uploaded files, allowing attackers to upload malicious files disguised as images. In this example a PHP web shell can be uploaded, enabling remote command execution on the server. See the [file upload exploit documentation](attack-utils/file-upload/file-upload.md) for more details.
