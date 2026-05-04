import { Request, Response, NextFunction } from 'express';
import { checkIdempotency, saveIdempotency } from '../services/idempotencyService';

export function useIdempotency() {
  return async (req: Request, res: Response, next: NextFunction) => {
    const key = req.headers['x-idempotency-key'];

    if (!key || typeof key !== 'string') {
      return next();
    }

    try {
      const cachedResponse = await checkIdempotency(key);
      if (cachedResponse) {
        return res.status(200).json(cachedResponse);
      }

      // Wrap res.json to capture the response and save it
      const originalJson = res.json;
      res.json = function (body) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          saveIdempotency(key, body).catch(err => console.error('Idempotency save failed:', err));
        }
        return originalJson.call(this, body);
      };

      next();
    } catch (error) {
      console.error('Idempotency check failed:', error);
      next();
    }
  };
}
