import { randomUUID } from 'crypto';

import { getNeo4jSession } from '../config/neo4j';
import { RelationshipInput, RelationshipSummary } from '../models/relationship';
import { getRelationshipDefinition } from '../models/relationshipTypes';
import { logActivity } from './auditService';

const parentRelationshipCodes = new Set(['father', 'mother', 'son', 'daughter']);

type ParentChildPair = {
  parentPersonId: string;
  childPersonId: string;
  parentType: 'father' | 'mother' | 'parent';
};

export class RelationshipValidationError extends Error {
  constructor(
    message: string,
    public readonly statusCode = 400,
    public readonly details?: unknown,
  ) {
    super(message);
  }
}

export async function createRelationship(input: RelationshipInput) {
  const fromPersonId = asRequiredString(input.fromPersonId, 'fromPersonId');
  const toPersonId = asRequiredString(input.toPersonId, 'toPersonId');
  const relationshipCode = asRequiredString(input.relationshipType, 'relationshipType');
  const definition = getRelationshipDefinition(relationshipCode);

  if (!definition) {
    throw new RelationshipValidationError('Relationship type is not supported.', 400);
  }

  if (fromPersonId === toPersonId) {
    throw new RelationshipValidationError('A person cannot be connected to themselves.', 400);
  }

  const session = getNeo4jSession();

  try {
    return await session.executeWrite(async (transaction) => {
      const peopleResult = await transaction.run(
        `
        MATCH (from:Person {personId: $fromPersonId})
        MATCH (to:Person {personId: $toPersonId})
        RETURN from, to
        `,
        { fromPersonId, toPersonId },
      );

      if (peopleResult.records.length === 0) {
        throw new RelationshipValidationError('Both people must exist before a relationship can be created.', 404);
      }

      const existingPair = await transaction.run(
        `
        MATCH (from:Person {personId: $fromPersonId})-[relationship]-(to:Person {personId: $toPersonId})
        WHERE relationship.relationshipGroupId IS NOT NULL
        RETURN relationship
        LIMIT 1
        `,
        { fromPersonId, toPersonId },
      );

      if (existingPair.records.length > 0) {
        throw new RelationshipValidationError('These two people are already connected.', 409);
      }

      const parentChildPair = getParentChildPair(definition.code, fromPersonId, toPersonId);

      if (parentChildPair) {
        await validateParentChildRules(transaction, parentChildPair);
      }

      const now = new Date().toISOString();
      const relationshipGroupId = randomUUID();
      const result = await transaction.run(
        `
        MATCH (from:Person {personId: $fromPersonId})
        MATCH (to:Person {personId: $toPersonId})
        CREATE (from)-[forward:${definition.neo4jType} {
          relationshipGroupId: $relationshipGroupId,
          relationshipCode: $relationshipCode,
          relationshipLabel: $relationshipLabel,
          inverseRelationshipCode: $inverseRelationshipCode,
          createdAt: $createdAt,
          updatedAt: $updatedAt
        }]->(to)
        CREATE (to)-[inverse:${definition.inverseNeo4jType} {
          relationshipGroupId: $relationshipGroupId,
          relationshipCode: $inverseRelationshipCode,
          relationshipLabel: $inverseRelationshipLabel,
          inverseRelationshipCode: $relationshipCode,
          createdAt: $createdAt,
          updatedAt: $updatedAt
        }]->(from)
        RETURN forward, inverse
        `,
        {
          fromPersonId,
          toPersonId,
          relationshipGroupId,
          relationshipCode: definition.code,
          relationshipLabel: definition.label,
          inverseRelationshipCode: definition.inverseCode,
          inverseRelationshipLabel: definition.inverseLabel,
          createdAt: now,
          updatedAt: now,
        },
      );

      const created = {
        relationshipGroupId,
        forward: result.records[0].get('forward').properties,
        inverse: result.records[0].get('inverse').properties,
      };

      await logActivity({
        type: 'RELATIONSHIP_CREATED',
        description: `Connected person ${fromPersonId} to ${toPersonId} as ${definition.label}`,
        personIds: [fromPersonId, toPersonId],
        metadata: { fromPersonId, toPersonId, relationshipCode, relationshipGroupId },
      });

      return created;
    });
  } finally {
    await session.close();
  }
}

