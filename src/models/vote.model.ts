import mongoose, { Document, Schema } from "mongoose";

export interface IVote extends Document {
  user: mongoose.Types.ObjectId;
  poll: mongoose.Types.ObjectId;
  selectedOption: string;
  votedAt: Date;
}

const voteSchema = new Schema<IVote>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    poll: {
      type: Schema.Types.ObjectId,
      ref: "Poll",
      required: [true, "Poll is required"],
    },
    selectedOption: {
      type: String,
      required: [true, "Selected option is required"],
      trim: true,
    },
    votedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

voteSchema.index({ user: 1, poll: 1 }, { unique: true });
voteSchema.index({ poll: 1 });
voteSchema.index({ user: 1 });
voteSchema.index({ votedAt: 1 });

export const Vote = mongoose.model<IVote>("Vote", voteSchema);
