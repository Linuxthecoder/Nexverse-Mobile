import mongoose from "mongoose";

// Simple development database setup
// This will use an in-memory database for development if MongoDB is not available
const setupDevelopmentDB = async () => {
  console.log("🔧 Setting up development database...");
  
  // First try to connect to local MongoDB
  try {
    await mongoose.connect('mongodb://localhost:27017/nexverse', {
      serverSelectionTimeoutMS: 3000, // Timeout after 3s instead of 30s
    });
    console.log("✅ Connected to local MongoDB");
    return true;
  } catch (error) {
    console.log("⚠️  Local MongoDB not available, suggestions:");
    console.log("   1. Install MongoDB Community Server");
    console.log("   2. Use MongoDB Atlas (free cloud database)");
    console.log("   3. Or run: npm run setup-db");
    console.log("");
    console.log("🔗 Quick setup with MongoDB Atlas:");
    console.log("   1. Go to https://www.mongodb.com/atlas");
    console.log("   2. Create a free account");
    console.log("   3. Create a cluster");
    console.log("   4. Get connection string");
    console.log("   5. Update MONGODB_URI in .env file");
    console.log("");
    return false;
  }
};

export { setupDevelopmentDB };