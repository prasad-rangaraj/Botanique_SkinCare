# BOTANIQUE — REST API Documentation

This document describes the complete REST API architecture for the BOTANIQUE e-commerce backend platform.

Base URL: `http://localhost:5000/api`

---

## 1. Authentication (`/auth`)

### `POST /auth/register`
Register a new customer account.
- **Body**:
  ```json
  {
    "email": "customer@example.com",
    "password": "Password123",
    "firstName": "Ritual",
    "lastName": "User",
    "phone": "9876543210"
  }
  ```
- **Response `201`**: `{ success: true, token: string, user: object }`

### `POST /auth/login`
Authenticate an existing customer or admin.
- **Body**:
  ```json
  {
    "email": "customer@example.com",
    "password": "Password123"
  }
  ```
- **Response `200`**: `{ success: true, token: string, user: object }`

### `GET /auth/me`
Retrieve currently authenticated user session.
- **Headers**: `Authorization: Bearer <token>`
- **Response `200`**: `{ success: true, user: object }`

### `POST /auth/change-password`
Change authenticated account password.
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ "currentPassword": "...", "newPassword": "..." }`
- **Response `200`**: `{ success: true, message: string }`

---

## 2. Product Catalogue (`/products`)

### `GET /products`
Retrieve published product catalogue with filtering and pagination.
- **Query Parameters**:
  - `category`: Category slug (e.g., `face-oils`)
  - `search`: Keyword query matching name or description
  - `minPrice`: Minimum price filter
  - `maxPrice`: Maximum price filter
  - `sort`: `price` | `createdAt` | `name`
  - `order`: `asc` | `desc`
  - `page`: Page index (default: `1`)
  - `limit`: Items per page (default: `12`)
- **Response `200`**:
  ```json
  {
    "success": true,
    "products": [...],
    "pagination": { "total": 5, "page": 1, "limit": 12, "totalPages": 1 }
  }
  ```

### `GET /products/featured`
Retrieve featured products for the storefront homepage.
- **Response `200`**: `{ success: true, products: [...] }`

### `GET /products/categories`
Retrieve all active product categories with product counts.
- **Response `200`**: `{ success: true, categories: [...] }`

### `GET /products/:slug`
Retrieve full product details, ingredients, safety notes, and related recommendations.
- **Response `200`**: `{ success: true, product: object, related: [...] }`

---

## 3. Shopping Cart (`/cart`)
*Requires `Authorization: Bearer <token>`*

### `GET /cart`
Retrieve authenticated user's current shopping cart and active items.
- **Response `200`**: `{ success: true, cart: { id, items: [...] } }`

### `POST /cart/add`
Add a product formulation to the cart.
- **Body**: `{ "productId": "...", "quantity": 1 }`
- **Response `200`**: `{ success: true, cart: object }`

### `PUT /cart/items/:itemId`
Update quantity of an existing item in the cart.
- **Body**: `{ "quantity": 2 }`
- **Response `200`**: `{ success: true, cart: object }`

### `DELETE /cart/items/:itemId`
Remove an item from the cart.
- **Response `200`**: `{ success: true, cart: object }`

### `DELETE /cart/clear`
Clear all items in the user's cart.
- **Response `200`**: `{ success: true, message: "Cart cleared" }`

---

## 4. Checkout & Orders (`/orders`)
*Requires `Authorization: Bearer <token>`*

### `POST /orders`
Create an order from user's current cart items. Decrements stock and clears cart inside a database transaction.
- **Body**:
  ```json
  {
    "addressId": "uuid",
    "notes": "Optional delivery instructions"
  }
  ```
- **Response `201`**: `{ success: true, order: object }`

### `GET /orders/:id`
Retrieve order details, items, address, payment, and shipment status.
- **Response `200`**: `{ success: true, order: object }`

### `POST /orders/:id/cancel`
Submit order cancellation request for unfulfilled orders.
- **Response `200`**: `{ success: true, message: string }`

### `POST /orders/:id/return`
Submit return request for delivered orders.
- **Body**: `{ "reason": "Unopened product" }`
- **Response `201`**: `{ success: true, returnRequest: object }`

### `POST /orders/:id/refund`
Submit refund request for eligible orders.
- **Body**: `{ "reason": "Damaged container during transit" }`
- **Response `201`**: `{ success: true, refundRequest: object }`

### `POST /orders/:id/replacement`
Submit replacement request for defective or broken parcels.
- **Body**: `{ "reason": "Damaged dropper bottle" }`
- **Response `201`**: `{ success: true, replacementRequest: object }`

---

## 5. Payments (`/payments`)
*Requires `Authorization: Bearer <token>`*

### `POST /payments/create-order`
Generates a Razorpay Order ID for client SDK initialization.
- **Body**: `{ "orderId": "uuid" }`
- **Response `200`**:
  ```json
  {
    "success": true,
    "razorpayOrderId": "order_XXXXX",
    "amount": 145000,
    "currency": "INR",
    "keyId": "rzp_test_..."
  }
  ```

### `POST /payments/verify`
Server-side cryptographic HMAC SHA-256 signature verification.
- **Body**:
  ```json
  {
    "orderId": "uuid",
    "razorpay_order_id": "order_XXXXX",
    "razorpay_payment_id": "pay_XXXXX",
    "razorpay_signature": "signature_hex"
  }
  ```
- **Response `200`**: `{ success: true, message: "Payment verified successfully" }`

### `POST /payments/failure`
Record payment cancellation or gateway failure.
- **Body**: `{ "orderId": "uuid", "reason": "..." }`
- **Response `200`**: `{ success: true, message: "Payment failure recorded" }`

---

## 6. Shipping & Delivery (`/shipping`)

### `POST /shipping/check-pincode`
Validate PIN code serviceability and fetch delivery charges.
- **Body**: `{ "pincode": "560001" }`
- **Response `200`**:
  ```json
  {
    "success": true,
    "serviceable": true,
    "deliveryCharge": 0,
    "estimatedDays": "2–5 business days after fulfillment",
    "zoneName": "Bengaluru"
  }
  ```

---

## 7. AI Support Assistant (`/chatbot`)

### `POST /chatbot/message`
Query the Botanique botanical knowledge assistant.
- **Body**: `{ "message": "What are the ingredients in Rose Face Oil?", "sessionId": "..." }`
- **Response `200`**:
  ```json
  {
    "success": true,
    "reply": "Rose Face Oil — ₹1,450 / 30 ml\n\nIngredients: Squalane, Jojoba Seed Oil, Rosehip Seed Oil, Rose Extract, Tocopherol...",
    "source": "knowledge-base"
  }
  ```

---

## 8. Customer Profile & Addresses (`/users`)
*Requires `Authorization: Bearer <token>`*

- `GET /users/profile`: Customer profile details
- `PUT /users/profile`: Update name and phone
- `GET /users/addresses`: Saved delivery addresses
- `POST /users/addresses`: Add new address
- `PUT /users/addresses/:id`: Edit address
- `DELETE /users/addresses/:id`: Delete address
- `GET /users/orders`: Customer order history

---

## 9. Admin Operations (`/admin`)
*Requires `Authorization: Bearer <token>` and `Role: ADMIN | SUPER_ADMIN`*

- `GET /admin/dashboard`: Aggregate KPI metrics, revenue, order totals, top products
- `GET /admin/customers`: Customer listing and order counts
- `GET /admin/customers/:id`: Customer profile and full purchase record
- `GET /admin/settings`: Site configuration parameters
- `PUT /admin/settings`: Update banners, emails, return policy status
- `GET /admin/requests`: Pending returns, refunds, and replacements
- `PATCH /admin/requests/return/:id`: Approve/reject return
- `PATCH /admin/requests/refund/:id`: Approve/reject refund
- `PATCH /admin/requests/replacement/:id`: Approve/reject replacement
- `GET /admin/shipping-zones`: Configured delivery zones
- `POST /admin/shipping-zones`: Create shipping zone
- `DELETE /admin/shipping-zones/:id`: Delete shipping zone
- `GET /admin/audit-logs`: Security audit log entries
- `GET /products/admin/all`: Complete product inventory
- `POST /products/admin`: Add new formulation
- `PUT /products/admin/:id`: Update formulation
- `DELETE /products/admin/:id`: Delete formulation
- `GET /orders/admin/all`: All platform orders
- `PATCH /orders/admin/:id/status`: Update order fulfillment status
- `PUT /orders/admin/:id/shipment`: Assign courier name and tracking code

