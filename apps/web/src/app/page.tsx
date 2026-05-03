'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';

import { apiClient } from '../services/apiClient';

type RelationshipCategory = 'family' | 'friend' | 'social';
type Role = 'Admin' | 'Volunteer' | 'Viewer';
type PersonStatus = 'Complete' | 'Partial' | 'Duplicate risk';

type RelationshipType = {
  id: string;
  label: string;
  reverse: string;
  category: RelationshipCategory;
  color: string;
  tint: string;
  icon: IconName;
  maxIncoming?: number;
};

type Person = {
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

type Connection = {
  id: string;
  from: string;
  to: string;
  type: string;
  createdBy: string;
  updatedAt: string;
};

type NetworkPerson = {
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

type NetworkConnection = {
  fromPersonId: string;
  toPersonId: string;
  relationshipType: string;
  relationshipLabel: string;
  createdAt: string;
  updatedAt: string;
};

type NetworkResponse = {
  people: NetworkPerson[];
  connections: NetworkConnection[];
};

type SearchPeopleResponse = {
  searchContextId: string;
};

type CreatePersonResponse = {
  person: NetworkPerson;
};

type IconName =
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

const relationshipTypes: RelationshipType[] = [
  {
    id: 'father',
    label: 'Father',
    reverse: 'Child',
    category: 'family',
    color: '#16a34a',
    tint: '#dcfce7',
    icon: 'people',
    maxIncoming: 1,
  },
  {
    id: 'mother',
    label: 'Mother',
    reverse: 'Child',
    category: 'family',
    color: '#f43f5e',
    tint: '#ffe4e6',
    icon: 'people',
    maxIncoming: 1,
  },
  {
    id: 'wife',
    label: 'Wife',
    reverse: 'Husband',
    category: 'family',
    color: '#ec4899',
    tint: '#fce7f3',
    icon: 'heart',
  },
  {
    id: 'husband',
    label: 'Husband',
    reverse: 'Wife',
    category: 'family',
    color: '#0f7cff',
    tint: '#dbeafe',
    icon: 'users',
  },
  {
    id: 'son',
    label: 'Son',
    reverse: 'Parent',
    category: 'family',
    color: '#f97316',
    tint: '#ffedd5',
    icon: 'person-plus',
  },
  {
    id: 'daughter',
    label: 'Daughter',
    reverse: 'Parent',
    category: 'family',
    color: '#f43f5e',
    tint: '#ffe4e6',
    icon: 'person-plus',
  },
  {
    id: 'brother',
    label: 'Brother',
    reverse: 'Brother',
    category: 'family',
    color: '#16a34a',
    tint: '#dcfce7',
    icon: 'people',
  },
  {
    id: 'sister',
    label: 'Sister',
    reverse: 'Sister',
    category: 'family',
    color: '#8b5cf6',
    tint: '#ede9fe',
    icon: 'people',
  },
  {
    id: 'friend',
    label: 'Friend',
    reverse: 'Friend',
    category: 'friend',
    color: '#16a34a',
    tint: '#dcfce7',
    icon: 'people',
  },
  {
    id: 'cousin',
    label: 'Cousin',
    reverse: 'Cousin',
    category: 'social',
    color: '#8b5cf6',
    tint: '#f3e8ff',
    icon: 'users',
  },
  {
    id: 'other',
    label: 'Other',
    reverse: 'Other',
    category: 'social',
    color: '#64748b',
    tint: '#f1f5f9',
    icon: 'link',
  },
];

const initialPeople: Person[] = [
  {
    id: 'ravi',
    name: 'Ravi Sharma',
    phone: '9876543210',
    age: 34,
    gender: 'Male',
    occupation: 'Software Consultant',
    role: 'Volunteer',
    location: 'Bangalore, Karnataka',
    joined: '12 Jan 2024',
    notes: 'Coordinates community member onboarding and relationship cleanup.',
    status: 'Complete',
    x: 500,
    y: 320,
  },
  {
    id: 'ramesh',
    name: 'Ramesh Sharma',
    phone: '9876543101',
    age: 67,
    gender: 'Male',
    occupation: 'Retired Teacher',
    role: 'Admin',
    location: 'Mysore, Karnataka',
    joined: '02 Feb 2023',
    notes: 'Senior community coordinator.',
    status: 'Complete',
    x: 500,
    y: 130,
  },
  {
    id: 'lakshmi',
    name: 'Lakshmi Sharma',
    phone: '9876543102',
    age: 63,
    gender: 'Female',
    occupation: 'Homemaker',
    role: 'Viewer',
    location: 'Mysore, Karnataka',
    joined: '02 Feb 2023',
    notes: 'Family elder.',
    status: 'Complete',
    x: 240,
    y: 130,
  },
  {
    id: 'shena',
    name: 'Shena Sharma',
    phone: '9876543220',
    age: 32,
    gender: 'Female',
    occupation: 'Architect',
    role: 'Volunteer',
    location: 'Bangalore, Karnataka',
    joined: '18 Feb 2024',
    notes: 'Assists with family verification.',
    status: 'Complete',
    x: 190,
    y: 310,
  },
  {
    id: 'aarav',
    name: 'Aarav Sharma',
    phone: '9876543230',
    age: 11,
    gender: 'Male',
    occupation: 'Student',
    role: 'Viewer',
    location: 'Bangalore, Karnataka',
    joined: '12 Jan 2024',
    notes: 'Child profile with minimal details.',
    status: 'Partial',
    x: 410,
    y: 530,
  },
  {
    id: 'advik',
    name: 'Advik Sharma',
    phone: '9876543240',
    age: 9,
    gender: 'Male',
    occupation: 'Student',
    role: 'Viewer',
    location: 'Bangalore, Karnataka',
    joined: '12 Jan 2024',
    notes: 'Child profile with minimal details.',
    status: 'Partial',
    x: 610,
    y: 530,
  },
  {
    id: 'rahul',
    name: 'Rahul Verma',
    phone: '9876543250',
    age: 35,
    gender: 'Male',
    occupation: 'Designer',
    role: 'Volunteer',
    location: 'Bangalore, Karnataka',
    joined: '08 Mar 2024',
    notes: 'Known friend from temple activities.',
    status: 'Complete',
    x: 800,
    y: 320,
  },
  {
    id: 'priya',
    name: 'Priya Patel',
    phone: '9876543260',
    age: 30,
    gender: 'Female',
    occupation: 'Doctor',
    role: 'Viewer',
    location: 'Chennai, Tamil Nadu',
    joined: '21 Mar 2024',
    notes: 'Extended family connection.',
    status: 'Complete',
    x: 850,
    y: 530,
  },
  {
    id: 'meena',
    name: 'Meena Iyer',
    phone: '9876543270',
    age: 31,
    gender: 'Female',
    occupation: 'Researcher',
    role: 'Volunteer',
    location: 'Bangalore, Karnataka',
    joined: '26 Mar 2024',
    notes: 'Possible duplicate requires review after spelling check.',
    status: 'Duplicate risk',
    x: 220,
    y: 530,
  },
  {
    id: 'suresh',
    name: 'Suresh Patel',
    phone: '9876543280',
    age: 38,
    gender: 'Male',
    occupation: 'Business Owner',
    role: 'Viewer',
    location: 'Hubli, Karnataka',
    joined: '09 Apr 2024',
    notes: 'Sibling connection for Ramesh.',
    status: 'Complete',
    x: 750,
    y: 140,
  },
  {
    id: 'venkatesh',
    name: 'Venkatesh Iyer',
    phone: '9876543290',
    age: 41,
    gender: 'Male',
    occupation: 'Event Lead',
    role: 'Volunteer',
    location: 'Bangalore, Karnataka',
    joined: '18 Apr 2024',
    notes: 'Friend of the children through family events.',
    status: 'Partial',
    x: 520,
    y: 680,
  },
];

const initialConnections: Connection[] = [
  { id: 'c1', from: 'ramesh', to: 'ravi', type: 'father', createdBy: 'Guruji', updatedAt: 'Today' },
  { id: 'c2', from: 'lakshmi', to: 'ramesh', type: 'wife', createdBy: 'Guruji', updatedAt: 'Today' },
  { id: 'c3', from: 'shena', to: 'ravi', type: 'wife', createdBy: 'Guruji', updatedAt: 'Today' },
  { id: 'c4', from: 'ravi', to: 'aarav', type: 'son', createdBy: 'Guruji', updatedAt: 'Today' },
  { id: 'c5', from: 'ravi', to: 'advik', type: 'son', createdBy: 'Guruji', updatedAt: 'Today' },
  { id: 'c6', from: 'ravi', to: 'rahul', type: 'friend', createdBy: 'Guruji', updatedAt: 'Yesterday' },
  { id: 'c7', from: 'rahul', to: 'priya', type: 'sister', createdBy: 'Guruji', updatedAt: 'Yesterday' },
  { id: 'c8', from: 'ravi', to: 'meena', type: 'cousin', createdBy: 'Guruji', updatedAt: 'Yesterday' },
  { id: 'c9', from: 'ramesh', to: 'suresh', type: 'brother', createdBy: 'Guruji', updatedAt: '12 Apr' },
  { id: 'c10', from: 'aarav', to: 'venkatesh', type: 'friend', createdBy: 'Guruji', updatedAt: '12 Apr' },
  { id: 'c11', from: 'advik', to: 'venkatesh', type: 'friend', createdBy: 'Guruji', updatedAt: '12 Apr' },
];

const navItems: Array<{ label: string; icon: IconName }> = [
  { label: 'Network View', icon: 'network' },
  { label: 'People', icon: 'people' },
  { label: 'Connections', icon: 'link' },
  { label: 'Add Person', icon: 'person-plus' },
  { label: 'Reports', icon: 'reports' },
  { label: 'Settings', icon: 'settings' },
];

const graphSize = { width: 1000, height: 760 };

export default function IndexPage() {
  const [people, setPeople] = useState<Person[]>(initialPeople);
  const [connections, setConnections] = useState<Connection[]>(initialConnections);
  const [selectedId, setSelectedId] = useState('ravi');
  const [globalSearch, setGlobalSearch] = useState('');
  const [networkSearch, setNetworkSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | RelationshipCategory>('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: -20 });
  const [activeModal, setActiveModal] = useState<'person' | 'connection' | 'merge' | null>(null);
  const [formMessage, setFormMessage] = useState('');

  async function loadNetwork() {
    const network = await apiClient.get<NetworkResponse>('/api/graph/network');

    if (network.people.length === 0) {
      return;
    }

    const nextPeople = network.people.map(toUiPerson);

    setPeople(nextPeople);
    setConnections(network.connections.map(toUiConnection));
    setSelectedId((current) => (nextPeople.some((person) => person.id === current) ? current : nextPeople[0].id));
  }

  useEffect(() => {
    loadNetwork().catch(() => {
      setFormMessage('Using demo data because the API graph could not be loaded.');
    });
  }, []);

  const typeById = useMemo(
    () => new Map(relationshipTypes.map((type) => [type.id, type])),
    [],
  );

  const peopleById = useMemo(() => new Map(people.map((person) => [person.id, person])), [people]);
  const selectedPerson = peopleById.get(selectedId) ?? people[0];

  const filteredConnections = useMemo(() => {
    return connections.filter((connection) => {
      const type = typeById.get(connection.type);
      const source = peopleById.get(connection.from);
      const target = peopleById.get(connection.to);
      const haystack = `${source?.name ?? ''} ${target?.name ?? ''} ${type?.label ?? ''}`.toLowerCase();
      return (
        (!type || categoryFilter === 'all' || type.category === categoryFilter) &&
        (typeFilter === 'all' || connection.type === typeFilter) &&
        (!networkSearch.trim() || haystack.includes(networkSearch.toLowerCase()))
      );
    });
  }, [categoryFilter, connections, networkSearch, peopleById, typeById, typeFilter]);

  const visiblePeople = useMemo(() => {
    const ids = new Set<string>();
    filteredConnections.forEach((connection) => {
      ids.add(connection.from);
      ids.add(connection.to);
    });

    return people.filter((person) => {
      const matchesSearch =
        !networkSearch.trim() ||
        `${person.name} ${person.phone} ${person.location} ${person.role}`
          .toLowerCase()
          .includes(networkSearch.toLowerCase());
      return ids.has(person.id) || matchesSearch || person.id === selectedPerson.id;
    });
  }, [filteredConnections, networkSearch, people, selectedPerson.id]);

  const selectedConnections = useMemo(() => {
    return connections.filter(
      (connection) => connection.from === selectedPerson.id || connection.to === selectedPerson.id,
    );
  }, [connections, selectedPerson.id]);

  const duplicateRisks = useMemo(() => {
    const byPhone = people.reduce<Record<string, Person[]>>((acc, person) => {
      acc[person.phone] = [...(acc[person.phone] ?? []), person];
      return acc;
    }, {});

    return people.filter(
      (person) => person.status === 'Duplicate risk' || (byPhone[person.phone]?.length ?? 0) > 1,
    );
  }, [people]);

  const summaryItems = useMemo(
    () => [
      { label: 'Total People', value: people.length, icon: 'people' as IconName, tone: '#f97316' },
      { label: 'Connections', value: connections.length, icon: 'link' as IconName, tone: '#16a34a' },
      {
        label: 'Families',
        value: connections.filter((connection) => typeById.get(connection.type)?.category === 'family').length,
        icon: 'users' as IconName,
        tone: '#8b5cf6',
      },
      { label: 'Merge Queue', value: duplicateRisks.length, icon: 'merge' as IconName, tone: '#0f7cff' },
    ],
    [connections, duplicateRisks.length, people.length, typeById],
  );

  const globalResults = useMemo(() => {
    const query = globalSearch.trim().toLowerCase();
    if (!query) {
      return [];
    }

    return people
      .filter((person) => `${person.name} ${person.phone}`.toLowerCase().includes(query))
      .slice(0, 5);
  }, [globalSearch, people]);

  function resetFilters() {
    setNetworkSearch('');
    setCategoryFilter('all');
    setTypeFilter('all');
  }

  function deleteSelectedPerson() {
    if (people.length <= 1) {
      return;
    }

    const fallback = people.find((person) => person.id !== selectedPerson.id);
    setConnections((current) =>
      current.filter((connection) => connection.from !== selectedPerson.id && connection.to !== selectedPerson.id),
    );
    setPeople((current) => current.filter((person) => person.id !== selectedPerson.id));
    setSelectedId(fallback?.id ?? '');
  }

  async function addPerson(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get('name') ?? '').trim();
    const phone = String(form.get('phone') ?? '').trim();

    if (!name || !phone) {
      setFormMessage('Name and phone are required before creating a profile.');
      return;
    }

    if (people.some((person) => person.phone === phone)) {
      setFormMessage('Duplicate warning: this phone number already exists.');
      return;
    }

    try {
      const search = await apiClient.get<SearchPeopleResponse>(`/api/people/search?q=${encodeURIComponent(name)}`);
      const result = await apiClient.post<CreatePersonResponse>('/api/people', {
        searchContextId: search.searchContextId,
        name,
        phone,
        age: Number(form.get('age')) || undefined,
        gender: String(form.get('gender')),
        occupation: String(form.get('occupation') ?? ''),
        role: String(form.get('role')),
        location: String(form.get('location') ?? ''),
        notes: String(form.get('notes') ?? ''),
      });
      const nextPerson = toUiPerson(result.person, people.length);

      setPeople((current) => (current.some((person) => person.id === nextPerson.id) ? current : [...current, nextPerson]));
      setSelectedId(nextPerson.id);
      await loadNetwork();
      setActiveModal(null);
      setFormMessage('');
    } catch (error) {
      setFormMessage(error instanceof Error ? error.message : 'Could not create person.');
    }
  }

  async function addConnection(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const from = String(form.get('from'));
    const to = String(form.get('to'));
    const type = String(form.get('type'));
    const relationshipType = typeById.get(type);

    if (from === to) {
      setFormMessage('Self-relationships are not allowed.');
      return;
    }

    if (connections.some((connection) => samePair(connection, from, to))) {
      setFormMessage('Duplicate warning: these two people are already connected.');
      return;
    }

    if (
      relationshipType?.maxIncoming &&
      connections.some((connection) => connection.to === to && connection.type === relationshipType.id)
    ) {
      setFormMessage(`Validation blocked: only one ${relationshipType.label.toLowerCase()} is allowed.`);
      return;
    }

    try {
      await apiClient.post('/api/relationships', {
        fromPersonId: from,
        toPersonId: to,
        relationshipType: type,
      });
      await loadNetwork();
      setSelectedId(from);
      setActiveModal(null);
      setFormMessage('');
    } catch (error) {
      setFormMessage(error instanceof Error ? error.message : 'Could not create relationship.');
    }
  }

  function mergeDuplicate() {
    if (!duplicateRisks[0]) {
      return;
    }

    setPeople((current) =>
      current.map((person) =>
        person.id === duplicateRisks[0].id ? { ...person, status: 'Complete', notes: `${person.notes} Merge reviewed.` } : person,
      ),
    );
    setActiveModal(null);
  }

  return (
    <main className="min-h-screen bg-[#fbfaf7] text-[#101827]">
      <div className="flex min-h-screen">
        <aside className="hidden w-[280px] shrink-0 border-r border-[#eee7df] bg-[#fffdfa] px-4 py-5 lg:flex lg:flex-col">
          <BrandBlock />
          <nav className="mt-10 space-y-2">
            {navItems.map((item, index) => (
              <button
                className={`nav-button ${index === 0 ? 'nav-button-active' : ''}`}
                key={item.label}
                type="button"
                onClick={() => item.label === 'Add Person' && setActiveModal('person')}
              >
                <Icon name={item.icon} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <section className="mt-auto rounded-lg border border-[#eee7df] bg-white p-4 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
            <h2 className="text-sm font-semibold">Quick Summary</h2>
            <div className="mt-5 space-y-4">
              {summaryItems.map((item) => (
                <div className="flex items-center gap-3" key={item.label}>
                  <span className="grid h-8 w-8 place-items-center rounded-md" style={{ background: `${item.tone}14`, color: item.tone }}>
                    <Icon name={item.icon} />
                  </span>
                  <span className="flex-1 text-sm text-[#667085]">{item.label}</span>
                  <strong className="text-sm">{item.value}</strong>
                </div>
              ))}
            </div>
            <button className="mt-5 h-10 w-full rounded-md border border-[#ff5a00] text-sm font-semibold text-[#f05200]" type="button">
              View All
            </button>
          </section>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex min-h-[88px] items-center gap-4 border-b border-[#eee7df] bg-white/95 px-4 backdrop-blur md:px-8">
            <button className="icon-button lg:hidden" type="button" aria-label="Open menu">
              <Icon name="menu" />
            </button>
            <button className="icon-button hidden lg:grid" type="button" aria-label="Collapse menu">
              <Icon name="menu" />
            </button>
            <div className="relative max-w-xl flex-1">
              <Icon className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#667085]" name="search" />
              <input
                className="h-12 w-full rounded-md border border-[#e5e7eb] bg-white pl-12 pr-4 text-sm outline-none transition focus:border-[#ff5a00] focus:ring-4 focus:ring-[#ff5a0014]"
                onChange={(event) => setGlobalSearch(event.target.value)}
                placeholder="Search people by name or phone..."
                value={globalSearch}
              />
              {globalResults.length > 0 && (
                <div className="absolute left-0 right-0 top-14 z-30 rounded-lg border border-[#eee7df] bg-white p-2 shadow-xl">
                  {globalResults.map((person) => (
                    <button
                      className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left hover:bg-[#fff4ec]"
                      key={person.id}
                      type="button"
                      onClick={() => {
                        setSelectedId(person.id);
                        setGlobalSearch('');
                      }}
                    >
                      <Avatar person={person} size="sm" />
                      <span>
                        <span className="block text-sm font-semibold">{person.name}</span>
                        <span className="text-xs text-[#667085]">{person.phone}</span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button className="primary-button" type="button" onClick={() => setActiveModal('person')}>
              <Icon name="plus" />
              <span>Add Person</span>
            </button>
            <button className="secondary-button" type="button" onClick={() => setActiveModal('connection')}>
              <Icon name="plus" />
              <span>Add Connection</span>
            </button>
            <button className="icon-button hidden md:grid" type="button" aria-label="Notifications">
              <Icon name="bell" />
            </button>
            <div className="hidden items-center gap-3 md:flex">
              <Avatar person={peopleById.get('ramesh') ?? selectedPerson} size="sm" />
              <span>
                <strong className="block text-sm">Guruji</strong>
                <span className="text-xs text-[#667085]">Admin</span>
              </span>
            </div>
          </header>

          <div className="grid flex-1 gap-4 p-4 xl:grid-cols-[minmax(0,1fr)_340px] xl:p-5">
            <section className="min-w-0">
              <div className="rounded-lg border border-[#eee7df] bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
                <div className="flex flex-wrap items-center gap-3 border-b border-[#f0ebe6] p-4">
                  <select className="control" onChange={(event) => setCategoryFilter(event.target.value as 'all' | RelationshipCategory)} value={categoryFilter}>
                    <option value="all">All Connections</option>
                    <option value="family">Family</option>
                    <option value="friend">Friend</option>
                    <option value="social">Other</option>
                  </select>
                  <select className="control" onChange={(event) => setTypeFilter(event.target.value)} value={typeFilter}>
                    <option value="all">All Types</option>
                    {relationshipTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  <label className="relative min-w-[220px] flex-1">
                    <Icon className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#667085]" name="search" />
                    <input
                      className="control w-full pr-11"
                      onChange={(event) => setNetworkSearch(event.target.value)}
                      placeholder="Search in network..."
                      value={networkSearch}
                    />
                  </label>
                  <button className="control px-6 font-semibold" type="button" onClick={resetFilters}>
                    Reset
                  </button>
                  <div className="ml-auto flex gap-4 text-sm">
                    {(['family', 'friend', 'social'] as RelationshipCategory[]).map((category) => (
                      <span className="flex items-center gap-2" key={category}>
                        <span className={`legend-line legend-${category}`} />
                        {category === 'social' ? 'Other' : capitalize(category)}
                      </span>
                    ))}
                  </div>
                </div>
                <GraphCanvas
                  connections={filteredConnections}
                  people={visiblePeople}
                  peopleById={peopleById}
                  scale={scale}
                  pan={pan}
                  selectedId={selectedPerson.id}
                  setPan={setPan}
                  setScale={setScale}
                  setSelectedId={setSelectedId}
                  typeById={typeById}
                />
              </div>

              <section className="mt-1 rounded-lg border border-[#eee7df] bg-white p-4 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
                <h2 className="text-sm font-semibold">Relationship Types</h2>
                <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-6">
                  {relationshipTypes.map((type) => (
                    <button
                      className="flex items-center gap-2 rounded-md px-2 py-2 text-left text-sm text-[#475467] transition hover:bg-[#fff4ec]"
                      key={type.id}
                      type="button"
                      onClick={() => setTypeFilter(type.id)}
                    >
                      <span className="grid h-8 w-8 place-items-center rounded-md" style={{ background: type.tint, color: type.color }}>
                        <Icon name={type.icon} />
                      </span>
                      {type.label}
                    </button>
                  ))}
                </div>
              </section>
            </section>

            <ProfilePanel
              connections={selectedConnections}
              peopleById={peopleById}
              person={selectedPerson}
              relationshipTypes={relationshipTypes}
              setActiveModal={setActiveModal}
              setSelectedId={setSelectedId}
              typeById={typeById}
              onDelete={deleteSelectedPerson}
            />
          </div>
        </section>
      </div>

      {activeModal === 'person' && (
        <Modal title="Search Before Create" onClose={() => setActiveModal(null)}>
          <p className="text-sm text-[#667085]">
            The PRD requires duplicate checks before creation. Enter name and phone; the UI blocks existing phone numbers.
          </p>
          <form className="mt-5 grid gap-3" onSubmit={addPerson}>
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
      )}

      {activeModal === 'connection' && (
        <Modal title="Add Relationship" onClose={() => setActiveModal(null)}>
          <p className="text-sm text-[#667085]">
            Relationship choices are predefined, self-links are blocked, and reverse labels are inferred automatically.
          </p>
          <form className="mt-5 grid gap-3" onSubmit={addConnection}>
            <select className="control w-full" name="from" defaultValue={selectedPerson.id}>
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
      )}

      {activeModal === 'merge' && (
        <Modal title="Merge Review Queue" onClose={() => setActiveModal(null)}>
          <div className="space-y-3">
            {duplicateRisks.length === 0 ? (
              <p className="text-sm text-[#667085]">No duplicate risks are waiting for review.</p>
            ) : (
              duplicateRisks.map((person) => (
                <div className="flex items-center gap-3 rounded-lg border border-[#eee7df] p-3" key={person.id}>
                  <Avatar person={person} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{person.name}</p>
                    <p className="text-xs text-[#667085]">{person.phone}</p>
                  </div>
                  <span className="rounded-full bg-[#fff4ec] px-3 py-1 text-xs font-semibold text-[#f05200]">{person.status}</span>
                </div>
              ))
            )}
            <button className="primary-button h-11 w-full justify-center" type="button" onClick={mergeDuplicate}>
              Mark First Review Complete
            </button>
          </div>
        </Modal>
      )}
    </main>
  );
}

function GraphCanvas({
  people,
  connections,
  peopleById,
  typeById,
  selectedId,
  scale,
  pan,
  setSelectedId,
  setScale,
  setPan,
}: {
  people: Person[];
  connections: Connection[];
  peopleById: Map<string, Person>;
  typeById: Map<string, RelationshipType>;
  selectedId: string;
  scale: number;
  pan: { x: number; y: number };
  setSelectedId: (id: string) => void;
  setScale: (next: number | ((current: number) => number)) => void;
  setPan: (next: { x: number; y: number }) => void;
}) {
  const visibleIds = useMemo(() => new Set(people.map((person) => person.id)), [people]);
  const visibleConnections = connections.filter((connection) => visibleIds.has(connection.from) && visibleIds.has(connection.to));

  return (
    <div className="relative h-[640px] overflow-hidden bg-[radial-gradient(circle_at_1px_1px,#f0e9e2_1px,transparent_0)] [background-size:28px_28px]">
      <div
        className="absolute left-1/2 top-1/2 origin-center transition-transform duration-300"
        style={{
          width: graphSize.width,
          height: graphSize.height,
          transform: `translate(calc(-50% + ${pan.x}px), calc(-50% + ${pan.y}px)) scale(${scale})`,
        }}
      >
        <svg className="absolute inset-0 h-full w-full" viewBox={`0 0 ${graphSize.width} ${graphSize.height}`}>
          {visibleConnections.map((connection) => {
            const source = peopleById.get(connection.from);
            const target = peopleById.get(connection.to);
            const type = typeById.get(connection.type);

            if (!source || !target || !type) {
              return null;
            }

            const midX = (source.x + target.x) / 2;
            const midY = (source.y + target.y) / 2;

            return (
              <g key={connection.id}>
                <line
                  stroke={type.color}
                  strokeDasharray={type.category === 'family' ? '0' : type.category === 'friend' ? '8 8' : '4 9'}
                  strokeLinecap="round"
                  strokeWidth={selectedId === source.id || selectedId === target.id ? 3 : 2}
                  x1={source.x}
                  x2={target.x}
                  y1={source.y}
                  y2={target.y}
                />
                <foreignObject height="34" width="110" x={midX - 55} y={midY - 17}>
                  <button
                    className="edge-label"
                    style={{ borderColor: type.color, color: type.color, background: type.tint }}
                    type="button"
                    onClick={() => setSelectedId(source.id)}
                  >
                    {type.label}
                  </button>
                </foreignObject>
              </g>
            );
          })}
        </svg>

        {people.map((person) => (
          <button
            className={`graph-node ${person.id === selectedId ? 'graph-node-active' : ''}`}
            key={person.id}
            style={{ left: person.x, top: person.y }}
            type="button"
            onClick={() => setSelectedId(person.id)}
          >
            <Avatar person={person} size={person.id === selectedId ? 'lg' : 'md'} />
            <strong>{person.name}</strong>
            {person.id === selectedId && <span>{person.role}</span>}
          </button>
        ))}
      </div>

      <div className="absolute bottom-5 left-4 grid overflow-hidden rounded-md border border-[#e5e7eb] bg-white shadow-lg">
        <button className="canvas-tool" type="button" aria-label="Fit graph" onClick={() => setPan({ x: 0, y: -20 })}>
          <Icon name="fit" />
        </button>
        <button className="canvas-tool" type="button" aria-label="Zoom in" onClick={() => setScale((current) => Math.min(1.35, current + 0.1))}>
          <Icon name="zoom-in" />
        </button>
        <button className="canvas-tool" type="button" aria-label="Zoom out" onClick={() => setScale((current) => Math.max(0.72, current - 0.1))}>
          <Icon name="zoom-out" />
        </button>
        <button className="canvas-tool" type="button" aria-label="Center selected" onClick={() => setScale(1)}>
          <Icon name="target" />
        </button>
      </div>

      <div className="absolute bottom-5 left-20 hidden h-24 w-36 rounded-md border border-[#dbe4ef] bg-[#f8fbff] p-3 md:block">
        <div className="relative h-full w-full rounded border border-[#9cc4ff] bg-white">
          {people.map((person) => (
            <span
              className="absolute h-1.5 w-1.5 rounded-full"
              key={person.id}
              style={{
                left: `${(person.x / graphSize.width) * 100}%`,
                top: `${(person.y / graphSize.height) * 100}%`,
                background: person.id === selectedId ? '#ff5a00' : '#61c1c4',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ProfilePanel({
  person,
  connections,
  peopleById,
  typeById,
  relationshipTypes,
  setSelectedId,
  setActiveModal,
  onDelete,
}: {
  person: Person;
  connections: Connection[];
  peopleById: Map<string, Person>;
  typeById: Map<string, RelationshipType>;
  relationshipTypes: RelationshipType[];
  setSelectedId: (id: string) => void;
  setActiveModal: (modal: 'person' | 'connection' | 'merge' | null) => void;
  onDelete: () => void;
}) {
  return (
    <aside className="rounded-lg border border-[#eee7df] bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
      <div className="flex items-start gap-4 p-5">
        <Avatar person={person} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h2 className="truncate text-xl font-bold">{person.name}</h2>
            <button className="text-[#667085]" type="button" aria-label="More actions">
              <Icon name="more" />
            </button>
          </div>
          <span className="mt-3 inline-flex rounded-full bg-[#e8f3ff] px-3 py-1 text-sm font-semibold text-[#0068d9]">{person.role}</span>
          <dl className="mt-4 space-y-3 text-sm">
            {[
              { icon: 'phone' as IconName, value: person.phone },
              { icon: 'pin' as IconName, value: person.location },
              { icon: 'calendar' as IconName, value: `Joined on ${person.joined}` },
            ].map((item) => (
              <div className="flex items-center gap-2" key={item.value}>
                <Icon className="text-[#667085]" name={item.icon} />
                <dd>{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="grid grid-cols-2 border-y border-[#eee7df] text-sm">
        <button className="h-14 text-[#667085]" type="button">
          About
        </button>
        <button className="h-14 border-b-2 border-[#ff5a00] font-semibold text-[#f05200]" type="button">
          Connections ({connections.length})
        </button>
      </div>

      <div className="min-h-[360px] p-4">
        <div className="mb-4 rounded-md bg-[#fbfaf7] p-3 text-sm text-[#475467]">
          <strong className="mb-1 block text-[#101827]">{person.status}</strong>
          {person.notes}
        </div>
        <div className="space-y-1">
          {connections.map((connection) => {
            const isSource = connection.from === person.id;
            const related = peopleById.get(isSource ? connection.to : connection.from);
            const type = typeById.get(connection.type);
            const label = isSource ? type?.label : type?.reverse;

            if (!related || !type) {
              return null;
            }

            return (
              <button
                className="flex w-full items-center gap-3 rounded-md border-b border-[#f0ebe6] px-3 py-3 text-left transition hover:bg-[#fff4ec]"
                key={connection.id}
                type="button"
                onClick={() => setSelectedId(related.id)}
              >
                <span className="grid h-9 w-9 place-items-center rounded-md" style={{ background: type.tint, color: type.color }}>
                  <Icon name={type.icon} />
                </span>
                <span className="w-20 text-sm font-semibold" style={{ color: type.color }}>
                  {label}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm">{related.name}</span>
                <Icon className="text-[#667085]" name="more" />
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-3 border-t border-[#eee7df] p-4 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
        <button className="secondary-button h-11 justify-center" type="button" onClick={() => setActiveModal('connection')}>
          <Icon name="edit" />
          Edit Person
        </button>
        <button className="danger-button" type="button" onClick={onDelete}>
          <Icon name="trash" />
          Delete Person
        </button>
        <button className="secondary-button h-11 justify-center sm:col-span-2 xl:col-span-1 2xl:col-span-2" type="button" onClick={() => setActiveModal('merge')}>
          <Icon name="merge" />
          Review Merge Queue ({relationshipTypes.length})
        </button>
      </div>
    </aside>
  );
}

function BrandBlock() {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-14 w-14 place-items-center rounded-lg bg-[#fff4ec] text-[#ff5a00]">
        <svg aria-hidden="true" className="h-9 w-9" fill="none" viewBox="0 0 48 48">
          <path d="M24 5c4 6 4 12 0 18-4-6-4-12 0-18Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
          <path d="M12 12c7 1 11 5 12 11-7-1-11-5-12-11Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
          <path d="M36 12c-7 1-11 5-12 11 7-1 11-5 12-11Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
          <path d="M7 25c8-1 14 1 17 7-8 1-14-1-17-7Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
          <path d="M41 25c-8-1-14 1-17 7 8 1 14-1 17-7Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
          <path d="M13 38h22" stroke="currentColor" strokeLinecap="round" strokeWidth="2.5" />
        </svg>
      </div>
      <div>
        <h1 className="text-lg font-bold">Temple Community</h1>
        <p className="text-sm text-[#667085]">Community Network</p>
      </div>
    </div>
  );
}

function Avatar({ person, size }: { person: Person; size: 'sm' | 'md' | 'lg' }) {
  const initials = person.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2);
  const dimension = size === 'lg' ? 'h-24 w-24 text-2xl' : size === 'md' ? 'h-16 w-16 text-lg' : 'h-10 w-10 text-sm';
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

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
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

function ValidationMessage({ message }: { message: string }) {
  if (!message) {
    return null;
  }

  return <p className="rounded-md bg-[#fff4ec] px-3 py-2 text-sm font-semibold text-[#f05200]">{message}</p>;
}

function Icon({ name, className = '' }: { name: IconName; className?: string }) {
  const common = {
    fill: 'none',
    stroke: 'currentColor',
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    strokeWidth: 2,
  };
  const paths: Record<IconName, React.ReactNode> = {
    network: (
      <>
        <circle cx="6" cy="18" r="2.5" {...common} />
        <circle cx="12" cy="6" r="2.5" {...common} />
        <circle cx="18" cy="18" r="2.5" {...common} />
        <path d="m7.2 15.8 3.6-7.6m2.4 0 3.6 7.6M8.7 18h6.6" {...common} />
      </>
    ),
    people: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" {...common} />
        <circle cx="9.5" cy="7" r="4" {...common} />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" {...common} />
      </>
    ),
    link: (
      <>
        <path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" {...common} />
        <path d="M14 11a5 5 0 0 0-7.07 0l-3 3A5 5 0 0 0 11 21.07l1.71-1.71" {...common} />
      </>
    ),
    'person-plus': (
      <>
        <path d="M15 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" {...common} />
        <circle cx="8.5" cy="7" r="4" {...common} />
        <path d="M20 8v6m3-3h-6" {...common} />
      </>
    ),
    reports: (
      <>
        <path d="M4 20V10m8 10V4m8 16v-7" {...common} />
        <path d="M2 20h20" {...common} />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" {...common} />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.65 1.65 0 0 0 15 19.4a1.65 1.65 0 0 0-1 .6 1.65 1.65 0 0 0-.33 1.82 2 2 0 1 1-3.34 0A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-.6-1 1.65 1.65 0 0 0-1.82-.33 2 2 0 1 1 0-3.34A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-.6 1.65 1.65 0 0 0 .33-1.82 2 2 0 1 1 3.34 0A1.65 1.65 0 0 0 15 4.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.2.36.5.67.87.87.57.3 1.24.2 1.82-.04a2 2 0 1 1 0 3.34c-.58-.24-1.25-.34-1.82-.04-.37.2-.67.5-.87.87Z" {...common} />
      </>
    ),
    search: <path d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" {...common} />,
    plus: <path d="M12 5v14M5 12h14" {...common} />,
    bell: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" {...common} />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" {...common} />
      </>
    ),
    menu: <path d="M4 6h16M4 12h16M4 18h16" {...common} />,
    more: <path d="M12 6h.01M12 12h.01M12 18h.01" {...common} />,
    phone: <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.34 1.9.63 2.8a2 2 0 0 1-.45 2.11L8 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.29 1.84.5 2.8.63A2 2 0 0 1 22 16.92Z" {...common} />,
    pin: (
      <>
        <path d="M21 10c0 7-9 12-9 12S3 17 3 10a9 9 0 1 1 18 0Z" {...common} />
        <circle cx="12" cy="10" r="3" {...common} />
      </>
    ),
    calendar: (
      <>
        <path d="M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" {...common} />
      </>
    ),
    edit: <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" {...common} />,
    trash: <path d="M3 6h18M8 6V4h8v2m-1 5v6M9 11v6M5 6l1 16h12l1-16" {...common} />,
    heart: <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z" {...common} />,
    merge: <path d="M8 7h8a4 4 0 0 1 0 8H8m0-8 3-3M8 7l3 3m5 5-3-3m3 3-3 3" {...common} />,
    target: (
      <>
        <circle cx="12" cy="12" r="8" {...common} />
        <circle cx="12" cy="12" r="3" {...common} />
      </>
    ),
    'zoom-in': (
      <>
        <path d="m21 21-4.35-4.35M11 8v6M8 11h6" {...common} />
        <circle cx="11" cy="11" r="7" {...common} />
      </>
    ),
    'zoom-out': (
      <>
        <path d="m21 21-4.35-4.35M8 11h6" {...common} />
        <circle cx="11" cy="11" r="7" {...common} />
      </>
    ),
    fit: <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" {...common} />,
    users: (
      <>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" {...common} />
        <circle cx="9" cy="7" r="4" {...common} />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" {...common} />
      </>
    ),
  };

  return (
    <svg aria-hidden="true" className={`h-5 w-5 shrink-0 ${className}`} fill="none" viewBox="0 0 24 24">
      {paths[name]}
    </svg>
  );
}

function samePair(connection: Connection, from: string, to: string) {
  return (connection.from === from && connection.to === to) || (connection.from === to && connection.to === from);
}

function toUiPerson(person: NetworkPerson, index = 0): Person {
  return {
    id: person.personId,
    name: person.name,
    phone: person.phone ?? 'Not provided',
    age: person.age,
    gender: person.gender ?? 'Other',
    occupation: person.occupation ?? 'Not specified',
    role: person.role ?? 'Viewer',
    location: person.location ?? 'Location pending',
    joined: person.createdAt ? new Date(person.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Today',
    notes: person.notes ?? 'Progressive profile entry started.',
    status: person.status ?? 'Partial',
    x: 160 + ((index * 170) % 720),
    y: 140 + ((index * 120) % 520),
  };
}

function toUiConnection(connection: NetworkConnection, index: number): Connection {
  return {
    id: `${connection.fromPersonId}-${connection.toPersonId}-${index}`,
    from: connection.fromPersonId,
    to: connection.toPersonId,
    type: connection.relationshipType,
    createdBy: 'BondGrid API',
    updatedAt: connection.updatedAt ? new Date(connection.updatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'Today',
  };
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