export async function getRelationshipsForPerson(personId: string) {
  const session = getNeo4jSession();

  try {
    const result = await session.run(
      `
      MATCH (person:Person {personId: $personId})
      OPTIONAL MATCH (person)-[outgoing]->(outgoingPerson:Person)
      WHERE outgoing.relationshipGroupId IS NOT NULL
      RETURN collect({
        relationshipGroupId: outgoing.relationshipGroupId,
        relationshipType: outgoing.relationshipCode,
        relationshipLabel: outgoing.relationshipLabel,
        neo4jType: type(outgoing),
        direction: 'outgoing',
        relatedPersonId: outgoingPerson.personId,
        relatedName: outgoingPerson.name,
        createdAt: outgoing.createdAt,
        updatedAt: outgoing.updatedAt
      }) AS relationships
      `,
      { personId },
    );

    const record = result.records[0];

    if (!record) {
      throw new RelationshipValidationError('Person not found.', 404);
    }

    return {
      relationships: record
        .get('relationships')
        .filter((relationship: RelationshipSummary) => Boolean(relationship.relatedPersonId)),
    };
  } finally {
    await session.close();
  }
}

export async function deleteRelationship(relationshipGroupId: string) {
  const session = getNeo4jSession();

  try {
    const result = await session.run(
      `
      MATCH ()-[relationship]->()
      WHERE relationship.relationshipGroupId = $relationshipGroupId
      WITH collect(relationship) AS relationships
      FOREACH (relationship IN relationships | DELETE relationship)
      RETURN size(relationships) AS deletedCount
      `,
      { relationshipGroupId },
    );

    const deletedCount = result.records[0]?.get('deletedCount').toNumber() ?? 0;

    if (deletedCount === 0) {
      throw new RelationshipValidationError('Relationship not found.', 404);
    }

    await logActivity({
      type: 'RELATIONSHIP_DELETED',
      description: `Deleted relationship group ${relationshipGroupId}`,
      metadata: { relationshipGroupId, deletedCount },
    });

    return {
      relationshipGroupId,
      deletedCount,
    };
  } finally {
    await session.close();
  }
}

export async function updateRelationship(relationshipGroupId: string, input: RelationshipInput) {
  const fromPersonId = asRequiredString(input.fromPersonId, 'fromPersonId');
  const toPersonId = asRequiredString(input.toPersonId, 'toPersonId');
  const relationshipCode = asRequiredString(input.relationshipType, 'relationshipType');
  const definition = getRelationshipDefinition(relationshipCode);

  if (!definition) {
    throw new RelationshipValidationError('Relationship type is not supported.', 400);
  }

  if (fromPersonId === toPersonId) {
    throw new RelationshipValidationError('A person cannot be connected to themselves.', 400);
  }

  const session = getNeo4jSession();

  try {
    return await session.executeWrite(async (transaction) => {
      const peopleResult = await transaction.run(
        `
        MATCH (from:Person {personId: $fromPersonId})
        MATCH (to:Person {personId: $toPersonId})
        RETURN from, to
        `,
        { fromPersonId, toPersonId },
      );

      if (peopleResult.records.length === 0) {
        throw new RelationshipValidationError('Both people must exist before a relationship can be updated.', 404);
      }

      const existingResult = await transaction.run(
        `
        MATCH ()-[relationship]->()
        WHERE relationship.relationshipGroupId = $relationshipGroupId
        RETURN relationship.createdAt AS createdAt
        LIMIT 1
        `,
        { relationshipGroupId }
      );

      if (existingResult.records.length === 0) {
         throw new RelationshipValidationError('Relationship not found.', 404);
      }
      
      const createdAt = existingResult.records[0].get('createdAt') || new Date().toISOString();

      const existingPair = await transaction.run(
        `
        MATCH (from:Person {personId: $fromPersonId})-[relationship]-(to:Person {personId: $toPersonId})
        WHERE relationship.relationshipGroupId IS NOT NULL
          AND relationship.relationshipGroupId <> $relationshipGroupId
        RETURN relationship
        LIMIT 1
        `,
        { fromPersonId, toPersonId, relationshipGroupId },
      );

      if (existingPair.records.length > 0) {
        throw new RelationshipValidationError('These two people are already connected.', 409);
      }

      await transaction.run(
        `
        MATCH ()-[relationship]->()
        WHERE relationship.relationshipGroupId = $relationshipGroupId
        DELETE relationship
        `,
        { relationshipGroupId }
      );

      const parentChildPair = getParentChildPair(definition.code, fromPersonId, toPersonId);

      if (parentChildPair) {
        await validateParentChildRules(transaction, parentChildPair);
      }

      const now = new Date().toISOString();
      const result = await transaction.run(
        `
        MATCH (from:Person {personId: $fromPersonId})
        MATCH (to:Person {personId: $toPersonId})
        CREATE (from)-[forward:${definition.neo4jType} {
          relationshipGroupId: $relationshipGroupId,
          relationshipCode: $relationshipCode,
          relationshipLabel: $relationshipLabel,
          inverseRelationshipCode: $inverseRelationshipCode,
          createdAt: $createdAt,
          updatedAt: $updatedAt
        }]->(to)
        CREATE (to)-[inverse:${definition.inverseNeo4jType} {
          relationshipGroupId: $relationshipGroupId,
          relationshipCode: $inverseRelationshipCode,
          relationshipLabel: $inverseRelationshipLabel,
          inverseRelationshipCode: $relationshipCode,
          createdAt: $createdAt,
          updatedAt: $updatedAt
        }]->(from)
        RETURN forward, inverse
        `,
        {
          fromPersonId,
          toPersonId,
          relationshipGroupId,
          relationshipCode: definition.code,
          relationshipLabel: definition.label,
          inverseRelationshipCode: definition.inverseCode,
          inverseRelationshipLabel: definition.inverseLabel,
          createdAt: createdAt,
          updatedAt: now,
        },
      );

      const updated = {
        relationshipGroupId,
        forward: result.records[0].get('forward').properties,
        inverse: result.records[0].get('inverse').properties,
      };

      await logActivity({
        type: 'RELATIONSHIP_UPDATED',
        description: `Updated relationship group ${relationshipGroupId} between ${fromPersonId} and ${toPersonId}`,
        personIds: [fromPersonId, toPersonId],
        metadata: { fromPersonId, toPersonId, relationshipCode, relationshipGroupId },
      });

      return updated;
    });
  } finally {
    await session.close();
  }
}

