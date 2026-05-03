export type PersonRole = 'Admin' | 'Volunteer' | 'Viewer';
export type PersonStatus = 'Complete' | 'Partial' | 'Duplicate risk';
export type PersonGender = 'Female' | 'Male' | 'Other';

export type Person = {
  personId: string;
  name: string;
  normalizedName: string;
  phone?: string;
  age?: number;
  gender?: PersonGender;
  occupation?: string;
  role: PersonRole;
  location?: string;
  notes?: string;
  status: PersonStatus;
  isIncomplete: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PersonInput = {
  name?: unknown;
  phone?: unknown;
  age?: unknown;
  gender?: unknown;
  occupation?: unknown;
  role?: unknown;
  location?: unknown;
  notes?: unknown;
};

export type PersonUpdateInput = Partial<PersonInput>;
