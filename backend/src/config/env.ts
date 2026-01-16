import dotenv from "dotenv";

dotenv.config();

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number(process.env.PORT) || 8080,
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
  DB_URL: process.env.DB_URL || "mongodb://localhost:27017/yourdb",
};
