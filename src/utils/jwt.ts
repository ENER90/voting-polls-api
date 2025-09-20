import jwt, { SignOptions } from "jsonwebtoken";

export interface JwtPayload {
  userId: string;
  email: string;
  role: "user" | "admin";
  iat?: number;
  exp?: number;
}

export interface TokenOptions {
  expiresIn?: string; // Ej: "7d", "24h", "30m"
}

export const generateToken = (
  payload: Omit<JwtPayload, "iat" | "exp">,
  options?: TokenOptions
): string => {
  //Obtener la clave secreta
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET no está definido en las variables de entorno");
  }

  const defaultOptions = {
    expiresIn: "7d",
  };

  const tokenOptions = { ...defaultOptions, ...options };

  // Crear y firmar el token
  try {
    const token = jwt.sign(
      payload, // Los datos del usuario
      secret, // Clave secreta para firmar
      tokenOptions as SignOptions // Opciones (expiración, etc.)
    );

    return token;
  } catch (error) {
    throw new Error(`Error generando token: ${error}`);
  }
};

export const verifyToken = (token: string): JwtPayload => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET no está definido en las variables de entorno");
  }

  try {
    // 2️⃣ Verificar y decodificar el token
    const decoded = jwt.verify(token, secret) as JwtPayload;

    if (!decoded.userId || !decoded.email || !decoded.role) {
      throw new Error("Token inválido: faltan datos requeridos");
    }

    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error("Token expirado");
    }

    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error("Token inválido");
    }

    if (error instanceof jwt.NotBeforeError) {
      throw new Error("Token no es válido todavía");
    }

    throw new Error(`Error verificando token: ${error}`);
  }
};
