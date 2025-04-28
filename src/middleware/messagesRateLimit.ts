import { Request, Response, NextFunction } from 'express';
import { redisClient } from '../utils/redis';
import { fromNodeHeaders } from 'better-auth/node';
import { auth } from '../utils/auth';

const maxMsgs = parseInt(process.env.MAX_MSGS || '50');

export async function rateLimitMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
    
    if (!session) {
      return res.status(401).json({ message: "Unauthorized." });
    }
    
    const userId = session.user.id;
    const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const redisKey = `message_limit:${userId}:${currentDate}`;
    
    // Get current count from Redis
    const currentCount = await redisClient.get(redisKey);
    const count = currentCount ? parseInt(currentCount) : 0;
    
    // Check if limit is reached
    if (count >= maxMsgs) {
      return res.status(429).json({ 
        message: "Daily message limit reached. Please try again tomorrow.",
        limit: maxMsgs,
        remaining: 0
      });
    }
    
    await redisClient.incr(redisKey);
    
    // Set expiry time to end of day (midnight)
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    const secondsUntilEndOfDay = Math.floor((endOfDay.getTime() - Date.now()) / 1000);
    
    // Set the key to expire at midnight
    await redisClient.expire(redisKey, secondsUntilEndOfDay);
    
    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', maxMsgs.toString());
    res.setHeader('X-RateLimit-Remaining', (maxMsgs - count - 1).toString());
    
    next();
  } catch (error) {
    console.error('Rate limiting error:', error);
    // Allow the request to proceed if rate limiting fails
    next();
  }
}