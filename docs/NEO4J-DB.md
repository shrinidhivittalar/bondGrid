# Neo4j Database Reference

This document captures the Neo4j setup for the `bond_grid` backend.

## Local Database

Recommended local defaults:

```env
NEO4J_URI=neo4j://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=password
NEO4J_DATABASE=bondgrid
```

Keep real credentials in `apps/api/.env`. Only example values should be
committed.

## Connection Flow

```text
Next.js app
  -> API client
  -> Express routes
  -> service layer
  -> Neo4j driver
  -> bond_grid graph
```

## Runtime Setup

The API reads Neo4j configuration in `apps/api/src/config/neo4j.ts`. When
`NEO4J_URI` is present, API startup verifies connectivity and ensures the base
graph constraints and indexes exist.

## Initial Graph Constraints

```cypher
CREATE CONSTRAINT person_id_unique IF NOT EXISTS
FOR (person:Person)
REQUIRE person.personId IS UNIQUE;

CREATE CONSTRAINT person_phone_unique IF NOT EXISTS
FOR (person:Person)
REQUIRE person.phone IS UNIQUE;

CREATE INDEX person_normalized_name IF NOT EXISTS
FOR (person:Person)
ON (person.normalizedName);
```

## Notes

- Neo4j is now the graph database of record for BondGrid.
- Business rules still belong in backend services, especially duplicate checks,
  inverse relationship creation, single-parent validation, cycle prevention, and
  merge behavior.
- Relationship type metadata starts in `apps/api/src/models/relationshipTypes.ts`
  and is exposed through `GET /api/graph/relationship-types`.
