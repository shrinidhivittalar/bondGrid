import { randomUUID } from 'crypto';
import { getNeo4jSession } from '../config/neo4j';

export type ActivityType =
  | 'PERSON_CREATED'
  | 'PERSON_UPDATED'
  | 'PERSON_DELETED'
  | 'RELATIONSHIP_CREATED'
  | 'RELATIONSHIP_UPDATED'
  | 'RELATIONSHIP_DELETED'
  | 'PEOPLE_MERGED';

export type ActivityInput = {
  type: ActivityType;
  description: string;
  performedBy?: string;
  personIds?: string[];
  metadata?: Record<string, unknown>;
};

export async function logActivity(input: ActivityInput) {
  const session = getNeo4jSession();
  const activityId = randomUUID();
  const createdAt = new Date().toISOString();

  try {
    // Create activity node and link to affected people
    await session.run(
      `
      CREATE (activity:Activity {
        activityId: $activityId,
        type: $type,
        description: $description,
        performedBy: $performedBy,
        createdAt: $createdAt,
        metadata: $metadata
      })
      WITH activity
      UNWIND $personIds AS personId
      MATCH (person:Person {personId: personId})
      CREATE (activity)-[:AFFECTS]->(person)
      `,
      {
        activityId,
        type: input.type,
        description: input.description,
        performedBy: input.performedBy ?? 'System',
        createdAt,
        metadata: JSON.stringify(input.metadata ?? {}),
        personIds: input.personIds ?? [],
      }
    );
  } catch (error) {
    // Audit logging should ideally not break the main transaction, 
    // but in a graph-only system we might want it to be part of the same session.
    console.error('Failed to log activity:', error);
  } finally {
    await session.close();
  }
}

export async function getRecentActivity(limit = 10) {
  const session = getNeo4jSession();
  try {
    const result = await session.run(
      `
      MATCH (activity:Activity)
      OPTIONAL MATCH (activity)-[:AFFECTS]->(person:Person)
      RETURN activity, collect(person.name) AS affectedPeople
      ORDER BY activity.createdAt DESC
      LIMIT $limit
      `,
      { limit }
    );

    return result.records.map((record) => ({
      ...record.get('activity').properties,
      metadata: JSON.parse(record.get('activity').properties.metadata || '{}'),
      affectedPeople: record.get('affectedPeople'),
    }));
  } finally {
    await session.close();
  }
}
