import { Router } from 'express';

import { isNeo4jConfigured, verifyNeo4jConnectivity } from '../config/neo4j';

export const healthRouter = Router();

healthRouter.get('/', async (_request, response) => {
  const neo4j = {
    configured: isNeo4jConfigured(),
    connected: false,
  };

  if (neo4j.configured) {
    try {
      await verifyNeo4jConnectivity();
      neo4j.connected = true;
    } catch {
      response.status(503);
    }
  }

  response.json({
    ok: !neo4j.configured || neo4j.connected,
    service: 'bond_grid-api',
    neo4j,
  });
});
