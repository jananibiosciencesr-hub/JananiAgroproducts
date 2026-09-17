import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const DB_CONFIG = {
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || "u409810820_Jananiagropro",
  password: process.env.DB_PASSWORD || "Jananiagro@123",
  database: process.env.DB_NAME || "u409810820_Jananiagro",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  charset: "utf8mb4"
};

let pool = null;
let isConnected = false;

export function getPool() {
  if (!pool) {
    pool = mysql.createPool(DB_CONFIG);
  }
  return pool;
}

export async function testConnection() {
  try {
    const activePool = getPool();
    const connection = await activePool.getConnection();
    await connection.ping();
    connection.release();
    isConnected = true;
    console.log(`✅ [MySQL] Successfully connected to database: ${DB_CONFIG.database} on ${DB_CONFIG.host}:${DB_CONFIG.port}`);
    return { success: true, message: `Connected to ${DB_CONFIG.database}` };
  } catch (error) {
    isConnected = false;
    console.warn(`⚠️ [MySQL] Connection failed (${error.code || error.message}). Running in mock/offline mode.`);
    return { success: false, error: error.message, code: error.code };
  }
}

export async function query(sql, params = []) {
  try {
    const activePool = getPool();
    const [rows, fields] = await activePool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error(`❌ [MySQL Query Error] SQL: ${sql}`, error.message);
    throw error;
  }
}

export function isDbConnected() {
  return isConnected;
}

export default {
  getPool,
  testConnection,
  query,
  isDbConnected,
  config: DB_CONFIG
};
