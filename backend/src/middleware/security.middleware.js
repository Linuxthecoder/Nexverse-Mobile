// Enhanced security middleware for production deployment
import helmet from 'helmet';

export const securityMiddleware = () => {
  return helmet({
    // Disable CSP in production to avoid blocking cross-origin requests
    // Re-enable with proper configuration after testing
    contentSecurityPolicy: false,
    
    // HTTP Strict Transport Security
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: false // Set to false initially to avoid issues
    },
    
    // Hide X-Powered-By header
    hidePoweredBy: true,
    
    // Prevent clickjacking
    frameguard: { action: 'deny' },
    
    // Prevent MIME type sniffing
    noSniff: true,
    
    // XSS Protection
    xssFilter: true,
    
    // Referrer Policy
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    
    // Disable Cross-Origin-Embedder-Policy to avoid issues with external resources
    crossOriginEmbedderPolicy: false,
    
    // Permissions Policy (formerly Feature Policy)
    permissionsPolicy: {
      features: {
        camera: ['self'],
        microphone: ['self'],
        geolocation: ['none'],
        payment: ['none']
      }
    }
  });
};

// Force HTTPS in production
export const httpsRedirect = (req, res, next) => {
  // Check if request is coming through HTTPS
  const proto = req.header('x-forwarded-proto') || req.protocol;
  
  if (process.env.NODE_ENV === 'production' && proto !== 'https') {
    return res.redirect(301, `https://${req.get('Host')}${req.url}`);
  }
  
  next();
};

// Additional security headers
export const additionalSecurityHeaders = (req, res, next) => {
  // Prevent browsers from guessing MIME types
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Prevent page from being embedded in frames
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Enable XSS filtering
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Control referrer information
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Disable DNS prefetching
  res.setHeader('X-DNS-Prefetch-Control', 'off');
  
  next();
};