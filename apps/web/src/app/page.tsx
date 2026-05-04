'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';

import { AppHeader } from '../components/header/AppHeader';
import { GraphCanvas } from '../components/graph/GraphCanvas';
import { ProfilePanel } from '../components/panels/ProfilePanel';
import { AppSidebar } from '../components/sidebar/AppSidebar';
import { AddPersonModal } from '../components/modals/AddPersonModal';
import { AddConnectionModal } from '../components/modals/AddConnectionModal';
import { EditConnectionModal } from '../components/modals/EditConnectionModal';
import { MergeModal } from '../components/modals/MergeModal';
import { Icon } from '../components/ui/Icon';
import { apiClient } from '../services/apiClient';
import { initialConnections, initialPeople, relationshipTypes } from '../data/graphData';
import { samePair, toUiConnection, toUiPerson } from '../lib/graphUtils';
import {
  ActiveModal,
  Connection,
  NetworkResponse,
  Person,
  RelationshipCategory,
  SearchPeopleResponse,
  CreatePersonResponse,
} from '../types/graph';

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
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [editingConnection, setEditingConnection] = useState<Connection | null>(null);
  const [formMessage, setFormMessage] = useState('');
  const [activities, setActivities] = useState<any[]>([]);
  const [orphanWarningId, setOrphanWarningId] = useState<string | null>(null);

  async function loadNetwork() {
    const network = await apiClient.get<NetworkResponse>('/api/graph/network');
    if (network.people.length === 0) return;
    const nextPeople = network.people.map(toUiPerson);
    setPeople(nextPeople);
    setConnections(network.connections.map(toUiConnection));
    setSelectedId((current) =>
      nextPeople.some((person) => person.id === current) ? current : nextPeople[0].id,
    );
  }

  useEffect(() => {
    loadNetwork().catch(() => {
      setFormMessage('Using demo data because the API graph could not be loaded.');
    });
    loadActivities().catch(() => {});
  }, []);

  async function loadActivities() {
    try {
      const result = await apiClient.get<any>('/api/activity');
      setActivities(result.activities);
    } catch (e) {}
  }

  const typeById = useMemo(() => new Map(relationshipTypes.map((type) => [type.id, type])), []);
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
    filteredConnections.forEach((c) => { ids.add(c.from); ids.add(c.to); });
    return people.filter((person) => {
      const matchesSearch =
        !networkSearch.trim() ||
        `${person.name} ${person.phone} ${person.location} ${person.role}`
          .toLowerCase()
          .includes(networkSearch.toLowerCase());
      return ids.has(person.id) || matchesSearch || person.id === selectedPerson.id;
    });
  }, [filteredConnections, networkSearch, people, selectedPerson.id]);

  const selectedConnections = useMemo(
    () => connections.filter((c) => c.from === selectedPerson.id || c.to === selectedPerson.id),
    [connections, selectedPerson.id],
  );

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
      { label: 'Total People', value: people.length, icon: 'people' as const, tone: '#f97316' },
      { label: 'Connections', value: connections.length, icon: 'link' as const, tone: '#16a34a' },
      {
        label: 'Families',
        value: connections.filter((c) => typeById.get(c.type)?.category === 'family').length,
        icon: 'users' as const,
        tone: '#8b5cf6',
      },
      { label: 'Merge Queue', value: duplicateRisks.length, icon: 'merge' as const, tone: '#0f7cff' },
    ],
    [connections, duplicateRisks.length, people.length, typeById],
  );

  const globalResults = useMemo(() => {
    const query = globalSearch.trim().toLowerCase();
    if (!query) return [];
    return people.filter((p) => `${p.name} ${p.phone}`.toLowerCase().includes(query)).slice(0, 5);
  }, [globalSearch, people]);

  async function deleteSelectedPerson() {
    if (people.length <= 1) return;
    try {
      await apiClient.delete(`/api/people/${selectedPerson.id}`);
      await loadNetwork();
    } catch (error) {
      setFormMessage(error instanceof Error ? error.message : 'Could not delete person.');
    }
  }

  async function addPerson(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get('name') ?? '').trim();
    const phone = String(form.get('phone') ?? '').trim();
    if (!name || !phone) { setFormMessage('Name and phone are required.'); return; }
    if (people.some((p) => p.phone === phone)) { setFormMessage('Duplicate warning: this phone number already exists.'); return; }
    try {
      const search = await apiClient.get<SearchPeopleResponse>(`/api/people/search?q=${encodeURIComponent(name)}`);
      const result = await apiClient.post<CreatePersonResponse>('/api/people', {
        searchContextId: search.searchContextId,
        name, phone,
        age: Number(form.get('age')) || undefined,
        gender: String(form.get('gender')),
        occupation: String(form.get('occupation') ?? ''),
        role: String(form.get('role')),
        location: String(form.get('location') ?? ''),
        notes: String(form.get('notes') ?? ''),
      });
      const nextPerson = toUiPerson(result.person, people.length);
      setPeople((current) => current.some((p) => p.id === nextPerson.id) ? current : [...current, nextPerson]);
      setSelectedId(nextPerson.id);
      await loadNetwork();
      loadActivities().catch(() => {});
      setActiveModal(null);
      setFormMessage('');

      if (result.created) {
        // Constraint 16: Warn if a person has no connections
        setOrphanWarningId(nextPerson.id);
      }
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
    if (from === to) { setFormMessage('Self-relationships are not allowed.'); return; }
    if (connections.some((c) => samePair(c, from, to))) { setFormMessage('These two people are already connected.'); return; }
    const relType = typeById.get(type);
    if (relType?.maxIncoming && connections.some((c) => c.to === to && c.type === relType.id)) {
      setFormMessage(`Only one ${relType.label.toLowerCase()} is allowed.`); return;
    }
    try {
      await apiClient.post('/api/relationships', { fromPersonId: from, toPersonId: to, relationshipType: type });
      await loadNetwork();
      loadActivities().catch(() => {});
      setSelectedId(from);
      setActiveModal(null);
      setFormMessage('');
      setOrphanWarningId(null); // Clear orphan warning if connection added
    } catch (error) {
      setFormMessage(error instanceof Error ? error.message : 'Could not create relationship.');
    }
  }

  async function deleteRelationship(connection: Connection) {
    if (!connection.relationshipGroupId) return;
    try {
      await apiClient.delete(`/api/relationships/${connection.relationshipGroupId}`);
      await loadNetwork();
      loadActivities().catch(() => {});
    } catch (error) {
      setFormMessage(error instanceof Error ? error.message : 'Could not delete relationship.');
    }
  }

  async function editConnectionSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingConnection?.relationshipGroupId) return;
    const form = new FormData(event.currentTarget);
    const from = String(form.get('from'));
    const to = String(form.get('to'));
    const type = String(form.get('type'));
    if (from === to) { setFormMessage('Self-relationships are not allowed.'); return; }
    try {
      await apiClient.patch(`/api/relationships/${editingConnection.relationshipGroupId}`, {
        fromPersonId: from, toPersonId: to, relationshipType: type,
      });
      await loadNetwork();
      loadActivities().catch(() => {});
      setActiveModal(null);
      setEditingConnection(null);
      setFormMessage('');
    } catch (error) {
      setFormMessage(error instanceof Error ? error.message : 'Could not update relationship.');
    }
  }

  function closeModal() {
    setActiveModal(null);
    setEditingConnection(null);
    setFormMessage('');
  }

  return (
    <main className="min-h-screen bg-[#fbfaf7] text-[#101827]">
      <div className="flex min-h-screen">
        <AppSidebar
          currentUser={peopleById.get('ramesh')}
          summaryItems={summaryItems}
          setActiveModal={setActiveModal}
          activities={activities}
        />

        <section className="flex min-w-0 flex-1 flex-col">
          <AppHeader
            globalSearch={globalSearch}
            globalResults={globalResults}
            currentUser={peopleById.get('ramesh')}
            setGlobalSearch={setGlobalSearch}
            setSelectedId={setSelectedId}
            setActiveModal={setActiveModal}
          />

          <div className="grid flex-1 gap-4 p-4 xl:grid-cols-[minmax(0,1fr)_340px] xl:p-5">
            <section className="min-w-0">
              {/* Graph toolbar */}
              <div className="rounded-lg border border-[#eee7df] bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
                <div className="flex flex-wrap items-center gap-3 border-b border-[#f0ebe6] p-4">
                  <select
                    className="control"
                    onChange={(e) => setCategoryFilter(e.target.value as 'all' | RelationshipCategory)}
                    value={categoryFilter}
                  >
                    <option value="all">All Connections</option>
                    <option value="family">Family</option>
                    <option value="friend">Friend</option>
                    <option value="social">Other</option>
                  </select>
                  <select className="control" onChange={(e) => setTypeFilter(e.target.value)} value={typeFilter}>
                    <option value="all">All Types</option>
                    {relationshipTypes.map((type) => (
                      <option key={type.id} value={type.id}>{type.label}</option>
                    ))}
                  </select>
                  <label className="relative min-w-[220px] flex-1">
                    <input
                      className="control w-full pr-11"
                      onChange={(e) => setNetworkSearch(e.target.value)}
                      placeholder="Search in network..."
                      value={networkSearch}
                    />
                  </label>
                  <button
                    className="control px-6 font-semibold"
                    type="button"
                    onClick={() => { setNetworkSearch(''); setCategoryFilter('all'); setTypeFilter('all'); }}
                  >
                    Reset
                  </button>
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

              {/* Relationship type legend */}
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
                      <span
                        className="grid h-8 w-8 place-items-center rounded-md"
                        style={{ background: type.tint, color: type.color }}
                      >
                        <Icon name={type.icon} className="h-4 w-4" />
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
              onEditConnection={(conn) => { setEditingConnection(conn); setActiveModal('edit-connection'); }}
              onDeleteConnection={deleteRelationship}
              showOrphanWarning={orphanWarningId === selectedPerson.id}
              onDismissOrphanWarning={() => setOrphanWarningId(null)}
            />
          </div>
        </section>
      </div>

      {activeModal === 'person' && (
        <AddPersonModal
          globalSearch={globalSearch}
          people={people}
          formMessage={formMessage}
          onClose={closeModal}
          onSubmit={addPerson}
        />
      )}

      {activeModal === 'connection' && (
        <AddConnectionModal
          people={people}
          relationshipTypes={relationshipTypes}
          selectedPersonId={selectedPerson.id}
          formMessage={formMessage}
          onClose={closeModal}
          onSubmit={addConnection}
        />
      )}

      {activeModal === 'edit-connection' && editingConnection && (
        <EditConnectionModal
          connection={editingConnection}
          people={people}
          relationshipTypes={relationshipTypes}
          formMessage={formMessage}
          onClose={closeModal}
          onSubmit={editConnectionSubmit}
        />
      )}

      {activeModal === 'merge' && (
        <MergeModal
          duplicateRisks={duplicateRisks}
          people={people}
          onClose={closeModal}
          onMergeComplete={loadNetwork}
        />
      )}
    </main>
  );
}
