# JANANI AGRO PRODUCTS — Backend API Server

Express.js RESTful API server powering Janani Agro Products e-commerce platform.

## Features
- **Products API**: Filtering by category, search keywords, price ranges, and sorting.
- **Categories API**: Product counts, descriptions, and category detail routes.
- **Orders API**: Order creation, inventory validation, discounts, and real-time shipment tracking.
- **Commercial & Dealership API**: B2B bulk orders and distributor applications.
- **Contact & Support API**: Customer feedback and newsletter subscription.

## Running Locally

```bash
npm install
npm run dev
```

Server runs by default at `http://localhost:5000`.

## Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | API server status & uptime |
| `GET` | `/api/products` | List all products (with query filters) |
| `GET` | `/api/products/:idOrSlug` | Product details & related items |
| `GET` | `/api/products/categories` | List all product categories |
| `POST` | `/api/orders` | Place / create a new order |
| `GET` | `/api/orders` | List recent orders |
| `GET` | `/api/orders/track/:query` | Track order by ID or phone |
| `POST` | `/api/inquiries` | Submit commercial / bulk inquiry |
| `POST` | `/api/inquiries/dealers` | Apply for dealership / distributorship |
| `POST` | `/api/contact/message` | Submit customer support message |
| `POST` | `/api/contact/newsletter` | Newsletter subscription |
