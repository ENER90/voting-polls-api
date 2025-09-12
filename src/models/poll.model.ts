import mongoose, { Document, Schema } from "mongoose";

export interface IPollOption {
  text: string;
  votes: number;
}

export interface IPoll extends Document {
  title: string;
  description?: string;
  options: IPollOption[];
  creator: mongoose.Types.ObjectId;
  status: "active" | "closed";
  startDate: Date;
  endDate?: Date;
  totalVotes: number;
  createdAt: Date;
  updatedAt: Date;
}

const pollOptionSchema = new Schema<IPollOption>({
  text: {
    type: String,
    required: [true, "Option text is required"],
    trim: true,
    maxlength: [200, "Option text cannot exceed 200 characters"],
  },
  votes: {
    type: Number,
    default: 0,
    min: [0, "Votes cannot be negative"],
  },
});

const pollSchema = new Schema<IPoll>(
  {
    title: {
      type: String,
      required: [true, "Poll title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    options: {
      type: [pollOptionSchema],
      required: [true, "Poll must have at least 2 options"],
      validate: {
        validator: function (options: IPollOption[]) {
          return options.length >= 2;
        },
        message: "Poll must have at least 2 options",
      },
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Creator is required"],
    },
    status: {
      type: String,
      enum: ["active", "closed"],
      default: "active",
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    totalVotes: {
      type: Number,
      default: 0,
      min: [0, "Total votes cannot be negative"],
    },
  },
  {
    timestamps: true,
  }
);

pollSchema.index({ creator: 1 });
pollSchema.index({ status: 1 });
pollSchema.index({ startDate: 1, endDate: 1 });

export const Poll = mongoose.model<IPoll>("Poll", pollSchema);
