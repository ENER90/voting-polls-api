import { Request, Response } from "express";
import { User } from "../models/user.model";
import { generateToken } from "../utils/jwt";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

// 📝 REGISTER: Registrar nuevo usuario
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body;

    // 1️⃣ Validar que todos los campos estén presentes
    if (!username || !email || !password) {
      res.status(400).json({
        error: "Validation error",
        message: "Username, email and password are required",
      });
      return;
    }

    // 2️⃣ Verificar si el usuario ya existe (email o username)
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      const field = existingUser.email === email ? "Email" : "Username";
      res.status(409).json({
        error: "User already exists",
        message: `${field} is already registered`,
      });
      return;
    }

    // 3️⃣ Crear nuevo usuario (password se hashea automáticamente)
    const newUser = await User.create({
      username,
      email,
      password,
      role: "user", // Por defecto todos son usuarios normales
    });

    // 4️⃣ Generar JWT token
    const token = generateToken({
      userId: newUser._id.toString(),
      email: newUser.email,
      role: newUser.role,
    });

    // 5️⃣ Responder con usuario y token (sin password)
    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        createdAt: newUser.createdAt,
      },
      token,
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Error registering user",
    });
  }
};

// 🔐 LOGIN: Iniciar sesión
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // 1️⃣ Validar que todos los campos estén presentes
    if (!email || !password) {
      res.status(400).json({
        error: "Validation error",
        message: "Email and password are required",
      });
      return;
    }

    // 2️⃣ Buscar usuario por email
    const user = await User.findOne({ email });

    if (!user) {
      res.status(401).json({
        error: "Authentication failed",
        message: "Invalid credentials",
      });
      return;
    }

    // 3️⃣ Verificar contraseña usando comparePassword
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      res.status(401).json({
        error: "Authentication failed",
        message: "Invalid credentials",
      });
      return;
    }

    // 4️⃣ Generar JWT token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    // 5️⃣ Responder con usuario y token
    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Error logging in",
    });
  }
};

// 👤 GET PROFILE: Obtener perfil del usuario autenticado
export const getProfile = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    // 1️⃣ El usuario ya viene de authenticateToken middleware
    if (!req.user) {
      res.status(401).json({
        error: "Access denied",
        message: "Authentication required",
      });
      return;
    }

    // 2️⃣ Buscar usuario actualizado en la BD
    const user = await User.findById(req.user.userId).select("-password");

    if (!user) {
      res.status(404).json({
        error: "Not found",
        message: "User not found",
      });
      return;
    }

    // 3️⃣ Responder con datos del usuario (sin password)
    res.status(200).json({
      message: "User profile retrieved successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Error retrieving user profile",
    });
  }
};
