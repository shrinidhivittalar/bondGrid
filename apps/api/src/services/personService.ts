import { randomUUID } from 'crypto';

import { getNeo4jSession } from '../config/neo4j';
import { Person, PersonGender, PersonInput, PersonRole, PersonUpdateInput } from '../models/person';
import { createRelationship, getRelationshipsForPerson } from './relationshipService';
import { logActivity } from './auditService';

const searchContexts = new Map<string, { query: string; createdAt: number }>();
const searchContextTtlMs = 15 * 60 * 1000;
const roles = new Set<PersonRole>(['Admin', 'Volunteer', 'Viewer']);
const genders = new Set<PersonGender>(['Female', 'Male', 'Other']);

type CreatePersonOptions = {
  searchContextId?: unknown;
  confirmDuplicate?: unknown;
};

export class PersonValidationError extends Error {
  constructor(
    message: string,
    public readonly statusCode = 400,
    public readonly details?: unknown,
  ) {
    super(message);
  }
}

export async function searchPeople(query: unknown) {
  const searchQuery = String(query ?? '').trim();

  if (!searchQuery) {
    throw new PersonValidationError('Search query is required.');
  }

  const normalizedQuery = normalizeText(searchQuery);
  const normalizedPhone = normalizePhone(searchQuery);
  const session = getNeo4jSession();

  try {
    const result = await session.run(
      `
      MATCH (person:Person)
      WHERE person.normalizedName CONTAINS $normalizedQuery
        OR ($normalizedPhone <> '' AND person.phone CONTAINS $normalizedPhone)
      OPTIONAL MATCH (person)-[relationship]-(:Person)
      RETURN person, count(relationship) AS connectionCount
      ORDER BY person.name ASC
      LIMIT 20
      `,
      { normalizedQuery, normalizedPhone },
    );

    const searchContextId = createSearchContext(normalizedQuery);

    return {
      searchContextId,
      people: result.records.map((record) => ({
        ...toPerson(record.get('person').properties),
        connectionCount: record.get('connectionCount').toNumber(),
      })),
    };
  } finally {
    await session.close();
  }
}

export async function createPerson(input: PersonInput, options: CreatePersonOptions) {
  assertValidSearchContext(options.searchContextId);

  const personInput = normalizePersonInput(input);
  const session = getNeo4jSession();

  try {
    if (personInput.phone) {
      const existing = await session.run('MATCH (person:Person {phone: $phone}) RETURN person LIMIT 1', {
        phone: personInput.phone,
      });

      const existingPerson = existing.records[0]?.get('person');
      if (existingPerson) {
        const p = toPerson(existingPerson.properties);
        await logActivity({
          type: 'PERSON_CREATED',
          description: `Resolved existing person ${p.name} via phone match`,
          personIds: [p.personId],
          metadata: { reusedExisting: true },
        });
        return {
          created: false,
          reusedExisting: true,
          person: p,
        };
      }
    }

    const duplicateCandidates = await findDuplicateCandidates(personInput.normalizedName, personInput.phone);

    if (duplicateCandidates.length > 0 && options.confirmDuplicate !== true) {
      throw new PersonValidationError('Possible duplicate person found.', 409, {
        duplicateCandidates,
      });
    }

    const now = new Date().toISOString();
    const person: Person = {
      personId: randomUUID(),
      name: personInput.name,
      normalizedName: personInput.normalizedName,
      phone: personInput.phone,
      age: personInput.age,
      gender: personInput.gender,
      occupation: personInput.occupation,
      role: personInput.role,
      location: personInput.location,
      notes: personInput.notes,
      status: personInput.isIncomplete ? 'Partial' : 'Complete',
      isIncomplete: personInput.isIncomplete,
      createdAt: now,
      updatedAt: now,
    };

    const result = await session.run(
      `
      CREATE (person:Person {
        personId: $personId,
        name: $name,
        normalizedName: $normalizedName,
        phone: $phone,
        age: $age,
        gender: $gender,
        occupation: $occupation,
        role: $role,
        location: $location,
        notes: $notes,
        status: $status,
        isIncomplete: $isIncomplete,
        createdAt: $createdAt,
        updatedAt: $updatedAt
      })
      RETURN person
      `,
      toNeo4jProperties(person),
    );

    const createdPerson = toPerson(result.records[0].get('person').properties);

    await logActivity({
      type: 'PERSON_CREATED',
      description: `Created person ${createdPerson.name}`,
      personIds: [createdPerson.personId],
      metadata: { reusedExisting: false },
    });

    return {
      created: true,
      reusedExisting: false,
      noConnectionsWarning: true,
      person: createdPerson,
    };
  } finally {
    await session.close();
  }
}

