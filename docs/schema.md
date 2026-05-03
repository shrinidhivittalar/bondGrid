# Neo4j Graph Schema

This document tracks the Neo4j graph schema direction for `bond_grid`.

## Reference

See [Neo4j Database Reference](./NEO4J-DB.md) for setup notes.

## Conventions

- Use `personId` as the stable public identifier for `Person` nodes.
- Use ISO timestamp strings for `createdAt` and `updatedAt`.
- Keep relationship types predefined in backend metadata.
- Create inverse relationship pairs in one backend transaction.
- Keep graph write validation in API services, not in the frontend.

## Initial Constraints

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

## Core Node

```cypher
(:Person {
  personId,
  name,
  normalizedName,
  phone,
  age,
  gender,
  occupation,
  role,
  location,
  notes,
  status,
  createdAt,
  updatedAt
})
```

## Core Relationships

People are connected by predefined relationship types such as `FATHER_OF`,
`MOTHER_OF`, `CHILD_OF`, `HUSBAND_OF`, `WIFE_OF`, `FRIEND_OF`, `BROTHER_OF`,
`SISTER_OF`, `COUSIN_OF`, and `RELATED_TO`.

Every logical user-created relationship should carry a `relationshipGroupId` so
the forward and inverse edges can be edited or deleted together.

