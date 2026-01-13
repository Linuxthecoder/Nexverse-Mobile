#!/usr/bin/env node

// MongoDB Atlas Setup Helper
// This script provides instructions for setting up MongoDB Atlas

console.log("🚀 MongoDB Atlas Setup Guide");
console.log("===============================");
console.log("");

console.log("📝 Step 1: Create MongoDB Atlas Account");
console.log("   • Go to: https://www.mongodb.com/atlas");
console.log("   • Click 'Try Free' or 'Sign Up'");
console.log("   • Create account with email/password");
console.log("");

console.log("🏗️  Step 2: Create a Cluster");
console.log("   • Choose 'Create a Deployment'");
console.log("   • Select 'M0 Sandbox' (FREE)");
console.log("   • Choose AWS/Google Cloud/Azure");
console.log("   • Pick closest region to you");
console.log("   • Click 'Create Deployment'");
console.log("");

console.log("🔐 Step 3: Create Database User");
console.log("   • Create username and password");
console.log("   • Save these credentials safely!");
console.log("   • Click 'Create User'");
console.log("");

console.log("🌐 Step 4: Configure Network Access");
console.log("   • Add IP Address");
console.log("   • For development: Add '0.0.0.0/0' (allows all IPs)");
console.log("   • For production: Add specific IP addresses");
console.log("   • Click 'Confirm'");
console.log("");

console.log("🔗 Step 5: Get Connection String");
console.log("   • Click 'Connect' on your cluster");
console.log("   • Choose 'Connect your application'");
console.log("   • Copy the connection string");
console.log("   • It looks like: mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/");
console.log("");

console.log("⚙️  Step 6: Update Environment");
console.log("   • Edit backend/.env file");
console.log("   • Replace MONGODB_URI with your Atlas connection string");
console.log("   • Add '/nexverse' at the end for database name");
console.log("   • Example: mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/nexverse");
console.log("");

console.log("✅ Step 7: Test Connection");
console.log("   • Restart your backend server");
console.log("   • You should see 'MongoDB Connected' message");
console.log("");

console.log("💡 Alternative: Local MongoDB Installation");
console.log("   • Download from: https://www.mongodb.com/try/download/community");
console.log("   • Run installer with default settings");
console.log("   • Start MongoDB service");
console.log("   • Keep default MONGODB_URI in .env");
console.log("");