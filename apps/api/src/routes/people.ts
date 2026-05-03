import { Router } from 'express';

import {
  createPerson,
  getPerson,
  PersonValidationError,
  searchPeople,
  updatePerson,
} from '../services/personService';

export const peopleRouter = Router();

peopleRouter.get('/search', async (request, response) => {
  try {
    response.json(await searchPeople(request.query.q));
  } catch (error) {
    sendPersonError(response, error);
  }
});

peopleRouter.post('/', async (request, response) => {
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

peopleRouter.get('/:personId', async (request, response) => {
  try {
    response.json(await getPerson(request.params.personId));
  } catch (error) {
    sendPersonError(response, error);
  }
});

peopleRouter.patch('/:personId', async (request, response) => {
  try {
    response.json({
      person: await updatePerson(request.params.personId, request.body),
    });
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
