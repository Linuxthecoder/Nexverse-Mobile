import mongoose from "mongoose";
import { MONGODB_URI } from "./config.js";

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      maxPoolSize: 10, // Maintain up to 10 socket connections
      heartbeatFrequencyMS: 30000, // Send a ping every 30 seconds
      socketTimeoutMS: 45000, // Close connections after 45 seconds of inactivity
    });
    // Success message is now handled by the startup banner
    // console.log(`${colors.bright}${colors.green}✅ MongoDB Connected: ${conn.connection.host}${colors.reset}`);
  } catch (error) {
    console.error(`${colors.bright}${colors.red}❌ MongoDB Connection Error: ${error.message}${colors.reset}`);
    console.log("");
    console.log(`${colors.bright}${colors.yellow}🔧 Quick Solutions:${colors.reset}`);
    console.log("   1. Install MongoDB Community Server");
    console.log("   2. Use MongoDB Atlas (free cloud database)");
    console.log("   3. Check if MongoDB service is running");
    console.log("");
    console.log(`${colors.bright}${colors.cyan}🔗 MongoDB Atlas Setup (Recommended):${colors.reset}`);
    console.log("   • Go to https://www.mongodb.com/atlas");
    console.log("   • Create free account → Create cluster");
    console.log("   • Get connection string → Update .env file");
    console.log("");
    
    // Don't exit in development, let the app run without DB for debugging
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    } else {
      console.log(`${colors.bright}${colors.yellow}⚠️  Running in development mode without database${colors.reset}`);
      console.log("   API endpoints requiring database will fail");
    }
  }
};