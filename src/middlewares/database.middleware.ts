import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

export interface DatabaseStatus {
  status:
    | "connected"
    | "disconnected"
    | "connecting"
    | "disconnecting"
    | "unknown";
  database?: string;
  host?: string;
  port?: number;
  readyState: number;
}

export const getDatabaseStatus = (): DatabaseStatus => {
  const connection = mongoose.connection;
  const states: Record<
    number,
    "disconnected" | "connected" | "connecting" | "disconnecting"
  > = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  return {
    status: states[connection.readyState] || "unknown",
    database: connection.db?.databaseName,
    host: connection.host,
    port: connection.port,
    readyState: connection.readyState,
  };
};

export const checkDatabaseConnection = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const dbStatus = getDatabaseStatus();

  if (dbStatus.status !== "connected") {
    return res.status(503).json({
      error: "Service Unavailable",
      message: "Database connection is not available",
      database: dbStatus,
      timestamp: new Date().toISOString(),
    });
  }

  next();
};

export const databaseHealthCheck = (req: Request, res: Response) => {
  const dbStatus = getDatabaseStatus();
  const isHealthy = dbStatus.status === "connected";

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? "OK" : "ERROR",
    message: isHealthy
      ? "Database connection is healthy"
      : "Database connection is not available",
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
};
