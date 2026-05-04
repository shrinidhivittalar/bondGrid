import { Router } from 'express';

import {
  createRelationship,
  deleteRelationship,
  getRelationshipsForPerson,
  updateRelationship,
  RelationshipValidationError,
} from '../services/relationshipService';
import { requireAuth } from '../middleware/authMiddleware';
import { useIdempotency } from '../middleware/idempotencyMiddleware';

export const relationshipsRouter = Router();
relationshipsRouter.use(useIdempotency());

relationshipsRouter.post('/', requireAuth('Volunteer'), async (request, response) => {
  try {
    response.status(201).json(await createRelationship(request.body));
  } catch (error) {
    sendRelationshipError(response, error);
  }
});

relationshipsRouter.get('/person/:personId', requireAuth('Viewer'), async (request, response) => {
  try {
    response.json(await getRelationshipsForPerson(request.params.personId as string));
  } catch (error) {
    sendRelationshipError(response, error);
  }
});

relationshipsRouter.delete('/:relationshipGroupId', requireAuth('Volunteer'), async (request, response) => {
  try {
    response.json(await deleteRelationship(request.params.relationshipGroupId as string));
  } catch (error) {
    sendRelationshipError(response, error);
  }
});

relationshipsRouter.patch('/:relationshipGroupId', requireAuth('Volunteer'), async (request, response) => {
  try {
    response.json(await updateRelationship(request.params.relationshipGroupId as string, request.body));
  } catch (error) {
    sendRelationshipError(response, error);
  }
});

function sendRelationshipError(
  response: { status: (code: number) => typeof response; json: (body: unknown) => void },
  error: unknown,
) {
  if (error instanceof RelationshipValidationError) {
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
      message: 'Unexpected relationships API error.',
    },
  });
}
