import { FormEvent } from 'react';

import { Connection, Person, RelationshipType } from '../../types/graph';
import { Modal } from '../ui/Modal';
import { ValidationMessage } from '../ui/ValidationMessage';

type EditConnectionModalProps = {
  connection: Connection;
  people: Person[];
  relationshipTypes: RelationshipType[];
  formMessage: string;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function EditConnectionModal({
  connection,
  people,
  relationshipTypes,
  formMessage,
  onClose,
  onSubmit,
}: EditConnectionModalProps) {
  return (
    <Modal title="Edit Relationship" onClose={onClose}>
      <p className="text-sm text-[#667085]">Modify the existing relationship.</p>
      <form className="mt-5 grid gap-3" onSubmit={onSubmit}>
        <select className="control w-full" name="from" defaultValue={connection.from}>
          {people.map((person) => (
            <option key={person.id} value={person.id}>
              {person.name}
            </option>
          ))}
        </select>
        <select className="control w-full" name="type" defaultValue={connection.type}>
          {relationshipTypes.map((type) => (
            <option key={type.id} value={type.id}>
              {type.label} / {type.reverse}
            </option>
          ))}
        </select>
        <select className="control w-full" name="to" defaultValue={connection.to}>
          {people.map((person) => (
            <option key={person.id} value={person.id}>
              {person.name}
            </option>
          ))}
        </select>
        <ValidationMessage message={formMessage} />
        <button className="primary-button h-11 justify-center" type="submit">
          Update Connection
        </button>
      </form>
    </Modal>
  );
}
