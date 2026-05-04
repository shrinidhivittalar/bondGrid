import { Router } from 'express';
import { runConsistencyChecks } from '../services/consistencyService';
import { getSystemMetrics } from '../services/metricsService';
import { requireAuth } from '../middleware/authMiddleware';

export const adminRouter = Router();

adminRouter.get('/consistency-check', requireAuth('Admin'), async (request, response) => {
  try {
    const issues = await runConsistencyChecks();
    response.json({
      timestamp: new Date().toISOString(),
      status: issues.length === 0 ? 'HEALTHY' : 'ISSUES_FOUND',
      issueCount: issues.length,
      issues,
    });
  } catch (error) {
    response.status(500).json({
      error: {
        message: 'Failed to run consistency checks.',
      },
    });
  }
});

adminRouter.get('/metrics', requireAuth('Admin'), async (request, response) => {
  try {
    response.json(await getSystemMetrics());
  } catch (error) {
    response.status(500).json({
      error: {
        message: 'Failed to fetch system metrics.',
      },
    });
  }
});
