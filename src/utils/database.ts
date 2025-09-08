import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
  try {
    const mongoURI =
      process.env.MONGODB_URI ||
      "mongodb://admin:password123@localhost:27018/voting-polls-db?authSource=admin";

    await mongoose.connect(mongoURI);

    console.log("🍃 MongoDB connected successfully");
    console.log(`📍 Database: ${mongoose.connection.db?.databaseName}`);
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1);
  }
};
