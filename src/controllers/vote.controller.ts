import { Response } from "express";
import { Poll } from "../models/poll.model";
import { Vote } from "../models/vote.model";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

export const castVote = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        error: "Access denied",
        message: "Authentication required to vote",
      });
      return;
    }

    const { pollId, selectedOption } = req.body;

    if (!pollId || !selectedOption) {
      res.status(400).json({
        error: "Validation error",
        message: "Poll ID and selected option are required",
      });
      return;
    }

    const poll = await Poll.findById(pollId);

    if (!poll) {
      res.status(404).json({
        error: "Not found",
        message: "Poll not found",
      });
      return;
    }

    if (poll.status !== "active") {
      res.status(400).json({
        error: "Poll closed",
        message: "This poll is no longer accepting votes",
      });
      return;
    }

    if (poll.endDate && new Date() > poll.endDate) {
      res.status(400).json({
        error: "Poll expired",
        message: "This poll has expired",
      });
      return;
    }

    const optionExists = poll.options.some(
      (opt) => opt.text === selectedOption
    );

    if (!optionExists) {
      res.status(400).json({
        error: "Invalid option",
        message: "Selected option does not exist in this poll",
      });
      return;
    }

    const existingVote = await Vote.findOne({
      user: req.user.userId,
      poll: pollId,
    });

    if (existingVote) {
      res.status(409).json({
        error: "Already voted",
        message: "You have already voted in this poll",
      });
      return;
    }

    const newVote = await Vote.create({
      user: req.user.userId,
      poll: pollId,
      selectedOption,
    });

    const optionIndex = poll.options.findIndex(
      (opt) => opt.text === selectedOption
    );
    poll.options[optionIndex].votes += 1;
    poll.totalVotes += 1;
    await poll.save();

    res.status(201).json({
      message: "Vote cast successfully",
      vote: {
        id: newVote._id,
        pollId: poll._id,
        pollTitle: poll.title,
        selectedOption: newVote.selectedOption,
        votedAt: newVote.votedAt,
      },
    });
  } catch (error) {
    console.error("Cast vote error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Error casting vote",
    });
  }
};

export const getResults = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { pollId } = req.params;

    const poll = await Poll.findById(pollId).populate(
      "creator",
      "username email"
    );

    if (!poll) {
      res.status(404).json({
        error: "Not found",
        message: "Poll not found",
      });
      return;
    }

    const resultsWithPercentage = poll.options.map((option) => ({
      text: option.text,
      votes: option.votes,
      percentage:
        poll.totalVotes > 0
          ? ((option.votes / poll.totalVotes) * 100).toFixed(2)
          : "0.00",
    }));

    let userVote = null;
    if (req.user) {
      const vote = await Vote.findOne({
        user: req.user.userId,
        poll: pollId,
      });
      if (vote) {
        userVote = vote.selectedOption;
      }
    }

    res.status(200).json({
      message: "Poll results retrieved successfully",
      poll: {
        id: poll._id,
        title: poll.title,
        description: poll.description,
        status: poll.status,
        totalVotes: poll.totalVotes,
        results: resultsWithPercentage,
        userVote,
        creator: poll.creator,
        createdAt: poll.createdAt,
        endDate: poll.endDate,
      },
    });
  } catch (error) {
    console.error("Get results error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Error retrieving results",
    });
  }
};

export const getUserVotes = async (
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

    const votes = await Vote.find({ user: req.user.userId })
      .populate("poll", "title description status totalVotes")
      .sort({ votedAt: -1 });

    const votesHistory = votes.map((vote) => ({
      id: vote._id,
      pollId: vote.poll,
      selectedOption: vote.selectedOption,
      votedAt: vote.votedAt,
    }));

    res.status(200).json({
      message: "User votes retrieved successfully",
      totalVotes: votes.length,
      votes: votesHistory,
    });
  } catch (error) {
    console.error("Get user votes error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Error retrieving user votes",
    });
  }
};
