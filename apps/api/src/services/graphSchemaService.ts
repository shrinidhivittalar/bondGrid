import { getNeo4jSession } from '../config/neo4j';

const graphSchemaStatements = [
  'CREATE CONSTRAINT person_id_unique IF NOT EXISTS FOR (person:Person) REQUIRE person.personId IS UNIQUE',
  'CREATE CONSTRAINT person_phone_unique IF NOT EXISTS FOR (person:Person) REQUIRE person.phone IS UNIQUE',
  'CREATE INDEX person_normalized_name IF NOT EXISTS FOR (person:Person) ON (person.normalizedName)',
];

export async function ensureGraphSchema() {
  const session = getNeo4jSession();

  try {
    for (const statement of graphSchemaStatements) {
      await session.run(statement);
    }
  } finally {
    await session.close();
  }
}