export async function getPerson(personId: string) {
  const session = getNeo4jSession();

  try {
    const result = await session.run(
      `
      MATCH (person:Person {personId: $personId})
      OPTIONAL MATCH (person)-[relationship]-(related:Person)
      RETURN person, collect({
        relationshipType: type(relationship),
        relatedPersonId: related.personId,
        relatedName: related.name,
        relationshipGroupId: relationship.relationshipGroupId
      }) AS connections
      LIMIT 1
      `,
      { personId },
    );

    const record = result.records[0];
    if (!record) {
      throw new PersonValidationError('Person not found.', 404);
    }

    return {
      person: toPerson(record.get('person').properties),
      connections: record
        .get('connections')
        .filter((connection: { relatedPersonId?: string }) => Boolean(connection.relatedPersonId)),
    };
  } finally {
    await session.close();
  }
}

export async function updatePerson(personId: string, input: PersonUpdateInput) {
  const patch = normalizePersonPatch(input);

  if (Object.keys(patch).length === 0) {
    throw new PersonValidationError('At least one editable field is required.');
  }

  const updatedAt = new Date().toISOString();
  const session = getNeo4jSession();

  try {
    if (patch.phone) {
      const existing = await session.run(
        'MATCH (person:Person {phone: $phone}) WHERE person.personId <> $personId RETURN person LIMIT 1',
        { phone: patch.phone, personId },
      );

      if (existing.records.length > 0) {
        throw new PersonValidationError('Phone number already belongs to another person.', 409);
      }
    }

    const result = await session.run(
      `
      MATCH (person:Person {personId: $personId})
      SET person += $patch,
          person.updatedAt = $updatedAt
      RETURN person
      `,
      { personId, patch, updatedAt },
    );

    const record = result.records[0];
    const updated = toPerson(record.get('person').properties);
    await logActivity({
      type: 'PERSON_UPDATED',
      description: `Updated profile for ${updated.name}`,
      personIds: [updated.personId],
      metadata: { patch },
    });

    return updated;
  } finally {
    await session.close();
  }
}

export async function deletePerson(personId: string) {
  const session = getNeo4jSession();

  try {
    const result = await session.run(
      `
      MATCH (person:Person {personId: $personId})
      DETACH DELETE person
      RETURN count(person) AS deletedCount
      `,
      { personId },
    );

    if (result.records[0].get('deletedCount').toNumber() === 0) {
      throw new PersonValidationError('Person not found.', 404);
    }

    await logActivity({
      type: 'PERSON_DELETED',
      description: `Deleted person ID ${personId}`,
      personIds: [personId],
    });
  } finally {
    await session.close();
  }
}

export async function dryRunMerge(sourcePersonId: string, targetPersonId: string) {
  if (sourcePersonId === targetPersonId) {
    throw new PersonValidationError('Cannot merge a person with themselves.');
  }

  const session = getNeo4jSession();

  try {
    const result = await session.run(
      `
      MATCH (source:Person {personId: $sourcePersonId})
      MATCH (target:Person {personId: $targetPersonId})
      OPTIONAL MATCH (source)-[r]-(related:Person)
      WHERE related.personId <> $targetPersonId
      WITH source, target, collect({
        type: type(r),
        direction: CASE WHEN startNode(r) = source THEN 'OUTGOING' ELSE 'INCOMING' END,
        relatedPersonId: related.personId,
        relatedName: related.name,
        relationshipGroupId: r.relationshipGroupId
      }) AS movingRelationships
      RETURN source, target, movingRelationships
      `,
      { sourcePersonId, targetPersonId },
    );

    const record = result.records[0];
    if (!record) {
      throw new PersonValidationError('One or both people not found.', 404);
    }

    const source = toPerson(record.get('source').properties);
    const target = toPerson(record.get('target').properties);
    const movingRelationships = record.get('movingRelationships');

    return {
      source,
      target,
      movingRelationships,
      impact: {
        relationshipCount: movingRelationships.length,
      },
    };
  } finally {
    await session.close();
  }
}

