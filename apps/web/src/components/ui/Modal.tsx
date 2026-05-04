import React from 'react';

import { Icon } from './Icon';

export function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#101827]/35 p-4">
      <section className="w-full max-w-lg rounded-lg bg-white p-5 shadow-2xl">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-bold">{title}</h2>
          <button className="icon-button" type="button" aria-label="Close modal" onClick={onClose}>
            <Icon name="plus" className="rotate-45" />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}
