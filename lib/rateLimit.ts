import { LRUCache } from 'lru-cache';
import { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse } from './types';

// Define rate limit settings
const MAX_REQUESTS_PER_MINUTE = 5; // 5 requests per minute
const CACHE_TTL = 60 * 1000; // 1 minute in milliseconds

interface RateLimitInfo {
  count: number;
  timestamp: number;
}

// Create cache to store request counts by IP
const rateLimitCache = new LRUCache<string, RateLimitInfo>({
  max: 500, // Maximum number of IPs to track
  ttl: CACHE_TTL, // Cache entries expire after 1 minute
});

// Get client IP from request
const getClientIp = (req: NextApiRequest): string => {
  // Use X-Forwarded-For header when behind a proxy
  const forwardedFor = req.headers['x-forwarded-for'];
  if (forwardedFor && typeof forwardedFor === 'string') {
    return forwardedFor.split(',')[0].trim();
  }
  
  // Fallback to connection remote address
  return req.socket.remoteAddress || 'unknown';
};

// Rate limiting middleware
export const rateLimit = (req: NextApiRequest, res: NextApiResponse<ApiResponse>) => {
  const ip = getClientIp(req);
  
  // Get current count from cache
  const rateLimitInfo = rateLimitCache.get(ip) || { count: 0, timestamp: Date.now() };
  
  // Reset count if more than a minute has passed
  if (Date.now() - rateLimitInfo.timestamp > CACHE_TTL) {
    rateLimitInfo.count = 0;
    rateLimitInfo.timestamp = Date.now();
  }
  
  // Increment request count
  rateLimitInfo.count += 1;
  rateLimitCache.set(ip, rateLimitInfo);
  
  // Set rate limit headers
  res.setHeader('X-RateLimit-Limit', MAX_REQUESTS_PER_MINUTE);
  res.setHeader('X-RateLimit-Remaining', Math.max(0, MAX_REQUESTS_PER_MINUTE - rateLimitInfo.count));
  res.setHeader('X-RateLimit-Reset', new Date(rateLimitInfo.timestamp + CACHE_TTL).toISOString());
  
  // Return true if limit exceeded
  if (rateLimitInfo.count > MAX_REQUESTS_PER_MINUTE) {
    res.status(429).json({
      success: false,
      error: 'Too many requests',
      message: 'Rate limit exceeded. Please try again in a minute.',
    });
    return true;
  }
  
  return false;
};