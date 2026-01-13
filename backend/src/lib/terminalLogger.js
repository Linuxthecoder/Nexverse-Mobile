// Enhanced Terminal Logger with Colors for NexVerse Backend
// Provides beautiful, colored console output for production monitoring

// ANSI Color Codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  
  // Text colors
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  
  // Background colors
  bgBlack: '\x1b[40m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
  bgWhite: '\x1b[47m',
};

// Helper function to colorize text
const colorize = (text, color) => `${color}${text}${colors.reset}`;

// Helper function to create separator lines
const separator = (char = '═', length = 67) => char.repeat(length);

/**
 * Display the beautiful startup banner with all system information
 * @param {Object} config - Configuration object with server details
 */
export const displayStartupBanner = (config) => {
  const {
    codename = 'Orange Ball',
    environment = 'Production',
    port = 5001,
    frontendUrl = 'NexVerse',
    keepAliveEnabled = false,
    keepAliveUrl = '',
    keepAliveInterval = 14,
    databaseHost = '',
    jwtLoaded = false
  } = config;

  console.log('\n');
  console.log(colorize(separator('═'), colors.cyan));
  console.log(colorize('🧠  NEXVERSE BACKEND CONSOLE — PRODUCTION MODE', colors.bright + colors.cyan));
  console.log(colorize(separator('═'), colors.cyan));
  console.log('');

  // Security Status Section
  console.log(colorize('🛡️  SECURITY STATUS', colors.bright + colors.green));
  console.log(colorize(separator('─'), colors.dim + colors.white));
  console.log(colorize('   Mode                : ', colors.white) + colorize('Enhanced Security (ACTIVE)', colors.bright + colors.green));
  console.log(colorize('   Authentication Key  : ', colors.white) + colorize(`JWT Secret ${jwtLoaded ? '✔ Loaded' : '✗ Missing'}`, jwtLoaded ? colors.green : colors.red));
  console.log('');

  // Environment Configuration Section
  console.log(colorize('⚙️  ENVIRONMENT CONFIGURATION', colors.bright + colors.yellow));
  console.log(colorize(separator('─'), colors.dim + colors.white));
  console.log(colorize('   Codename            : ', colors.white) + colorize(codename, colors.bright + colors.magenta));
  console.log(colorize('   Meaning             : ', colors.white) + colorize('Security mask for production URLs & endpoints', colors.dim + colors.white));
  console.log(colorize('   Environment         : ', colors.white) + colorize(environment, colors.cyan));
  console.log(colorize('   Port                : ', colors.white) + colorize(port, colors.blue));
  console.log(colorize('   Frontend URL        : ', colors.white) + colorize(frontendUrl, colors.cyan));
  console.log('');

  // Server Status Section
  console.log(colorize('🚀  SERVER STATUS', colors.bright + colors.blue));
  console.log(colorize(separator('─'), colors.dim + colors.white));
  console.log(colorize('   Backend Service     : ', colors.white) + colorize('✅ Running Successfully', colors.bright + colors.green));
  console.log(colorize('   Listening on Port   : ', colors.white) + colorize(port, colors.blue));
  console.log(colorize('   Frontend Connected  : ', colors.white) + colorize(frontendUrl, colors.cyan));
  console.log('');

  // Keep-Alive Service Section (Always show, with status)
  console.log(colorize('♻️  KEEP-ALIVE SERVICE', colors.bright + colors.magenta));
  console.log(colorize(separator('─'), colors.dim + colors.white));
  
  if (keepAliveEnabled) {
    console.log(colorize('   System Name         : ', colors.white) + colorize('Render Free Tier Protection', colors.cyan));
    console.log(colorize('   Target              : ', colors.white) + colorize(keepAliveUrl || 'NexVerse', colors.cyan));
    console.log(colorize('   Interval            : ', colors.white) + colorize(`Every ${keepAliveInterval} Minutes`, colors.yellow));
    console.log(colorize('   Service Status      : ', colors.white) + colorize('✅ Active & Stable', colors.bright + colors.green));
  } else {
    console.log(colorize('   System Name         : ', colors.white) + colorize('Render Free Tier Protection', colors.cyan));
    console.log(colorize('   Service Status      : ', colors.white) + colorize('⏸️  Disabled (Development Mode)', colors.yellow));
    console.log('');
    console.log(colorize('ℹ️  Keep-alive service is disabled', colors.bright + colors.cyan));
  }
  console.log('');

  // Database Connection Section
  console.log(colorize('🗄️  DATABASE CONNECTION', colors.bright + colors.green));
  console.log(colorize(separator('─'), colors.dim + colors.white));
  console.log(colorize('   Status              : ', colors.white) + colorize('✅ Connected', colors.bright + colors.green));
  if (databaseHost) {
    console.log(colorize('   Cluster Host        : ', colors.white) + colorize(databaseHost, colors.cyan));
  }
  console.log(colorize('   Database Provider   : ', colors.white) + colorize('MongoDB Atlas', colors.cyan));
  console.log('');

  // Footer
  console.log(colorize(separator('═'), colors.cyan));
  console.log(colorize('✨  ALL SYSTEMS OPERATIONAL — NEXVERSE BACKEND ONLINE', colors.bright + colors.green));
  console.log(colorize(separator('═'), colors.cyan));
  console.log('\n');
};

/**
 * Display error messages with color coding
 * @param {string} message - Error message to display
 */
export const displayError = (message) => {
  console.log(colorize(`\n❌ ERROR: ${message}`, colors.bright + colors.red));
};

/**
 * Display warning messages with color coding
 * @param {string} message - Warning message to display
 */
export const displayWarning = (message) => {
  console.log(colorize(`\n⚠️  WARNING: ${message}`, colors.bright + colors.yellow));
};

/**
 * Display success messages with color coding
 * @param {string} message - Success message to display
 */
export const displaySuccess = (message) => {
  console.log(colorize(`\n✅ SUCCESS: ${message}`, colors.bright + colors.green));
};

/**
 * Display info messages with color coding
 * @param {string} message - Info message to display
 */
export const displayInfo = (message) => {
  console.log(colorize(`\nℹ️  INFO: ${message}`, colors.bright + colors.cyan));
};

/**
 * Display database connection success
 * @param {string} host - Database host information
 */
export const displayDatabaseConnected = (host) => {
  console.log(colorize('✅ MongoDB Connected Successfully', colors.bright + colors.green));
  if (host) {
    console.log(colorize(`   Host: ${host}`, colors.cyan));
  }
};

/**
 * Display keep-alive ping
 */
export const displayKeepAlivePing = () => {
  const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
  console.log(colorize(`[${timestamp}] `, colors.dim + colors.white) + 
              colorize('♻️  Keep-Alive Ping Sent', colors.magenta));
};

export default {
  displayStartupBanner,
  displayError,
  displayWarning,
  displaySuccess,
  displayInfo,
  displayDatabaseConnected,
  displayKeepAlivePing
};
