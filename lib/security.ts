import crypto from 'crypto';
import { NextApiRequest } from 'next';

// Security utilities for authentication and data protection

// Generate secure random token
export const generateSecureToken = (length: number = 32): string => {
  return crypto.randomBytes(length).toString('hex');
};

// Hash password with salt (for additional security if needed)
export const hashPassword = async (password: string): Promise<{ hash: string; salt: string }> => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return { hash, salt };
};

// Verify password against hash
export const verifyPassword = async (
  password: string, 
  hash: string, 
  salt: string
): Promise<boolean> => {
  const verifyHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return hash === verifyHash;
};

// Sanitize input to prevent XSS
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove < and > characters
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

// Validate email format
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Check password strength
export const checkPasswordStrength = (password: string): {
  isStrong: boolean;
  score: number;
  feedback: string[];
} => {
  const feedback: string[] = [];
  let score = 0;

  // Length check
  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push('Senha deve ter pelo menos 8 caracteres');
  }

  // Uppercase check
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Adicione pelo menos uma letra maiúscula');
  }

  // Lowercase check
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Adicione pelo menos uma letra minúscula');
  }

  // Number check
  if (/\d/.test(password)) {
    score += 1;
  } else {
    feedback.push('Adicione pelo menos um número');
  }

  // Special character check
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Adicione pelo menos um caractere especial');
  }

  // Common password check
  const commonPasswords = [
    'password', '123456', '123456789', 'qwerty', 'abc123',
    'password123', 'admin', 'letmein', 'welcome', 'monkey'
  ];
  
  if (commonPasswords.includes(password.toLowerCase())) {
    score = 0;
    feedback.push('Evite senhas muito comuns');
  }

  return {
    isStrong: score >= 4,
    score,
    feedback,
  };
};

// Generate CSRF token
export const generateCSRFToken = (): string => {
  return crypto.randomBytes(32).toString('base64');
};

// Verify CSRF token
export const verifyCSRFToken = (token: string, sessionToken: string): boolean => {
  return crypto.timingSafeEqual(
    Buffer.from(token, 'base64'),
    Buffer.from(sessionToken, 'base64')
  );
};

// Detect suspicious login patterns
export const detectSuspiciousActivity = (
  req: NextApiRequest,
  previousAttempts: Array<{ ip: string; timestamp: number; success: boolean }>
): {
  isSuspicious: boolean;
  reason?: string;
} => {
  const currentIp = req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;

  // Check for too many failed attempts from same IP
  const recentFailedAttempts = previousAttempts.filter(
    attempt => 
      attempt.ip === currentIp && 
      !attempt.success && 
      (now - attempt.timestamp) < oneHour
  );

  if (recentFailedAttempts.length >= 5) {
    return {
      isSuspicious: true,
      reason: 'Too many failed login attempts from this IP',
    };
  }

  // Check for rapid-fire requests
  const recentAttempts = previousAttempts.filter(
    attempt => 
      attempt.ip === currentIp && 
      (now - attempt.timestamp) < 60000 // Last minute
  );

  if (recentAttempts.length >= 10) {
    return {
      isSuspicious: true,
      reason: 'Too many requests in short time period',
    };
  }

  return { isSuspicious: false };
};

// Log security events
export const logSecurityEvent = (
  event: 'login_success' | 'login_failure' | 'registration' | 'password_reset' | 'suspicious_activity',
  details: {
    ip?: string;
    userAgent?: string;
    email?: string;
    reason?: string;
  }
): void => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    event,
    ...details,
  };

  // In production, you would send this to a proper logging service
  console.log('SECURITY_EVENT:', JSON.stringify(logEntry));
};

// Validate request origin (CORS protection)
export const validateOrigin = (req: NextApiRequest, allowedOrigins: string[]): boolean => {
  const origin = req.headers.origin;
  
  if (!origin) {
    // Allow requests without origin (like from mobile apps)
    return true;
  }

  return allowedOrigins.includes(origin);
};

// Generate secure session ID
export const generateSessionId = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

// Encrypt sensitive data
export const encryptData = (data: string, key: string): string => {
  const algorithm = 'aes-256-gcm';
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher(algorithm, key);
  
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return iv.toString('hex') + ':' + encrypted;
};

// Decrypt sensitive data
export const decryptData = (encryptedData: string, key: string): string => {
  const algorithm = 'aes-256-gcm';
  const parts = encryptedData.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = parts[1];
  
  const decipher = crypto.createDecipher(algorithm, key);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
};