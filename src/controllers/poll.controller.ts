import { Response } from "express";
import { Poll } from "../models/poll.model";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

// 📝 CREATE POLL: Crear nueva encuesta
export const createPoll = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    // 1️⃣ Verificar autenticación
    if (!req.user) {
      res.status(401).json({
        error: "Access denied",
        message: "Authentication required",
      });
      return;
    }

    const { title, description, options, endDate } = req.body;

    // 2️⃣ Validar campos requeridos
    if (!title || !options || !Array.isArray(options)) {
      res.status(400).json({
        error: "Validation error",
        message: "Title and options are required",
      });
      return;
    }

    // 3️⃣ Validar que haya al menos 2 opciones
    if (options.length < 2) {
      res.status(400).json({
        error: "Validation error",
        message: "Poll must have at least 2 options",
      });
      return;
    }

    // 4️⃣ Formatear opciones (texto y votos en 0)
    const formattedOptions = options.map((option: any) => ({
      text: typeof option === "string" ? option : option.text,
      votes: 0,
    }));

    // 5️⃣ Crear la encuesta
    const newPoll = await Poll.create({
      title,
      description,
      options: formattedOptions,
      creator: req.user.userId,
      status: "active",
      startDate: new Date(),
      endDate: endDate ? new Date(endDate) : undefined,
      totalVotes: 0,
    });

    // 6️⃣ Popular el creator para la respuesta
    await newPoll.populate("creator", "username email");

    // 7️⃣ Responder con la encuesta creada
    res.status(201).json({
      message: "Poll created successfully",
      poll: newPoll,
    });
  } catch (error) {
    console.error("Create poll error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Error creating poll",
    });
  }
};

// 📋 GET ALL POLLS: Listar todas las encuestas
export const getAllPolls = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    // 1️⃣ Construir filtros
    const filter: any = {};

    if (status && (status === "active" || status === "closed")) {
      filter.status = status;
    }

    // 2️⃣ Calcular paginación
    const skip = (Number(page) - 1) * Number(limit);

    // 3️⃣ Buscar encuestas con paginación
    const polls = await Poll.find(filter)
      .populate("creator", "username email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    // 4️⃣ Contar total de encuestas
    const total = await Poll.countDocuments(filter);

    // 5️⃣ Responder con encuestas y metadatos
    res.status(200).json({
      message: "Polls retrieved successfully",
      polls,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Get all polls error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Error retrieving polls",
    });
  }
};

// 🔍 GET POLL BY ID: Obtener una encuesta específica
export const getPollById = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    // 1️⃣ Validar que el ID sea válido
    if (!id) {
      res.status(400).json({
        error: "Validation error",
        message: "Poll ID is required",
      });
      return;
    }

    // 2️⃣ Buscar la encuesta
    const poll = await Poll.findById(id).populate("creator", "username email");

    if (!poll) {
      res.status(404).json({
        error: "Not found",
        message: "Poll not found",
      });
      return;
    }

    // 3️⃣ Responder con la encuesta
    res.status(200).json({
      message: "Poll retrieved successfully",
      poll,
    });
  } catch (error) {
    console.error("Get poll by ID error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Error retrieving poll",
    });
  }
};

// ✏️ UPDATE POLL: Actualizar encuesta (solo owner o admin)
export const updatePoll = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    // 1️⃣ Verificar autenticación
    if (!req.user) {
      res.status(401).json({
        error: "Access denied",
        message: "Authentication required",
      });
      return;
    }

    const { id } = req.params;
    const { title, description, status, endDate } = req.body;

    // 2️⃣ Buscar la encuesta
    const poll = await Poll.findById(id);

    if (!poll) {
      res.status(404).json({
        error: "Not found",
        message: "Poll not found",
      });
      return;
    }

    // 3️⃣ Verificar ownership (owner o admin)
    const isOwner = poll.creator.toString() === req.user.userId;
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      res.status(403).json({
        error: "Forbidden",
        message: "You don't have permission to update this poll",
      });
      return;
    }

    // 4️⃣ Actualizar solo los campos permitidos
    if (title) poll.title = title;
    if (description !== undefined) poll.description = description;
    if (status && (status === "active" || status === "closed")) {
      poll.status = status;
    }
    if (endDate) poll.endDate = new Date(endDate);

    // 5️⃣ Guardar cambios
    await poll.save();
    await poll.populate("creator", "username email");

    // 6️⃣ Responder con la encuesta actualizada
    res.status(200).json({
      message: "Poll updated successfully",
      poll,
    });
  } catch (error) {
    console.error("Update poll error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Error updating poll",
    });
  }
};

// 🗑️ DELETE POLL: Eliminar encuesta (solo owner o admin)
export const deletePoll = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    // 1️⃣ Verificar autenticación
    if (!req.user) {
      res.status(401).json({
        error: "Access denied",
        message: "Authentication required",
      });
      return;
    }

    const { id } = req.params;

    // 2️⃣ Buscar la encuesta
    const poll = await Poll.findById(id);

    if (!poll) {
      res.status(404).json({
        error: "Not found",
        message: "Poll not found",
      });
      return;
    }

    // 3️⃣ Verificar ownership (owner o admin)
    const isOwner = poll.creator.toString() === req.user.userId;
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      res.status(403).json({
        error: "Forbidden",
        message: "You don't have permission to delete this poll",
      });
      return;
    }

    // 4️⃣ Eliminar la encuesta
    await Poll.findByIdAndDelete(id);

    // 5️⃣ Responder con confirmación
    res.status(200).json({
      message: "Poll deleted successfully",
      deletedPoll: {
        id: poll._id,
        title: poll.title,
      },
    });
  } catch (error) {
    console.error("Delete poll error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Error deleting poll",
    });
  }
};