async function validateParentChildRules(
  transaction: { run: (query: string, parameters?: Record<string, unknown>) => Promise<{ records: unknown[] }> },
  pair: ParentChildPair,
) {
  const existingParent = await transaction.run(
    `
    MATCH (existingParent:Person)-[relationship]->(child:Person {personId: $childPersonId})
    WHERE type(relationship) IN ['FATHER_OF', 'MOTHER_OF']
    RETURN relationship
    LIMIT 1
    `,
    { childPersonId: pair.childPersonId },
  );

  if (existingParent.records.length > 0) {
    const existingType = (existingParent.records[0] as { get: (k: string) => { type: string } }).get('relationship').type;
    if (pair.parentType === 'father' || pair.parentType === 'mother') {
      throw new RelationshipValidationError(`A person can only have one ${pair.parentType}.`, 409);
    }
    if (pair.parentType === 'parent') {
      const label = existingType === 'FATHER_OF' ? 'father' : 'mother';
      throw new RelationshipValidationError(`A person can only have one ${label}.`, 409);
    }
  }

  const cycle = await transaction.run(
    `
    MATCH (parent:Person {personId: $parentPersonId})
    MATCH (child:Person {personId: $childPersonId})
    MATCH path = (child)-[:FATHER_OF|MOTHER_OF|PARENT_OF*1..]->(parent)
    RETURN path
    LIMIT 1
    `,
    {
      parentPersonId: pair.parentPersonId,
      childPersonId: pair.childPersonId,
    },
  );

  if (cycle.records.length > 0) {
    throw new RelationshipValidationError('This relationship would create a circular family relationship.', 409);
  }
}

function getParentChildPair(code: string, fromPersonId: string, toPersonId: string): ParentChildPair | undefined {
  if (!parentRelationshipCodes.has(code)) {
    return undefined;
  }

  if (code === 'father' || code === 'mother') {
    return {
      parentPersonId: fromPersonId,
      childPersonId: toPersonId,
      parentType: code,
    };
  }

  return {
    parentPersonId: toPersonId,
    childPersonId: fromPersonId,
    parentType: 'parent',
  };
}

function asRequiredString(value: unknown, fieldName: string) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new RelationshipValidationError(`${fieldName} is required.`);
  }

  return value.trim();
}
