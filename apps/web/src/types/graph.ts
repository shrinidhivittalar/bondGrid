export type RelationshipCategory = 'family' | 'friend' | 'social';
export type Role = 'Admin' | 'Volunteer' | 'Viewer';
export type PersonStatus = 'Complete' | 'Partial' | 'Duplicate risk';

export type IconName =
  | 'network'
  | 'people'
  | 'link'
  | 'person-plus'
  | 'reports'
  | 'settings'
  | 'search'
  | 'plus'
  | 'bell'
  | 'menu'
  | 'more'
  | 'phone'
  | 'pin'
  | 'calendar'
  | 'edit'
  | 'trash'
  | 'heart'
  | 'merge'
  | 'target'
  | 'zoom-in'
  | 'zoom-out'
  | 'fit'
  | 'users';

export type RelationshipType = {
  id: string;
  label: string;
  reverse: string;
  category: RelationshipCategory;
  color: string;
  tint: string;
  icon: IconName;
  maxIncoming?: number;
};

export type Person = {
  id: string;
  name: string;
  phone: string;
  age?: number;
  gender: 'Female' | 'Male' | 'Other';
  occupation: string;
  role: Role;
  location: string;
  joined: string;
  notes: string;
  status: PersonStatus;
  x: number;
  y: number;
};

export type Connection = {
  id: string;
  from: string;
  to: string;
  type: string;
  createdBy: string;
  updatedAt: string;
  relationshipGroupId?: string;
};

export type NetworkPerson = {
  personId: string;
  name: string;
  phone?: string;
  age?: number;
  gender?: Person['gender'];
  occupation?: string;
  role?: Role;
  location?: string;
  notes?: string;
  status?: PersonStatus;
  createdAt?: string;
};

export type NetworkConnection = {
  fromPersonId: string;
  toPersonId: string;
  relationshipType: string;
  relationshipLabel: string;
  relationshipGroupId?: string;
  createdAt: string;
  updatedAt: string;
};

export type NetworkResponse = {
  people: NetworkPerson[];
  connections: NetworkConnection[];
};

export type SearchPeopleResponse = {
  searchContextId: string;
};

export type CreatePersonResponse = {
  person: NetworkPerson;
};

export type ActiveModal = 'person' | 'connection' | 'edit-connection' | 'merge' | null;
