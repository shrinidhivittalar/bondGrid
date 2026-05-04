import { Connection, NetworkConnection, NetworkPerson, Person } from '../types/graph';

export function toUiPerson(person: NetworkPerson, index = 0): Person {
  return {
    id: person.personId,
    name: person.name,
    phone: person.phone ?? 'Not provided',
    age: person.age,
    gender: person.gender ?? 'Other',
    occupation: person.occupation ?? 'Not specified',
    role: person.role ?? 'Viewer',
    location: person.location ?? 'Location pending',
    joined: person.createdAt
      ? new Date(person.createdAt).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      : 'Today',
    notes: person.notes ?? 'Progressive profile entry started.',
    status: person.status ?? 'Partial',
    x: 160 + ((index * 170) % 720),
    y: 140 + ((index * 120) % 520),
  };
}

export function toUiConnection(connection: NetworkConnection, index: number): Connection {
  return {
    id: `${connection.fromPersonId}-${connection.toPersonId}-${index}`,
    from: connection.fromPersonId,
    to: connection.toPersonId,
    type: connection.relationshipType,
    relationshipGroupId: connection.relationshipGroupId,
    createdBy: 'BondGrid API',
    updatedAt: connection.updatedAt
      ? new Date(connection.updatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
      : 'Today',
  };
}

export function samePair(connection: Connection, from: string, to: string): boolean {
  return (connection.from === from && connection.to === to) || (connection.from === to && connection.to === from);
}

export function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
