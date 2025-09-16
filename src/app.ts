import express from "express";
import cors from "cors";
import {
  getDatabaseStatus,
  databaseHealthCheck,
  checkDatabaseConnection,
} from "./middlewares/database.middleware";

const app = express();

// Middlewares
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3002",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get("/health", (req, res) => {
  const dbStatus = getDatabaseStatus();
  const isHealthy = dbStatus.status === "connected";

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? "OK" : "DEGRADED",
    message: "Voting & Polls API is running!",
    services: {
      api: "OK",
      database: dbStatus.status,
    },
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

// API routes will be added here
app.get("/api", (req, res) => {
  res.json({
    message: "Welcome to Voting & Polls API",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      api: "/api",
      database: "/api/database",
    },
  });
});

// Database status endpoint
app.get("/api/database", databaseHealthCheck);

// Example of protected route (requires database connection)
app.get("/api/protected", checkDatabaseConnection, (req, res) => {
  res.json({
    message: "This route requires database connection",
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Route not found",
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

export default app;
