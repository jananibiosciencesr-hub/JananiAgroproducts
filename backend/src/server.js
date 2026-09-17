import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";

import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import inquiryRoutes from "./routes/inquiryRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

import { initDatabase } from "./config/initDb.js";
import { testConnection, query, isDbConnected } from "./config/db.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:8080", "https://jananiagroproducts.com"],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  return res.status(200).json({
    status: "ok",
    service: "Janani Agro Products API Server",
    database: isDbConnected() ? "Connected (MySQL)" : "Standby / Initializing",
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
    environment: process.env.NODE_ENV || "development",
  });
});

// Database Auto-Initialization Endpoint
app.all("/api/db/init", async (req, res) => {
  try {
    console.log("🚀 [API /api/db/init] Auto-creating database, tables, and seeding data...");
    const result = await initDatabase();
    return res.status(result.success ? 200 : 500).json(result);
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Database Status Endpoint
app.get("/api/db/status", async (req, res) => {
  try {
    const conn = await testConnection();
    if (!conn.success) {
      return res.status(500).json({ success: false, connection: conn });
    }

    const tables = ["users", "categories", "products", "orders", "coupons", "settings", "reviews", "cms_banners", "payments", "inquiries", "activity_logs"];
    const counts = {};
    for (const t of tables) {
      try {
        const rows = await query(`SELECT COUNT(*) as count FROM \`${t}\``);
        counts[t] = rows[0]?.count ?? 0;
      } catch (e) {
        counts[t] = `Not Created (${e.message})`;
      }
    }

    return res.status(200).json({
      success: true,
      database: process.env.DB_NAME,
      host: process.env.DB_HOST,
      connection: conn,
      tableCounts: counts
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Root route
app.get("/", (req, res) => {
  return res.status(200).json({
    message: "Welcome to JANANI AGRO PRODUCTS Backend API Server",
    documentation: "/api/health",
    databaseInit: "/api/db/init",
    databaseStatus: "/api/db/status",
    version: "1.0.0",
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/inquiries", inquiryRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/admin", adminRoutes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

// Start server and trigger DB auto-initialization
app.listen(PORT, async () => {
  console.log(`\n🌱 JANANI AGRO PRODUCTS Backend Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📦 Database status: http://localhost:${PORT}/api/db/status`);
  console.log(`⚡ Auto-create DB & tables: http://localhost:${PORT}/api/db/init\n`);

  // Attempt auto-initialization on startup
  try {
    console.log("⏳ Initializing MySQL database connection & tables...");
    await initDatabase();
  } catch (e) {
    console.warn("⚠️ Database auto-initialization postponed (MySQL server might still be provisioning). Endpoint /api/db/init is ready.");
  }
});

export default app;
