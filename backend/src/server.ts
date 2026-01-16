import bodyParser from "body-parser";
import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import http from "http";
import { ENV } from "./config/env";

const app = express();

// Middleware
app.use(
  cors({
    origin: ENV.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));

// API Router
// const apiRouter = express.Router();

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    environment: ENV.NODE_ENV,
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// Mount API routes
// app.use("/api", apiRouter);

// Start server
const PORT = ENV.PORT || 8080;
const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT} (${ENV.NODE_ENV})`);
});
