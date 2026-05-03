import neo4j, { Driver } from 'neo4j-driver';

let driver: Driver | undefined;

export function getNeo4jDriver() {
  if (!driver) {
    const uri = process.env.NEO4J_URI;
    const username = process.env.NEO4J_USERNAME;
    const password = process.env.NEO4J_PASSWORD;

    if (!uri || !username || !password) {
      throw new Error('Neo4j is not configured. Set NEO4J_URI, NEO4J_USERNAME, and NEO4J_PASSWORD.');
    }

    driver = neo4j.driver(uri, neo4j.auth.basic(username, password));
  }

  return driver;
}

export function getNeo4jSession() {
  const database = process.env.NEO4J_DATABASE;

  return getNeo4jDriver().session(database ? { database } : undefined);
}

export function isNeo4jConfigured() {
  return Boolean(process.env.NEO4J_URI && process.env.NEO4J_USERNAME && process.env.NEO4J_PASSWORD);
}

export async function verifyNeo4jConnectivity() {
  await getNeo4jDriver().verifyConnectivity();
}

export async function closeNeo4jDriver() {
  if (!driver) {
    return;
  }

  await driver.close();
  driver = undefined;
}
