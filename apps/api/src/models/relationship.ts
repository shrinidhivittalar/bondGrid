export type RelationshipInput = {
  fromPersonId?: unknown;
  toPersonId?: unknown;
  relationshipType?: unknown;
};

export type RelationshipSummary = {
  relationshipGroupId: string;
  relationshipType: string;
  relationshipLabel: string;
  neo4jType: string;
  direction: 'outgoing' | 'incoming';
  relatedPersonId: string;
  relatedName: string;
  createdAt: string;
  updatedAt: string;
};
