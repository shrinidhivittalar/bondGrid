import { Router } from 'express';

import {
  createPerson,
  getPerson,
  PersonValidationError,
  searchPeople,
  updatePerson,
  deletePerson,
} from '../services/personService';
import { requireAuth } from '../middleware/authMiddleware';
import { useIdempotency } from '../middleware/idempotencyMiddleware';

export const peopleRouter = Router();
peopleRouter.use(useIdempotency());

peopleRouter.get('/search', requireAuth('Viewer'), async (request, response) => {
  try {
    response.json(await searchPeople(request.query.q));
  } catch (error) {
    sendPersonError(response, error);
  }
});

peopleRouter.post('/', requireAuth('Volunteer'), async (request, response) => {
  try {
    const result = await createPerson(request.body, {
      searchContextId: request.body?.searchContextId,
      confirmDuplicate: request.body?.confirmDuplicate,
    });

    response.status(result.created ? 201 : 200).json(result);
  } catch (error) {
    sendPersonError(response, error);
  }
});

peopleRouter.get('/:personId', requireAuth('Viewer'), async (request, response) => {
  try {
    response.json(await getPerson(request.params.personId as string));
  } catch (error) {
    sendPersonError(response, error);
  }
});

peopleRouter.patch('/:personId', requireAuth('Volunteer'), async (request, response) => {
  try {
    response.json({
      person: await updatePerson(request.params.personId as string, request.body),
    });
  } catch (error) {
    sendPersonError(response, error);
  }
});

peopleRouter.delete('/:personId', requireAuth('Admin'), async (request, response) => {
  try {
    await deletePerson(request.params.personId as string);
    response.status(204).end();
  } catch (error) {
    sendPersonError(response, error);
  }
});

function sendPersonError(response: { status: (code: number) => typeof response; json: (body: unknown) => void }, error: unknown) {
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
      message: 'Unexpected people API error.',
    },
  });
}
