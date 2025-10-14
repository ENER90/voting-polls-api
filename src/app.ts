import express from "express";
import cors from "cors";
import {
  getDatabaseStatus,
  databaseHealthCheck,
  checkDatabaseConnection,
} from "./middlewares/database.middleware";
import {
  authenticateToken,
  requireRole,
  requireAuth,
  AuthenticatedRequest,
} from "./middlewares/auth.middleware";
import authRoutes from "./routes/auth.routes";
import pollRoutes from "./routes/poll.routes";
import voteRoutes from "./routes/vote.routes";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3002",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

app.get("/api", (req, res) => {
  res.json({
    message: "Welcome to Voting & Polls API",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      api: "/api",
      database: "/api/database",
      auth: {
        register: "POST /api/auth/register",
        login: "POST /api/auth/login",
        profile: "GET /api/auth/me (requires auth)",
      },
      polls: {
        getAll: "GET /api/polls",
        getById: "GET /api/polls/:id",
        create: "POST /api/polls (requires auth)",
        update: "PUT /api/polls/:id (requires auth + ownership)",
        delete: "DELETE /api/polls/:id (requires auth + ownership)",
      },
      votes: {
        cast: "POST /api/votes (requires auth)",
        results: "GET /api/votes/results/:pollId",
        myVotes: "GET /api/votes/my-votes (requires auth)",
      },
    },
  });
});

app.get("/api/database", databaseHealthCheck);

app.use("/api/auth", authRoutes);

app.use("/api/polls", pollRoutes);

app.use("/api/votes", voteRoutes);

app.get("/api/protected", checkDatabaseConnection, (req, res) => {
  res.json({
    message: "This route requires database connection",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/public", (req, res) => {
  res.json({
    message: "This is a public route, no authentication required",
    timestamp: new Date().toISOString(),
  });
});

app.get(
  "/api/auth/profile",
  authenticateToken,
  (req: AuthenticatedRequest, res) => {
    res.json({
      message: "User profile data",
      user: {
        id: req.user?.userId,
        email: req.user?.email,
        role: req.user?.role,
      },
      timestamp: new Date().toISOString(),
    });
  }
);

app.get(
  "/api/admin/users",
  ...requireAuth("admin"),
  (req: AuthenticatedRequest, res) => {
    res.json({
      message: "Admin route - List all users",
      adminUser: req.user?.email,
      timestamp: new Date().toISOString(),
    });
  }
);

app.get(
  "/api/dashboard",
  ...requireAuth(["user", "admin"]),
  (req: AuthenticatedRequest, res) => {
    res.json({
      message: "Dashboard data for authenticated users",
      user: {
        email: req.user?.email,
        role: req.user?.role,
      },
      timestamp: new Date().toISOString(),
    });
  }
);

app.use("*", (req, res) => {
  res.status(404).json({
    error: "Route not found",
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

export default app;
