import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

export async function pingDB() {
  try {
    const res = await pool.query('SELECT NOW()');
    return res.rows[0];
  } catch (err) {
    throw err;
  }
} 