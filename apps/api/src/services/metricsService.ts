import { getNeo4jSession } from '../config/neo4j';
import { runConsistencyChecks } from './consistencyService';

export async function getSystemMetrics() {
  const session = getNeo4jSession();
  try {
    const counts = await session.run(`
      CALL {
        MATCH (p:Person) RETURN count(p) AS totalPeople
      }
      CALL {
        MATCH ()-[r]->() WHERE r.relationshipGroupId IS NOT NULL RETURN count(DISTINCT r.relationshipGroupId) AS totalRelationshipGroups
      }
      CALL {
        MATCH (p:Person {isIncomplete: true}) RETURN count(p) AS incompletePeople
      }
      CALL {
        MATCH (p:Person {status: 'Merged'}) RETURN count(p) AS mergedPeople
      }
      CALL {
        MATCH (a:Activity) WHERE a.createdAt > $yesterday RETURN count(a) AS activityLast24h
      }
      RETURN totalPeople, totalRelationshipGroups, incompletePeople, mergedPeople, activityLast24h
    `, {
      yesterday: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    });

    const record = counts.records[0];
    const consistencyIssues = await runConsistencyChecks();

    return {
      graph: {
        totalPeople: record.get('totalPeople').toNumber(),
        totalRelationships: record.get('totalRelationshipGroups').toNumber(),
        incompleteProfiles: record.get('incompletePeople').toNumber(),
        mergedProfiles: record.get('mergedPeople').toNumber(),
      },
      operations: {
        activityLast24h: record.get('activityLast24h').toNumber(),
        consistencyIssues: consistencyIssues.length,
      },
      timestamp: new Date().toISOString()
    };
  } finally {
    await session.close();
  }
}
