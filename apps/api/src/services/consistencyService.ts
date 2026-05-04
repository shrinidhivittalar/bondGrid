import { getNeo4jSession } from '../config/neo4j';

export type ConsistencyIssue = {
  type: string;
  severity: 'high' | 'medium' | 'low';
  description: string;
  affectedIds: string[];
};

export async function runConsistencyChecks(): Promise<ConsistencyIssue[]> {
  const session = getNeo4jSession();
  const issues: ConsistencyIssue[] = [];

  try {
    // 1. Check for missing inverse pairs
    const missingInverse = await session.run(`
      MATCH (a)-[r1]->(b)
      WHERE r1.relationshipGroupId IS NOT NULL
      AND NOT EXISTS {
        MATCH (b)-[r2]->(a)
        WHERE r2.relationshipGroupId = r1.relationshipGroupId
      }
      RETURN r1.relationshipGroupId AS groupId, type(r1) AS relType, a.personId AS fromId
    `);

    missingInverse.records.forEach(rec => {
      issues.push({
        type: 'MISSING_INVERSE',
        severity: 'high',
        description: `Relationship group ${rec.get('groupId')} (${rec.get('relType')}) is missing its inverse edge.`,
        affectedIds: [rec.get('fromId')]
      });
    });

    // 2. Check for self-referential edges
    const selfRefs = await session.run(`
      MATCH (a)-[r]->(a)
      RETURN a.personId AS personId, type(r) AS relType
    `);

    selfRefs.records.forEach(rec => {
      issues.push({
        type: 'SELF_REFERENCE',
        severity: 'high',
        description: `Person ${rec.get('personId')} is connected to themselves via ${rec.get('relType')}.`,
        affectedIds: [rec.get('personId')]
      });
    });

    // 3. Check for multiple fathers/mothers
    const multiParents = await session.run(`
      MATCH (p:Person)<-[r:FATHER_OF|MOTHER_OF]-(parent)
      WITH p, type(r) AS relType, count(parent) AS parentCount
      WHERE parentCount > 1
      RETURN p.personId AS personId, relType, parentCount
    `);

    multiParents.records.forEach(rec => {
      issues.push({
        type: 'MULTIPLE_PARENTS',
        severity: 'high',
        description: `Person ${rec.get('personId')} has ${rec.get('parentCount')} ${rec.get('relType')} assignments.`,
        affectedIds: [rec.get('personId')]
      });
    });

    // 4. Check for active relationships on Merged nodes
    const mergedWithRels = await session.run(`
      MATCH (p:Person {status: 'Merged'})-[r]-()
      RETURN p.personId AS personId, count(r) AS relCount
    `);

    mergedWithRels.records.forEach(rec => {
      issues.push({
        type: 'MERGED_NODE_WITH_RELATIONSHIPS',
        severity: 'medium',
        description: `Merged person ${rec.get('personId')} still has ${rec.get('relCount')} active relationships.`,
        affectedIds: [rec.get('personId')]
      });
    });

    // 5. Check for phone number duplicates (in case constraints were bypassed)
    const duplicatePhones = await session.run(`
      MATCH (p:Person)
      WHERE p.phone IS NOT NULL AND p.phone <> ''
      WITH p.phone AS phone, collect(p.personId) AS personIds, count(*) AS count
      WHERE count > 1
      RETURN phone, personIds
    `);

    duplicatePhones.records.forEach(rec => {
      issues.push({
        type: 'DUPLICATE_PHONE',
        severity: 'high',
        description: `Phone number ${rec.get('phone')} is shared by multiple profiles.`,
        affectedIds: rec.get('personIds')
      });
    });

    return issues;
  } finally {
    await session.close();
  }
}
