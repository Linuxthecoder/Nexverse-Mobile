import winston from 'winston';
import path from 'path';

// Create logs directory if it doesn't exist
const logDir = 'logs';

// Custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create Winston logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  defaultMeta: { service: 'nexverse-api' },
  transports: [
    // Write all logs to combined.log
    new winston.transports.File({ 
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    
    // Write only error logs to error.log
    new winston.transports.File({ 
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    
    // Write security events to security.log
    new winston.transports.File({ 
      filename: path.join(logDir, 'security.log'),
      level: 'warn',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

// Add console transport for development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Security event logger
export const logSecurityEvent = (event, details = {}) => {
  logger.warn('SECURITY_EVENT', {
    event,
    timestamp: new Date().toISOString(),
    ...details
  });
};

// Authentication event logger
export const logAuthEvent = (event, userId, details = {}) => {
  logger.info('AUTH_EVENT', {
    event,
    userId,
    timestamp: new Date().toISOString(),
    ...details
  });
};

// Rate limit event logger
export const logRateLimitEvent = (ip, route, details = {}) => {
  logSecurityEvent('RATE_LIMIT_EXCEEDED', {
    ip,
    route,
    ...details
  });
};

// Failed login attempt logger
export const logFailedLogin = (email, ip, userAgent) => {
  logSecurityEvent('FAILED_LOGIN', {
    email: email ? email.substring(0, 3) + '***' : 'unknown', // Partially mask email
    ip,
    userAgent
  });
};

// Successful login logger
export const logSuccessfulLogin = (userId, ip, userAgent) => {
  logAuthEvent('SUCCESSFUL_LOGIN', userId, {
    ip,
    userAgent
  });
};

// Export the main logger
export default logger;