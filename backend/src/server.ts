import bodyParser from "body-parser";
import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import http from "http";
import { ENV } from "./config/env";
import connectDB from "./config/db";
import { clerkMiddleware } from "@clerk/express";
import { serve } from "inngest/express";
import { functions, inngest } from "./config/inngest";

const app = express();

// Middleware
app.use(
  cors({
    origin: ENV.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());
app.use(clerkMiddleware()); // req.auth will be available
app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));

app.use("/api/inngest", serve({ client: inngest, functions }));
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

const startServer = async () => {
  await connectDB();

  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT} (${ENV.NODE_ENV})`);
  });
};

startServer();
