import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import "express-async-errors";
import helmet from "helmet";
import morgan from "morgan";
import { RateLimiterMemory } from "rate-limiter-flexible";

import path from "path";

import { connectDB } from "./lib/db.js";
import { PORT, FRONTEND_URL, JWT_SECRET, maskURL, APP_CODENAME, NODE_ENV, KEEP_ALIVE_ENABLED, KEEP_ALIVE_URL, KEEP_ALIVE_INTERVAL, EXPO_DEV_URL } from "./lib/config.js";
import { securityMiddleware, httpsRedirect, additionalSecurityHeaders } from "./middleware/security.middleware.js";
import { displayStartupBanner } from "./lib/terminalLogger.js";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import activityRoutes from "./routes/activity.route.js";
import notificationRoutes from "./routes/notification.routes.js";
import healthRoutes from "./routes/health.route.js";
import { app, server } from "./lib/socket.js";
import { startKeepAlive } from "./services/keepAlive.service.js";

dotenv.config();
const __dirname = path.resolve();

// Apply HTTPS redirect only in production
if (process.env.NODE_ENV === 'production') {
  app.use(httpsRedirect);
}

// Apply enhanced security headers
app.use(securityMiddleware());
app.use(additionalSecurityHeaders);

app.use(express.json({ limit: '10mb' })); // Increased limit for file uploads
app.use(cookieParser());
app.use(morgan("dev"));

// CORS configuration - Enhanced for cross-domain deployment
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      // In development, allow all origins for easier testing
      if (process.env.NODE_ENV === 'development') {
        return callback(null, true);
      }

      // Check if origin is allowed
      const allowedOrigins = [
        FRONTEND_URL,
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:8081',           // Expo dev server
        'http://192.168.29.109:8081',      // Your Expo server IP
        'exp://192.168.29.109:8081',       // Expo protocol
        'http://10.0.2.2:8081',            // Android emulator
        'http://192.168.29.109:5001',      // Physical device API
        EXPO_DEV_URL,
      ];

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With'],
    exposedHeaders: ['Set-Cookie'],
    preflightContinue: false,
    optionsSuccessStatus: 204
  })
);

// Rate limiter: 1000 requests per 15 minutes per IP (increased for better user experience)
const rateLimiter = new RateLimiterMemory({
  points: 1000,
  duration: 900, // 15 minutes
});

// Stricter rate limiter for auth routes (prevent brute force)
const authRateLimiter = new RateLimiterMemory({
  points: 50, // 50 attempts (increased from 10)
  duration: 900, // 15 minutes
});

app.use(async (req, res, next) => {
  try {
    // Apply stricter rate limiting to auth routes
    if (req.path.startsWith('/api/auth/')) {
      await authRateLimiter.consume(req.ip);
    } else {
      await rateLimiter.consume(req.ip);
    }
    next();
  } catch (err) {
    // Ensure CORS headers are present even when rate limited
    res.header('Access-Control-Allow-Origin', FRONTEND_URL);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.status(429).json({ message: "Too many requests. Please try again later." });
  }
});

// Health check routes (no /api prefix for easier monitoring)
app.use("/", healthRoutes);

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/notifications", notificationRoutes);

if (process.env.NODE_ENV === "production") {
  console.log("🔒 Production mode: Enhanced security enabled");

  // Serve static files from the frontend build
  app.use(express.static(path.join(__dirname, "../frontend/dist"), {
    setHeaders: (res, path) => {
      // Set security headers for static files
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year cache for static assets
      if (path.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript');
      }
    }
  }));

  // For any route not handled by your API, serve index.html
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

// 404 handler for unknown routes
app.use((req, res, next) => {
  res.status(404).json({ message: "Resource not found" });
});

// Centralized error handler
app.use((err, req, res, next) => {
  let status = err.status || 500;
  let message = err.message || "Internal Server Error";

  // User-friendly error messages
  if (status === 400) {
    message =
      message === "Invalid user ID. Please select a valid chat."
        ? "The selected chat could not be found. Please try another."
        : message.includes("validation") || message.includes("Validation")
          ? "Some information you entered is invalid. Please check and try again."
          : message;
  } else if (status === 401) {
    message = "You are not authorized. Please log in.";
  } else if (status === 403) {
    message = "You do not have permission to do this.";
  } else if (status === 404) {
    message = "The resource you are looking for was not found.";
  } else if (status === 409) {
    message = "This email is already registered. Please log in or use another email.";
  } else if (status === 429) {
    message = "You are sending requests too quickly. Please slow down.";
  } else if (status >= 500) {
    message = "Something went wrong on our end. Please try again later.";
  }

  // Only include stack trace in development and for internal server errors
  const response = {
    message,
    ...(process.env.NODE_ENV === "development" && status >= 500 && { error: err.stack })
  };

  res.status(status).json(response);
});

// Start server with beautiful colored terminal output
const startServer = async () => {
  server.listen(PORT, '0.0.0.0', async () => {
    // Connect to database first
    await connectDB();

    // Extract database host from MongoDB URI for display
    let databaseHost = '';
    try {
      const mongoUri = process.env.MONGODB_URI || '';
      const hostMatch = mongoUri.match(/@([^/]+)/);
      if (hostMatch) {
        databaseHost = hostMatch[1];
      }
    } catch (err) {
      // Ignore parsing errors
    }

    // Display beautiful startup banner
    displayStartupBanner({
      codename: APP_CODENAME,
      environment: NODE_ENV === 'production' ? 'Production' : 'Development',
      port: PORT,
      frontendUrl: maskURL(FRONTEND_URL),
      keepAliveEnabled: KEEP_ALIVE_ENABLED,
      keepAliveUrl: KEEP_ALIVE_URL,
      keepAliveInterval: Math.round(KEEP_ALIVE_INTERVAL / 60000), // Convert to minutes
      databaseHost: databaseHost,
      jwtLoaded: !!JWT_SECRET
    });

    // Start keep-alive service after server is running
    startKeepAlive();
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\x1b[31m\x1b[1m❌ Port ${PORT} is already in use!\x1b[0m`);
      console.log('\x1b[33m💡 Solutions:\x1b[0m');
      console.log('   1. Kill the process using this port');
      console.log('   2. Change the PORT in your .env file');
      console.log('   3. Run: npx kill-port 5001');
      process.exit(1);
    } else {
      console.error('\x1b[31m\x1b[1m❌ Server error:\x1b[0m', err);
      process.exit(1);
    }
  });
};

startServer();
