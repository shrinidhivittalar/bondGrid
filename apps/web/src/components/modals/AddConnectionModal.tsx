import { FormEvent } from 'react';

import { Person, RelationshipType } from '../../types/graph';
import { Modal } from '../ui/Modal';
import { ValidationMessage } from '../ui/ValidationMessage';

type AddConnectionModalProps = {
  people: Person[];
  relationshipTypes: RelationshipType[];
  selectedPersonId: string;
  formMessage: string;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function AddConnectionModal({
  people,
  relationshipTypes,
  selectedPersonId,
  formMessage,
  onClose,
  onSubmit,
}: AddConnectionModalProps) {
  return (
    <Modal title="Add Relationship" onClose={onClose}>
      <p className="text-sm text-[#667085]">
        Relationship choices are predefined, self-links are blocked, and reverse labels are inferred
        automatically.
      </p>
      <form className="mt-5 grid gap-3" onSubmit={onSubmit}>
        <select className="control w-full" name="from" defaultValue={selectedPersonId}>
          {people.map((person) => (
            <option key={person.id} value={person.id}>
              {person.name}
            </option>
          ))}
        </select>
        <select className="control w-full" name="type" defaultValue="friend">
          {relationshipTypes.map((type) => (
            <option key={type.id} value={type.id}>
              {type.label} / {type.reverse}
            </option>
          ))}
        </select>
        <select className="control w-full" name="to">
          {people.map((person) => (
            <option key={person.id} value={person.id}>
              {person.name}
            </option>
          ))}
        </select>
        <ValidationMessage message={formMessage} />
        <button className="primary-button h-11 justify-center" type="submit">
          Save Connection
        </button>
      </form>
    </Modal>
  );
}
