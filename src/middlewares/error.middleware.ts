import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";

interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  stack?: string;
  timestamp: string;
  path: string;
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = 500;
  let message = "Internal server error";
  let error = "Error";

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    error = getErrorType(statusCode);
  } else {
    message = err.message || "Something went wrong";
  }

  const errorResponse: ErrorResponse = {
    error,
    message,
    statusCode,
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
  };

  if (process.env.NODE_ENV === "development") {
    errorResponse.stack = err.stack;
  }

  console.error("Error:", {
    statusCode,
    message,
    path: req.originalUrl,
    method: req.method,
    error: err,
  });

  res.status(statusCode).json(errorResponse);
};

const getErrorType = (statusCode: number): string => {
  switch (statusCode) {
    case 400:
      return "Bad Request";
    case 401:
      return "Unauthorized";
    case 403:
      return "Forbidden";
    case 404:
      return "Not Found";
    case 409:
      return "Conflict";
    case 422:
      return "Validation Error";
    case 500:
      return "Internal Server Error";
    default:
      return "Error";
  }
};
