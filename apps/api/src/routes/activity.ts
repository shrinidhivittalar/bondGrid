import { Router } from 'express';
import { getRecentActivity } from '../services/auditService';

export const activityRouter = Router();

activityRouter.get('/', async (request, response) => {
  try {
    const limit = Number(request.query.limit) || 20;
    response.json({
      activities: await getRecentActivity(limit),
    });
  } catch (error) {
    response.status(500).json({
      error: {
        message: 'Could not load activity log.',
      },
    });
  }
});
