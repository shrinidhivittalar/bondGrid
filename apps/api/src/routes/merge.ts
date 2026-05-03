import { Router } from 'express';

import { dryRunMerge, executeMerge, PersonValidationError } from '../services/personService';

export const mergeRouter = Router();

mergeRouter.post('/dry-run', async (request, response) => {
  const { sourcePersonId, targetPersonId } = request.body;
  
  if (!sourcePersonId || !targetPersonId) {
    return response.status(400).json({ error: { message: 'Source and target person IDs are required.' } });
  }

  try {
    const result = await dryRunMerge(sourcePersonId, targetPersonId);
    response.json(result);
  } catch (error) {
    sendMergeError(response, error);
  }
});

mergeRouter.post('/execute', async (request, response) => {
  const { sourcePersonId, targetPersonId } = request.body;
  
  if (!sourcePersonId || !targetPersonId) {
    return response.status(400).json({ error: { message: 'Source and target person IDs are required.' } });
  }

  try {
    const result = await executeMerge(sourcePersonId, targetPersonId);
    response.json(result);
  } catch (error) {
    sendMergeError(response, error);
  }
});

function sendMergeError(response: { status: (code: number) => typeof response; json: (body: unknown) => void }, error: unknown) {
  if (error instanceof PersonValidationError) {
    response.status(error.statusCode).json({
      error: {
        message: error.message,
        details: error.details,
      },
    });
    return;
  }

  response.status(500).json({
    error: {
      message: error instanceof Error ? error.message : 'Unexpected merge API error.',
    },
  });
}
