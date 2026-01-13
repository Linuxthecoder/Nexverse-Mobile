import https from 'https';
import http from 'http';
import { KEEP_ALIVE_ENABLED, KEEP_ALIVE_URL, KEEP_ALIVE_INTERVAL, maskURL, APP_CODENAME } from '../lib/config.js';

/**
 * Keep-Alive Service
 * Prevents Render free tier from spinning down due to inactivity
 * Pings the server every 14 minutes (before the 15-minute timeout)
 */

let keepAliveInterval = null;

/**
 * Ping the server to keep it alive
 */
const pingServer = () => {
  if (!KEEP_ALIVE_URL) {
    console.log('⚠️  Keep-alive URL not configured');
    return;
  }

  const url = new URL(KEEP_ALIVE_URL);
  const protocol = url.protocol === 'https:' ? https : http;

  const options = {
    hostname: url.hostname,
    port: url.port || (url.protocol === 'https:' ? 443 : 80),
    path: url.pathname,
    method: 'GET',
    timeout: 10000, // 10 second timeout
  };

  const req = protocol.request(options, (res) => {
    const timestamp = new Date().toISOString();
    if (res.statusCode === 200) {
      console.log(`✅ [${timestamp}] ${APP_CODENAME} ping successful - Server is awake`);
    } else {
      console.log(`⚠️  [${timestamp}] ${APP_CODENAME} ping returned status: ${res.statusCode}`);
    }
  });

  req.on('error', (error) => {
    const timestamp = new Date().toISOString();
    console.error(`❌ [${timestamp}] ${APP_CODENAME} ping failed:`, error.message);
  });

  req.on('timeout', () => {
    const timestamp = new Date().toISOString();
    console.error(`⏱️  [${timestamp}] ${APP_CODENAME} ping timed out`);
    req.destroy();
  });

  req.end();
};

/**
 * Start the keep-alive service
 */
export const startKeepAlive = () => {
  if (!KEEP_ALIVE_ENABLED) {
    console.log('ℹ️  Keep-alive service is disabled');
    return;
  }

  if (!KEEP_ALIVE_URL) {
    console.log('⚠️  Keep-alive service enabled but URL not configured');
    return;
  }

  console.log('🔄 Starting keep-alive service...');
  console.log(`   Target: ${maskURL(KEEP_ALIVE_URL)}`);
  console.log(`   Interval: ${KEEP_ALIVE_INTERVAL / 1000 / 60} minutes`);

  // Initial ping after 1 minute
  setTimeout(() => {
    console.log(`🏓 Sending initial ${APP_CODENAME} ping...`);
    pingServer();
  }, 60000);

  // Set up recurring pings
  keepAliveInterval = setInterval(() => {
    pingServer();
  }, KEEP_ALIVE_INTERVAL);

  console.log('✅ Keep-alive service started successfully');
};

/**
 * Stop the keep-alive service
 */
export const stopKeepAlive = () => {
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval);
    keepAliveInterval = null;
    console.log('🛑 Keep-alive service stopped');
  }
};

/**
 * Get keep-alive service status
 */
export const getKeepAliveStatus = () => {
  return {
    enabled: KEEP_ALIVE_ENABLED,
    url: KEEP_ALIVE_URL,
    interval: KEEP_ALIVE_INTERVAL,
    running: keepAliveInterval !== null,
  };
};

// Graceful shutdown
process.on('SIGTERM', stopKeepAlive);
process.on('SIGINT', stopKeepAlive);
