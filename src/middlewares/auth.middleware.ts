import { Request, Response, NextFunction } from "express";
import { verifyToken, JwtPayload } from "../utils/jwt";

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export type UserRole = "user" | "admin";
export type RequiredRoles = UserRole | UserRole[];

export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({
        error: "Access denied",
        message: "No token provided",
      });
      return;
    }

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7) // Remover "Bearer "
      : authHeader;

    if (!token) {
      res.status(401).json({
        error: "Access denied",
        message: "Invalid token format",
      });
      return;
    }

    const decoded = verifyToken(token);

    req.user = decoded;

    next();
  } catch (error) {
    let message = "Invalid token";

    if (error instanceof Error) {
      if (error.message.includes("expired")) {
        message = "Token expired";
      } else if (error.message.includes("invalid")) {
        message = "Invalid token";
      }
    }

    res.status(401).json({
      error: "Authentication failed",
      message,
    });
  }
};

export const requireRole = (roles: RequiredRoles) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    try {
      if (!req.user) {
        res.status(401).json({
          error: "Access denied",
          message: "Authentication required",
        });
        return;
      }

      const requiredRoles = Array.isArray(roles) ? roles : [roles];

      const hasRequiredRole = requiredRoles.includes(req.user.role);

      if (!hasRequiredRole) {
        res.status(403).json({
          error: "Forbidden",
          message: `Access denied. Required role(s): ${requiredRoles.join(
            ", "
          )}`,
          userRole: req.user.role,
        });
        return;
      }

      next();
    } catch (error) {
      res.status(500).json({
        error: "Internal server error",
        message: "Error checking user permissions",
      });
    }
  };
};

export const requireAuth = (roles?: RequiredRoles) => {
  if (roles) {
    return [authenticateToken, requireRole(roles)];
  } else {
    return [authenticateToken];
  }
};
