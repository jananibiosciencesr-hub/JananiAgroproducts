# JANANI AGRO PRODUCTS — FULLSTACK E-COMMERCE PLATFORM

Ultra-premium luxury organic agriculture products e-commerce platform built with React, TanStack Start, Vite, Tailwind CSS, Node.js, and Express.

---

## 📁 Monorepo Workspace Structure

```
Janani Agro/
├── frontend/                     # Full Frontend Web Application
│   ├── src/
│   │   ├── routes/               # File-based TanStack Start pages (Home, Products, Cart, Checkout, etc.)
│   │   ├── components/           # SiteShell, ProductCards, Brand, UI components
│   │   ├── lib/                  # API client (`api.ts`), catalog data, utility helpers
│   │   └── styles.css            # Global design system and custom styling
│   ├── public/                   # Static assets, favicon, robots.txt
│   ├── package.json              # Frontend dependencies and build scripts
│   ├── tsconfig.json             # TypeScript configuration
│   └── vite.config.ts            # Vite config with backend API proxy
├── backend/                      # Complete Express & PHP REST API Server
│   ├── src/                      # Express application, controllers, routes, config
│   ├── database.sql              # Complete MySQL database schema & seed data
│   ├── php/                      # PHP API & setup scripts (api.php, db_init.php)
│   ├── scripts/                  # Helper & test scripts (test_payments.js)
│   ├── package.json              # Backend dependencies (Express, MySQL2, CORS, Dotenv)
│   └── .env                      # Server port, database & SMTP configuration
├── package.json                  # Unified root workspace scripts (dev, build, start)
├── tsconfig.json                 # Monorepo TypeScript IDE configuration
├── .gitignore                    # Global ignore rules (dist/, node_modules/, etc.)
└── README.md                     # Documentation
```

---

## 🚀 Running the Fullstack Application

### 1. Run Both Frontend & Backend Concurrently (Recommended)
From the root directory:
```bash
npm run dev
```
- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

### 2. Run Independently

#### Run Backend Server:
```bash
cd backend
npm run dev
```

#### Run Frontend App:
```bash
cd frontend
npm run dev
```

---

## 🛠️ Production Build

To test and create the optimized frontend production bundle:
```bash
npm run build
```
