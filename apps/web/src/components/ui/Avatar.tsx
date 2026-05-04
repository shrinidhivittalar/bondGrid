import { Person } from '../../types/graph';

export function Avatar({ person, size }: { person: Person; size: 'sm' | 'md' | 'lg' }) {
  const initials = person.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2);

  const dimension =
    size === 'lg' ? 'h-24 w-24 text-2xl' : size === 'md' ? 'h-16 w-16 text-lg' : 'h-10 w-10 text-sm';

  const ring = person.gender === 'Female' ? '#f43f5e' : person.role === 'Admin' ? '#16a34a' : '#0f7cff';

  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full border-2 bg-[linear-gradient(135deg,#fff6ed,#f4d1aa)] font-bold text-[#3b2415] shadow-sm ${dimension}`}
      style={{ borderColor: ring }}
      title={person.name}
    >
      {initials}
    </span>
  );
}
