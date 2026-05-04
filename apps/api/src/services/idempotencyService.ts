import { getNeo4jSession } from '../config/neo4j';

export async function checkIdempotency(key: string): Promise<any | null> {
  const session = getNeo4jSession();
  try {
    const result = await session.run(
      'MATCH (k:IdempotencyKey {key: $key}) RETURN k.response AS response',
      { key }
    );
    const record = result.records[0];
    return record ? JSON.parse(record.get('response')) : null;
  } finally {
    await session.close();
  }
}

export async function saveIdempotency(key: string, response: any) {
  const session = getNeo4jSession();
  try {
    await session.run(
      `
      MERGE (k:IdempotencyKey {key: $key})
      SET k.response = $response,
          k.createdAt = $createdAt
      `,
      {
        key,
        response: JSON.stringify(response),
        createdAt: new Date().toISOString()
      }
    );
  } finally {
    await session.close();
  }
}

export async function pruneIdempotencyKeys(maxAgeDays = 7) {
  const session = getNeo4jSession();
  const cutoff = new Date(Date.now() - maxAgeDays * 24 * 60 * 60 * 1000).toISOString();
  try {
    await session.run(
      'MATCH (k:IdempotencyKey) WHERE k.createdAt < $cutoff DELETE k',
      { cutoff }
    );
  } finally {
    await session.close();
  }
}
