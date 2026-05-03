# Data API

This document tracks API routes and data contracts.

## Base URLs

```text
Local API: http://localhost:3333
Local Web: http://localhost:3000
```

## Environment

```env
NEXT_PUBLIC_API_URL=http://localhost:3333
NEO4J_URI=neo4j://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=password
NEO4J_DATABASE=bondgrid
ALLOW_DIRECT_PERSON_CREATE=false
```

## Current Routes

### Health

```http
GET /api/health
```

Response:

```json
{
  "ok": true,
  "service": "bond_grid-api",
  "neo4j": {
    "configured": true,
    "connected": true
  }
}
```

### Relationship Types

```http
GET /api/graph/relationship-types
```

Returns the backend-managed relationship catalog, including inverse mapping and
Neo4j relationship type names.

### Graph Network

```http
GET /api/graph/network
```

Returns all current `Person` nodes and one frontend-friendly connection per
managed relationship pair. The web app uses this endpoint to load Neo4j data
into the graph view.

### Search People

```http
GET /api/people/search?q=ravi
```

Returns matching people and a short-lived `searchContextId`. Person creation
requires this context unless `ALLOW_DIRECT_PERSON_CREATE=true` is set for local
development.

```json
{
  "searchContextId": "a10ec3b5-8fd7-4217-bc7e-463d98307dbd",
  "people": [
    {
      "personId": "person-uuid",
      "name": "Ravi Sharma",
      "phone": "9876543210",
      "status": "Complete",
      "isIncomplete": false,
      "connectionCount": 4
    }
  ]
}
```

### Create Person

```http
POST /api/people
```

Request:

```json
{
  "searchContextId": "a10ec3b5-8fd7-4217-bc7e-463d98307dbd",
  "name": "Ravi Sharma",
  "phone": "9876543210",
  "age": 34,
  "gender": "Male",
  "occupation": "Software Consultant",
  "role": "Volunteer",
  "location": "Bangalore, Karnataka",
  "notes": "Community volunteer"
}
```

If the phone number already exists, the API reuses the existing person instead
of creating a duplicate. If possible name duplicates exist, the API returns
`409` with `duplicateCandidates`; resend with `confirmDuplicate: true` only
after the user confirms this is a different person.

### Get Person

```http
GET /api/people/{personId}
```

Returns the person and lightweight connection summaries.

### Update Person

```http
PATCH /api/people/{personId}
```

Accepts editable profile fields such as `name`, `phone`, `age`, `gender`,
`occupation`, `role`, `location`, and `notes`.

### Create Relationship

```http
POST /api/relationships
```

Request:

```json
{
  "fromPersonId": "person-uuid-1",
  "toPersonId": "person-uuid-2",
  "relationshipType": "father"
}
```

Creates the forward and inverse Neo4j relationships in one transaction with the
same `relationshipGroupId`.

Example graph result:

```cypher
(from)-[:FATHER_OF {relationshipGroupId}]->(to)
(to)-[:CHILD_OF {relationshipGroupId}]->(from)
```

The API rejects self-relationships, unsupported relationship types, duplicate
connections between the same two people, multiple father/mother assignments,
and circular parent-child relationships.

### Get Person Relationships

```http
GET /api/relationships/person/{personId}
```

Returns the selected person's outgoing perspective relationships. Because the
API writes inverse pairs, each person has their own readable outgoing edge.

### Delete Relationship

```http
DELETE /api/relationships/{relationshipGroupId}
```

Deletes both managed edges for the logical relationship pair.

## Planned Data Areas

- Relationship editing
- Duplicate merge dry-run and execution
- Audit and activity records

