export type RelationshipCategory = 'family' | 'friend' | 'social';

export type RelationshipDefinition = {
  code: string;
  label: string;
  inverseCode: string;
  inverseLabel: string;
  category: RelationshipCategory;
  neo4jType: string;
  inverseNeo4jType: string;
  maxIncoming?: number;
  symmetric?: boolean;
};

export const relationshipDefinitions: RelationshipDefinition[] = [
  {
    code: 'father',
    label: 'Father',
    inverseCode: 'child',
    inverseLabel: 'Child',
    category: 'family',
    neo4jType: 'FATHER_OF',
    inverseNeo4jType: 'CHILD_OF',
    maxIncoming: 1,
  },
  {
    code: 'mother',
    label: 'Mother',
    inverseCode: 'child',
    inverseLabel: 'Child',
    category: 'family',
    neo4jType: 'MOTHER_OF',
    inverseNeo4jType: 'CHILD_OF',
    maxIncoming: 1,
  },
  {
    code: 'wife',
    label: 'Wife',
    inverseCode: 'husband',
    inverseLabel: 'Husband',
    category: 'family',
    neo4jType: 'WIFE_OF',
    inverseNeo4jType: 'HUSBAND_OF',
  },
  {
    code: 'husband',
    label: 'Husband',
    inverseCode: 'wife',
    inverseLabel: 'Wife',
    category: 'family',
    neo4jType: 'HUSBAND_OF',
    inverseNeo4jType: 'WIFE_OF',
  },
  {
    code: 'son',
    label: 'Son',
    inverseCode: 'parent',
    inverseLabel: 'Parent',
    category: 'family',
    neo4jType: 'SON_OF',
    inverseNeo4jType: 'PARENT_OF',
  },
  {
    code: 'daughter',
    label: 'Daughter',
    inverseCode: 'parent',
    inverseLabel: 'Parent',
    category: 'family',
    neo4jType: 'DAUGHTER_OF',
    inverseNeo4jType: 'PARENT_OF',
  },
  {
    code: 'brother',
    label: 'Brother',
    inverseCode: 'brother',
    inverseLabel: 'Brother',
    category: 'family',
    neo4jType: 'BROTHER_OF',
    inverseNeo4jType: 'BROTHER_OF',
    symmetric: true,
  },
  {
    code: 'sister',
    label: 'Sister',
    inverseCode: 'sister',
    inverseLabel: 'Sister',
    category: 'family',
    neo4jType: 'SISTER_OF',
    inverseNeo4jType: 'SISTER_OF',
    symmetric: true,
  },
  {
    code: 'friend',
    label: 'Friend',
    inverseCode: 'friend',
    inverseLabel: 'Friend',
    category: 'friend',
    neo4jType: 'FRIEND_OF',
    inverseNeo4jType: 'FRIEND_OF',
    symmetric: true,
  },
  {
    code: 'cousin',
    label: 'Cousin',
    inverseCode: 'cousin',
    inverseLabel: 'Cousin',
    category: 'social',
    neo4jType: 'COUSIN_OF',
    inverseNeo4jType: 'COUSIN_OF',
    symmetric: true,
  },
  {
    code: 'other',
    label: 'Other',
    inverseCode: 'other',
    inverseLabel: 'Other',
    category: 'social',
    neo4jType: 'RELATED_TO',
    inverseNeo4jType: 'RELATED_TO',
    symmetric: true,
  },
];

export function getRelationshipDefinition(code: string) {
  return relationshipDefinitions.find((definition) => definition.code === code);
}
