/**
 * Production Environment Test Script
 * Tests backend configuration before deployment
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { MONGODB_URI, JWT_SECRET, CLOUDINARY_CONFIG, FRONTEND_URL, KEEP_ALIVE_ENABLED, KEEP_ALIVE_URL } from './src/lib/config.js';

dotenv.config();

console.log('🧪 Testing Production Configuration...\n');

let hasErrors = false;

// Test 1: Environment Variables
console.log('📋 Checking Environment Variables:');
const requiredVars = {
  'NODE_ENV': process.env.NODE_ENV,
  'PORT': process.env.PORT,
  'MONGODB_URI': MONGODB_URI,
  'JWT_SECRET': JWT_SECRET,
  'CLOUDINARY_CLOUD_NAME': CLOUDINARY_CONFIG.cloud_name,
  'CLOUDINARY_API_KEY': CLOUDINARY_CONFIG.api_key,
  'CLOUDINARY_API_SECRET': CLOUDINARY_CONFIG.api_secret,
  'FRONTEND_URL': FRONTEND_URL,
};

for (const [key, value] of Object.entries(requiredVars)) {
  if (!value || value === 'undefined') {
    console.log(`   ❌ ${key}: Missing or undefined`);
    hasErrors = true;
  } else {
    // Mask sensitive values
    const displayValue = ['JWT_SECRET', 'CLOUDINARY_API_SECRET', 'MONGODB_URI'].includes(key)
      ? '***' + value.slice(-4)
      : value;
    console.log(`   ✅ ${key}: ${displayValue}`);
  }
}

// Test 2: Keep-Alive Configuration
console.log('\n🔄 Checking Keep-Alive Configuration:');
console.log(`   KEEP_ALIVE_ENABLED: ${KEEP_ALIVE_ENABLED ? '✅ Enabled' : '⚠️  Disabled'}`);
if (KEEP_ALIVE_ENABLED) {
  if (!KEEP_ALIVE_URL) {
    console.log(`   ❌ KEEP_ALIVE_URL: Not configured`);
    hasErrors = true;
  } else {
    console.log(`   ✅ KEEP_ALIVE_URL: ${KEEP_ALIVE_URL}`);
  }
}

// Test 3: Database Connection
console.log('\n🗄️  Testing Database Connection:');
try {
  await mongoose.connect(MONGODB_URI);
  console.log('   ✅ Database connection successful');
  console.log(`   📊 Database: ${mongoose.connection.name}`);
  console.log(`   🌐 Host: ${mongoose.connection.host}`);
  await mongoose.disconnect();
} catch (error) {
  console.log('   ❌ Database connection failed:', error.message);
  hasErrors = true;
}

// Test 4: JWT Secret Strength
console.log('\n🔐 Checking JWT Secret:');
if (JWT_SECRET.length < 32) {
  console.log('   ⚠️  JWT_SECRET is too short (recommended: 64+ characters)');
  hasErrors = true;
} else {
  console.log(`   ✅ JWT_SECRET length: ${JWT_SECRET.length} characters`);
}

// Test 5: CORS Configuration
console.log('\n🌐 Checking CORS Configuration:');
if (FRONTEND_URL.includes('localhost')) {
  console.log('   ⚠️  FRONTEND_URL is set to localhost (update for production)');
  if (process.env.NODE_ENV === 'production') {
    hasErrors = true;
  }
} else {
  console.log(`   ✅ FRONTEND_URL: ${FRONTEND_URL}`);
}

// Test 6: Production Readiness
console.log('\n🚀 Production Readiness:');
if (process.env.NODE_ENV === 'production') {
  console.log('   ✅ NODE_ENV is set to production');
  
  // Check for development-only settings
  if (FRONTEND_URL.includes('localhost')) {
    console.log('   ❌ FRONTEND_URL still points to localhost');
    hasErrors = true;
  }
  
  if (!KEEP_ALIVE_ENABLED) {
    console.log('   ⚠️  Keep-alive is disabled (recommended for Render free tier)');
  }
} else {
  console.log('   ℹ️  NODE_ENV is set to:', process.env.NODE_ENV);
}

// Final Summary
console.log('\n' + '='.repeat(50));
if (hasErrors) {
  console.log('❌ Configuration has errors! Please fix them before deployment.');
  console.log('📖 See DEPLOYMENT-GUIDE.md for help');
  process.exit(1);
} else {
  console.log('✅ All checks passed! Ready for deployment.');
  console.log('📖 Follow DEPLOYMENT-GUIDE.md for deployment steps');
  process.exit(0);
}