export async function executeMerge(sourcePersonId: string, targetPersonId: string) {
  if (sourcePersonId === targetPersonId) {
    throw new PersonValidationError('Cannot merge a person with themselves.');
  }

  const session = getNeo4jSession();

  try {
    // 1. Fetch relationships to be moved
    const { relationships } = await getRelationshipsForPerson(sourcePersonId);

    // 2. Rebind relationships to the target person
    const failedRebinds: Array<{ relationshipGroupId: string; relatedPersonId: string; reason: string }> = [];

    for (const rel of relationships) {
      try {
        await createRelationship({
          fromPersonId: targetPersonId,
          toPersonId: rel.relatedPersonId,
          relationshipType: rel.relationshipType,
        });
      } catch (error) {
        failedRebinds.push({
          relationshipGroupId: rel.relationshipGroupId,
          relatedPersonId: rel.relatedPersonId,
          reason: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // 3. Mark source as merged and remove its connections
    await session.run(
      `
      MATCH (source:Person {personId: $sourcePersonId})
      SET source.status = 'Merged',
          source.mergedIntoPersonId = $targetPersonId,
          source.updatedAt = $updatedAt
      WITH source
      OPTIONAL MATCH (source)-[r]-()
      DELETE r
      `,
      {
        sourcePersonId,
        targetPersonId,
        updatedAt: new Date().toISOString(),
      },
    );

    await logActivity({
      type: 'PEOPLE_MERGED',
      description: `Merged person ID ${sourcePersonId} into ${targetPersonId}`,
      personIds: [sourcePersonId, targetPersonId],
      metadata: {
        sourcePersonId,
        targetPersonId,
        relationshipCount: relationships.length,
        reboundCount: relationships.length - failedRebinds.length,
        failedRebindCount: failedRebinds.length,
      },
    });

    return {
      success: true,
      reboundCount: relationships.length - failedRebinds.length,
      failedRebinds,
    };
  } finally {
    await session.close();
  }
}

async function findDuplicateCandidates(normalizedName: string, phone?: string) {
  const session = getNeo4jSession();

  try {
    const result = await session.run(
      `
      MATCH (person:Person)
      WHERE person.normalizedName = $normalizedName
        OR person.normalizedName CONTAINS $normalizedName
        OR $normalizedName CONTAINS person.normalizedName
        OR ($phone IS NOT NULL AND person.phone = $phone)
      RETURN person
      ORDER BY person.name ASC
      LIMIT 5
      `,
      { normalizedName, phone: phone ?? null },
    );

    return result.records.map((record) => toPerson(record.get('person').properties));
  } finally {
    await session.close();
  }
}

function normalizePersonInput(input: PersonInput) {
  const name = asTrimmedString(input.name);

  if (!name) {
    throw new PersonValidationError('Name is required.');
  }

  const phone = normalizePhone(input.phone);
  const occupation = asTrimmedString(input.occupation);
  const location = asTrimmedString(input.location);
  const notes = asTrimmedString(input.notes);
  const age = normalizeAge(input.age);
  const gender = normalizeGender(input.gender);
  const role = normalizeRole(input.role);

  return {
    name,
    normalizedName: normalizeText(name),
    phone: phone || undefined,
    age,
    gender,
    occupation: occupation || undefined,
    role,
    location: location || undefined,
    notes: notes || undefined,
    isIncomplete: !phone || !age || !gender || !occupation || !location,
  };
}

function normalizePersonPatch(input: PersonUpdateInput) {
  const patch: Record<string, string | number | boolean | null> = {};

  if ('name' in input) {
    const name = asTrimmedString(input.name);
    if (!name) {
      throw new PersonValidationError('Name cannot be empty.');
    }
    patch.name = name;
    patch.normalizedName = normalizeText(name);
  }

  if ('phone' in input) {
    patch.phone = normalizePhone(input.phone) || null;
  }

  if ('age' in input) {
    patch.age = normalizeAge(input.age) ?? null;
  }

  if ('gender' in input) {
    patch.gender = normalizeGender(input.gender) ?? null;
  }

  if ('occupation' in input) {
    patch.occupation = asTrimmedString(input.occupation) || null;
  }

  if ('role' in input) {
    patch.role = normalizeRole(input.role);
  }

  if ('location' in input) {
    patch.location = asTrimmedString(input.location) || null;
  }

  if ('notes' in input) {
    patch.notes = asTrimmedString(input.notes) || null;
  }

  return patch;
}

function createSearchContext(query: string) {
  pruneExpiredSearchContexts();
  const searchContextId = randomUUID();
  searchContexts.set(searchContextId, { query, createdAt: Date.now() });
  return searchContextId;
}

function assertValidSearchContext(searchContextId: unknown) {
  pruneExpiredSearchContexts();

  if (process.env.ALLOW_DIRECT_PERSON_CREATE === 'true') {
    return;
  }

  if (typeof searchContextId !== 'string' || !searchContexts.has(searchContextId)) {
    throw new PersonValidationError('A valid searchContextId is required before creating a person.', 428);
  }
}

function pruneExpiredSearchContexts() {
  const cutoff = Date.now() - searchContextTtlMs;

  for (const [searchContextId, context] of searchContexts.entries()) {
    if (context.createdAt < cutoff) {
      searchContexts.delete(searchContextId);
    }
  }
}

function normalizeText(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ');
}

function normalizePhone(value: unknown) {
  return String(value ?? '').replace(/\D/g, '');
}

function asTrimmedString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeAge(value: unknown) {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const age = Number(value);

  if (!Number.isInteger(age) || age < 0 || age > 130) {
    throw new PersonValidationError('Age must be a whole number between 0 and 130.');
  }

  return age;
}

function normalizeGender(value: unknown) {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (!genders.has(value as PersonGender)) {
    throw new PersonValidationError('Gender must be Female, Male, or Other.');
  }

  return value as PersonGender;
}

function normalizeRole(value: unknown) {
  if (value === undefined || value === null || value === '') {
    return 'Viewer';
  }

  if (!roles.has(value as PersonRole)) {
    throw new PersonValidationError('Role must be Admin, Volunteer, or Viewer.');
  }

  return value as PersonRole;
}

function toPerson(properties: Record<string, unknown>): Person {
  return {
    personId: String(properties.personId),
    name: String(properties.name),
    normalizedName: String(properties.normalizedName),
    phone: optionalString(properties.phone),
    age: optionalNumber(properties.age),
    gender: optionalGender(properties.gender),
    occupation: optionalString(properties.occupation),
    role: normalizeRole(properties.role),
    location: optionalString(properties.location),
    notes: optionalString(properties.notes),
    status: properties.status === 'Complete' || properties.status === 'Duplicate risk' ? properties.status : 'Partial',
    isIncomplete: properties.isIncomplete === true,
    createdAt: String(properties.createdAt),
    updatedAt: String(properties.updatedAt),
  };
}

function toNeo4jProperties(person: Person) {
  return {
    ...person,
    phone: person.phone ?? null,
    age: person.age ?? null,
    gender: person.gender ?? null,
    occupation: person.occupation ?? null,
    location: person.location ?? null,
    notes: person.notes ?? null,
  };
}

function optionalString(value: unknown) {
  return typeof value === 'string' && value ? value : undefined;
}

function optionalNumber(value: unknown) {
  if (typeof value === 'number') {
    return value;
  }

  if (value && typeof value === 'object' && 'toNumber' in value && typeof value.toNumber === 'function') {
    return value.toNumber() as number;
  }

  return undefined;
}

function optionalGender(value: unknown) {
  return genders.has(value as PersonGender) ? (value as PersonGender) : undefined;
}
