import { FormEvent } from 'react';

import { Modal } from '../ui/Modal';
import { ValidationMessage } from '../ui/ValidationMessage';

type AddPersonModalProps = {
  globalSearch: string;
  formMessage: string;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function AddPersonModal({ globalSearch, formMessage, onClose, onSubmit }: AddPersonModalProps) {
  return (
    <Modal title="Search Before Create" onClose={onClose}>
      <p className="text-sm text-[#667085]">
        The PRD requires duplicate checks before creation. Enter name and phone; the UI blocks existing phone
        numbers.
      </p>
      <form className="mt-5 grid gap-3" onSubmit={onSubmit}>
        <input className="control w-full" name="name" placeholder="Full name" defaultValue={globalSearch} />
        <input className="control w-full" name="phone" placeholder="Unique phone number" />
        <div className="grid gap-3 sm:grid-cols-2">
          <input className="control w-full" name="age" placeholder="Age optional" type="number" />
          <select className="control w-full" name="gender" defaultValue="Male">
            {['Female', 'Male', 'Other'].map((gender) => (
              <option key={gender} value={gender}>
                {gender}
              </option>
            ))}
          </select>
        </div>
        <input className="control w-full" name="occupation" placeholder="Occupation" />
        <input className="control w-full" name="location" placeholder="Location" />
        <select className="control w-full" name="role" defaultValue="Volunteer">
          {['Admin', 'Volunteer', 'Viewer'].map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
        <textarea className="control min-h-24 w-full py-3" name="notes" placeholder="Notes" />
        <ValidationMessage message={formMessage} />
        <button className="primary-button h-11 justify-center" type="submit">
          Create Person
        </button>
      </form>
    </Modal>
  );
}
