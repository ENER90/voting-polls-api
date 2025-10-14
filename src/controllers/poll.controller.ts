import { Response } from "express";
import { Poll } from "../models/poll.model";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

export const createPoll = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        error: "Access denied",
        message: "Authentication required",
      });
      return;
    }

    const { title, description, options, endDate } = req.body;

    if (!title || !options || !Array.isArray(options)) {
      res.status(400).json({
        error: "Validation error",
        message: "Title and options are required",
      });
      return;
    }

    if (options.length < 2) {
      res.status(400).json({
        error: "Validation error",
        message: "Poll must have at least 2 options",
      });
      return;
    }

    const formattedOptions = options.map((option: any) => ({
      text: typeof option === "string" ? option : option.text,
      votes: 0,
    }));

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

    await newPoll.populate("creator", "username email");

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

export const getAllPolls = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const filter: any = {};

    if (status && (status === "active" || status === "closed")) {
      filter.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const polls = await Poll.find(filter)
      .populate("creator", "username email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Poll.countDocuments(filter);

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

export const getPollById = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        error: "Validation error",
        message: "Poll ID is required",
      });
      return;
    }

    const poll = await Poll.findById(id).populate("creator", "username email");

    if (!poll) {
      res.status(404).json({
        error: "Not found",
        message: "Poll not found",
      });
      return;
    }

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

export const updatePoll = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        error: "Access denied",
        message: "Authentication required",
      });
      return;
    }

    const { id } = req.params;
    const { title, description, status, endDate } = req.body;

    const poll = await Poll.findById(id);

    if (!poll) {
      res.status(404).json({
        error: "Not found",
        message: "Poll not found",
      });
      return;
    }

    const isOwner = poll.creator.toString() === req.user.userId;
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      res.status(403).json({
        error: "Forbidden",
        message: "You don't have permission to update this poll",
      });
      return;
    }

    if (title) poll.title = title;
    if (description !== undefined) poll.description = description;
    if (status && (status === "active" || status === "closed")) {
      poll.status = status;
    }
    if (endDate) poll.endDate = new Date(endDate);

    await poll.save();
    await poll.populate("creator", "username email");

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

export const deletePoll = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        error: "Access denied",
        message: "Authentication required",
      });
      return;
    }

    const { id } = req.params;

    const poll = await Poll.findById(id);

    if (!poll) {
      res.status(404).json({
        error: "Not found",
        message: "Poll not found",
      });
      return;
    }

    const isOwner = poll.creator.toString() === req.user.userId;
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      res.status(403).json({
        error: "Forbidden",
        message: "You don't have permission to delete this poll",
      });
      return;
    }

    await Poll.findByIdAndDelete(id);

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
