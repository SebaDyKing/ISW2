import { config } from 'dotenv';
config();

export const db = {
  user: process.env.DB_USERNAME || process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DATABASE || process.env.DB_NAME
}

export const PORT = Number(process.env.PORT) || 3000;
export const HOST = process.env.HOST || 'localhost';
export const EMAIL_USER = process.env.EMAIL_USER;
export const EMAIL_PASS = process.env.EMAIL_PASS;
export const JWT_SECRET           = process.env.JWT_SECRET           || "CleanPro_Secreto_Ultra_Seguro_2026";
export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "CleanPro_Refresh_Secreto_2026";

export const ACCESS_TOKEN_EXPIRY     = "15m";
export const REFRESH_TOKEN_EXPIRY    = "7d";
export const REFRESH_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;