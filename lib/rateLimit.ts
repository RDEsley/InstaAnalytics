import { LRUCache } from 'lru-cache';
import { NextApiRequest, NextApiResponse } from 'next';

// Define rate limit settings for different endpoints
const RATE_LIMITS = {
  login: { maxRequests: 5, windowMs: 60 * 1000 }, // 5 requests per minute
  register: { maxRequests: 3, windowMs: 60 * 1000 }, // 3 requests per minute
  analyze: { maxRequests: 5, windowMs: 60 * 1000 }, // 5 requests per minute
  default: { maxRequests: 10, windowMs: 60 * 1000 }, // 10 requests per minute
};

interface RateLimitInfo {
  count: number;
  resetTime: number;
}

// Create cache to store request counts by IP and endpoint
const rateLimitCache = new LRUCache<string, RateLimitInfo>({
  max: 1000, // Maximum number of entries to track
  ttl: 60 * 1000, // Cache entries expire after 1 minute
});

// Get client IP from request
const getClientIp = (req: NextApiRequest): string => {
  // Use X-Forwarded-For header when behind a proxy
  const forwardedFor = req.headers['x-forwarded-for'];
  if (forwardedFor && typeof forwardedFor === 'string') {
    return forwardedFor.split(',')[0].trim();
  }
  
  // Use X-Real-IP header
  const realIp = req.headers['x-real-ip'];
  if (realIp && typeof realIp === 'string') {
    return realIp;
  }
  
  // Fallback to connection remote address
  return req.socket.remoteAddress || 'unknown';
};

// Get rate limit settings based on endpoint
const getRateLimitSettings = (req: NextApiRequest) => {
  const url = req.url || '';
  
  if (url.includes('/auth/login')) return RATE_LIMITS.login;
  if (url.includes('/auth/register')) return RATE_LIMITS.register;
  if (url.includes('/analyze')) return RATE_LIMITS.analyze;
  
  return RATE_LIMITS.default;
};

// Rate limiting middleware
export const rateLimit = (req: NextApiRequest, res: NextApiResponse) => {
  const ip = getClientIp(req);
  const endpoint = req.url || 'unknown';
  const cacheKey = `${ip}:${endpoint}`;
  const settings = getRateLimitSettings(req);
  
  const now = Date.now();
  const windowStart = now - settings.windowMs;
  
  // Get current rate limit info from cache
  let rateLimitInfo = rateLimitCache.get(cacheKey);
  
  // Reset if outside the current window
  if (!rateLimitInfo || rateLimitInfo.resetTime <= now) {
    rateLimitInfo = {
      count: 0,
      resetTime: now + settings.windowMs,
    };
  }
  
  // Increment request count
  rateLimitInfo.count += 1;
  rateLimitCache.set(cacheKey, rateLimitInfo);
  
  // Calculate remaining requests and reset time
  const remaining = Math.max(0, settings.maxRequests - rateLimitInfo.count);
  const resetTime = Math.ceil(rateLimitInfo.resetTime / 1000);
  
  // Set rate limit headers
  res.setHeader('X-RateLimit-Limit', settings.maxRequests);
  res.setHeader('X-RateLimit-Remaining', remaining);
  res.setHeader('X-RateLimit-Reset', resetTime);
  res.setHeader('X-RateLimit-Window', settings.windowMs / 1000);
  
  // Check if limit exceeded
  if (rateLimitInfo.count > settings.maxRequests) {
    // Log rate limit violation
    console.log(`Rate limit exceeded for IP ${ip} on endpoint ${endpoint} at ${new Date().toISOString()}`);
    
    res.status(429).json({
      success: false,
      error: 'Too many requests',
      message: 'Muitas tentativas. Tente novamente em alguns minutos.',
      retryAfter: Math.ceil((rateLimitInfo.resetTime - now) / 1000),
    });
    return true;
  }
  
  return false;
};

// Enhanced rate limiting with different strategies
export const enhancedRateLimit = (
  req: NextApiRequest, 
  res: NextApiResponse,
  options?: {
    maxRequests?: number;
    windowMs?: number;
    skipSuccessfulRequests?: boolean;
    skipFailedRequests?: boolean;
  }
) => {
  const settings = options || getRateLimitSettings(req);
  return rateLimit(req, res);
};

// Utility function to check if IP is rate limited
export const isRateLimited = (req: NextApiRequest): boolean => {
  const ip = getClientIp(req);
  const endpoint = req.url || 'unknown';
  const cacheKey = `${ip}:${endpoint}`;
  const settings = getRateLimitSettings(req);
  
  const rateLimitInfo = rateLimitCache.get(cacheKey);
  
  if (!rateLimitInfo) return false;
  
  const now = Date.now();
  if (rateLimitInfo.resetTime <= now) return false;
  
  return rateLimitInfo.count >= settings.maxRequests;
};

// Clear rate limit for specific IP (useful for testing or admin override)
export const clearRateLimit = (ip: string, endpoint?: string): void => {
  if (endpoint) {
    rateLimitCache.delete(`${ip}:${endpoint}`);
  } else {
    // Clear all entries for this IP
    for (const key of rateLimitCache.keys()) {
      if (key.startsWith(`${ip}:`)) {
        rateLimitCache.delete(key);
      }
    }
  }
};