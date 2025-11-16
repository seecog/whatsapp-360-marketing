// src/db/index.js
import { Sequelize } from 'sequelize';
import mysql from 'mysql2/promise';

// --- helpers ---
// const req = (key, fallback) => {
//   const v = process.env[key] ?? fallback;
//   if (v === undefined || v === null || v === '') {
//     throw new Error(`Missing required env: ${key}`);
//   }
//   return v;
// };

// --- env (already loaded in index.js) ---
const DB_HOST = process.env.DB_HOST || 'localhost';  // GoDaddy: 'localhost'; local can be '127.0.0.1'
const DB_PORT = Number(process.env.DB_PORT || 3306);
const DB_NAME = process.env.DB_NAME || 'whatsappTool';
const DB_USER = process.env.DB_USER ?? 'pankaj_tinku';
const DB_PASSWORD = process.env.DB_PASSWORD ?? 'Pankaj12345$$';
const CREATE_DB_IF_MISSING = (process.env.CREATE_DB_IF_MISSING || 'false') === 'true';
const SYNC_DB = (process.env.SYNC_DB || 'false') === 'true';

// --- sequelize instance ---
export const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: 'mysql',
  logging: false,
  pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
  dialectOptions: { charset: 'utf8mb4' },
  define: { charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' },
});

// --- connector ---
const connectDB = async () => {
  try {
    if (CREATE_DB_IF_MISSING) {
      const conn = await mysql.createConnection({
        host: DB_HOST,
        port: DB_PORT,
        user: DB_USER,
        password: DB_PASSWORD,
      });
      await conn.query(
        `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
      );
      await conn.end();
    }

    await sequelize.authenticate();
    console.log(`\n✅ MySQL connected → ${sequelize.getDatabaseName()} @ ${DB_HOST}:${DB_PORT}`);

    await import('../models/index.js');

    if (SYNC_DB) {
      await sequelize.sync({ alter: true });
      console.log('🔄 Schema synced (alter).');
    } else {
      console.log('ℹ️ Skipping schema sync (set SYNC_DB=true to enable).');
    }
  } catch (err) {
    console.error('❌ MySQL connection error:', err?.message || err);
    process.exit(1);
  }
};

export default connectDB;
