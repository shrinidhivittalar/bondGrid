import { Router } from 'express';

import { getNeo4jSession } from '../config/neo4j';
import { relationshipDefinitions } from '../models/relationshipTypes';

export const graphRouter = Router();

graphRouter.get('/relationship-types', (_request, response) => {
  response.json({
    relationshipTypes: relationshipDefinitions,
  });
});

graphRouter.get('/network', async (_request, response) => {
  const session = getNeo4jSession();

  try {
    const result = await session.run(
      `
      MATCH (person:Person)
      OPTIONAL MATCH (from:Person)-[relationship]->(to:Person)
      WHERE relationship.relationshipGroupId IS NOT NULL
      WITH collect(DISTINCT person) AS people,
           relationship.relationshipGroupId AS relationshipGroupId,
           collect({
             fromPersonId: from.personId,
             toPersonId: to.personId,
             relationshipType: relationship.relationshipCode,
             relationshipLabel: relationship.relationshipLabel,
             createdAt: relationship.createdAt,
             updatedAt: relationship.updatedAt
           }) AS relationshipPairs
      WITH people,
           collect(CASE
             WHEN relationshipGroupId IS NULL THEN null
             ELSE relationshipPairs[0]
           END) AS connections
      RETURN people, [connection IN connections WHERE connection IS NOT NULL] AS connections
      `,
    );

    const record = result.records[0];

    response.json({
      people: record?.get('people').map((person: { properties: Record<string, unknown> }) => person.properties) ?? [],
      connections: record?.get('connections') ?? [],
    });
  } finally {
    await session.close();
  }
});
