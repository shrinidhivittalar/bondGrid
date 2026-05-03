import { Router } from 'express';

import {
  createRelationship,
  deleteRelationship,
  getRelationshipsForPerson,
  updateRelationship,
  RelationshipValidationError,
} from '../services/relationshipService';

export const relationshipsRouter = Router();

relationshipsRouter.post('/', async (request, response) => {
  try {
    response.status(201).json(await createRelationship(request.body));
  } catch (error) {
    sendRelationshipError(response, error);
  }
});

relationshipsRouter.get('/person/:personId', async (request, response) => {
  try {
    response.json(await getRelationshipsForPerson(request.params.personId));
  } catch (error) {
    sendRelationshipError(response, error);
  }
});

relationshipsRouter.delete('/:relationshipGroupId', async (request, response) => {
  try {
    response.json(await deleteRelationship(request.params.relationshipGroupId));
  } catch (error) {
    sendRelationshipError(response, error);
  }
});

relationshipsRouter.patch('/:relationshipGroupId', async (request, response) => {
  try {
    response.json(await updateRelationship(request.params.relationshipGroupId, request.body));
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
