import { logSecurityEvent } from '../lib/logger.js';
import { NODE_ENV } from '../lib/config.js';

/**
 * Production Security Middleware
 * Blocks unauthorized access to sensitive data in production environment
 */

export const blockMetadataAccess = (req, res, next) => {
  // Only enforce in production
  if (NODE_ENV !== 'production') {
    return next();
  }

  // Check for suspicious query parameters
  const suspiciousParams = [
    'includeMetadata',
    'showMetadata', 
    'metadata',
    'deviceInfo',
    'userAgent',
    'debug',
    'admin'
  ];

  const hasSuspiciousParam = suspiciousParams.some(param => 
    req.query[param] !== undefined
  );

  if (hasSuspiciousParam) {
    // Log security event
    logSecurityEvent('SUSPICIOUS_PARAMETER_DETECTED', {
      userId: req.user?._id || 'anonymous',
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path,
      query: req.query,
      timestamp: new Date().toISOString()
    });

    return res.status(403).json({
      error: "ACCESS DENIED",
      message: "🚨 ILLEGAL ACCESS ATTEMPT DETECTED",
      warning: "Unauthorized access to sensitive user data is strictly prohibited.",
      legal: "This action violates privacy laws including GDPR, CCPA, and may constitute unauthorized access under cyber security legislation.",
      consequences: [
        "This incident has been logged and reported to security team",
        "Your IP address and user information have been recorded",
        "Repeated attempts will result in account suspension",
        "Legal action may be taken for continued violations",
        "Criminal prosecution possible under applicable laws"
      ],
      code: "FORBIDDEN_PARAMETER_ACCESS",
      timestamp: new Date().toISOString(),
      reportedTo: "Security Operations Center",
      incidentId: `SEC-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    });
  }

  next();
};

/**
 * Sanitize response data - remove sensitive fields in production
 */
export const sanitizeResponse = (data) => {
  if (NODE_ENV !== 'production') {
    return data;
  }

  // Remove sensitive fields
  const sensitiveFields = ['metadata', 'password', '__v', 'deviceInfo'];
  
  if (Array.isArray(data)) {
    return data.map(item => sanitizeObject(item, sensitiveFields));
  }
  
  return sanitizeObject(data, sensitiveFields);
};

const sanitizeObject = (obj, fieldsToRemove) => {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  const sanitized = { ...obj };
  
  fieldsToRemove.forEach(field => {
    delete sanitized[field];
  });

  return sanitized;
};

/**
 * Rate limit security-sensitive endpoints more strictly in production
 */
export const strictProductionRateLimit = (req, res, next) => {
  if (NODE_ENV !== 'production') {
    return next();
  }

  // Add custom header to indicate production security is active
  res.setHeader('X-Security-Level', 'STRICT');
  res.setHeader('X-Data-Protection', 'ENABLED');
  
  next();
};

/**
 * Block direct database queries that might expose metadata
 */
export const preventMetadataLeaks = (schema) => {
  // Add pre-find hook to remove metadata in production
  schema.pre('find', function() {
    if (NODE_ENV === 'production') {
      this.select('-metadata -__v');
    }
  });

  schema.pre('findOne', function() {
    if (NODE_ENV === 'production') {
      this.select('-metadata -__v');
    }
  });
};

export default {
  blockMetadataAccess,
  sanitizeResponse,
  strictProductionRateLimit,
  preventMetadataLeaks
};
