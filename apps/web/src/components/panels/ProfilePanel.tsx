import { ActiveModal, Connection, IconName, Person, RelationshipType } from '../../types/graph';
import { Avatar } from '../ui/Avatar';
import { Icon } from '../ui/Icon';

type ProfilePanelProps = {
  person: Person;
  connections: Connection[];
  peopleById: Map<string, Person>;
  typeById: Map<string, RelationshipType>;
  relationshipTypes: RelationshipType[];
  setSelectedId: (id: string) => void;
  setActiveModal: (modal: ActiveModal) => void;
  onDelete: () => void;
  onEditConnection: (connection: Connection) => void;
  onDeleteConnection: (connection: Connection) => void;
  showOrphanWarning?: boolean;
  onDismissOrphanWarning?: () => void;
};

export function ProfilePanel({
  person,
  connections,
  peopleById,
  typeById,
  relationshipTypes,
  setSelectedId,
  setActiveModal,
  onDelete,
  onEditConnection,
  onDeleteConnection,
  showOrphanWarning,
  onDismissOrphanWarning,
}: ProfilePanelProps) {
  return (
    <aside className="rounded-lg border border-[#eee7df] bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
      {/* Header */}
      <div className="flex items-start gap-4 p-5">
        <Avatar person={person} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h2 className="truncate text-xl font-bold">{person.name}</h2>
            <button className="text-[#667085]" type="button" aria-label="More actions">
              <Icon name="more" />
            </button>
          </div>
          <span className="mt-3 inline-flex rounded-full bg-[#e8f3ff] px-3 py-1 text-sm font-semibold text-[#0068d9]">
            {person.role}
          </span>
          <dl className="mt-4 space-y-3 text-sm">
            {(
              [
                { icon: 'phone' as IconName, value: person.phone },
                { icon: 'pin' as IconName, value: person.location },
                { icon: 'calendar' as IconName, value: `Joined on ${person.joined}` },
              ] as { icon: IconName; value: string }[]
            ).map((item) => (
              <div className="flex items-center gap-2" key={item.value}>
                <Icon className="text-[#667085]" name={item.icon} />
                <dd>{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Tab bar */}
      <div className="grid grid-cols-2 border-y border-[#eee7df] text-sm">
        <button className="h-14 text-[#667085]" type="button">
          About
        </button>
        <button className="h-14 border-b-2 border-[#ff5a00] font-semibold text-[#f05200]" type="button">
          Connections ({connections.length})
        </button>
      </div>

      {/* Connection list */}
      <div className="min-h-[360px] p-4">
        {showOrphanWarning && connections.length === 0 && (
          <div className="mb-4 flex flex-col gap-3 rounded-lg border border-[#fbd5c0] bg-[#fff4ec] p-4 text-sm text-[#bc4b09]">
            <div className="flex items-start gap-2">
              <Icon name="info" className="mt-0.5 h-4 w-4" />
              <div>
                <p className="font-semibold">No Connections Found</p>
                <p className="mt-1 opacity-90">
                  Every profile should have at least one relationship. Add a family or community link now.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                className="rounded-md bg-[#bc4b09] px-3 py-1.5 font-medium text-white transition hover:bg-[#9a3e07]"
                type="button"
                onClick={() => setActiveModal('connection')}
              >
                Add Connection
              </button>
              <button
                className="px-3 py-1.5 font-medium hover:underline"
                type="button"
                onClick={onDismissOrphanWarning}
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
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

            if (!related || !type) return null;

            return (
              <div
                className="flex w-full items-center gap-3 rounded-md border-b border-[#f0ebe6] px-3 py-3 text-left transition hover:bg-[#fff4ec]"
                key={connection.id}
              >
                <span
                  className="grid h-9 w-9 cursor-pointer place-items-center rounded-md"
                  style={{ background: type.tint, color: type.color }}
                  onClick={() => setSelectedId(related.id)}
                >
                  <Icon name={type.icon} />
                </span>
                <span
                  className="w-20 cursor-pointer text-sm font-semibold"
                  style={{ color: type.color }}
                  onClick={() => setSelectedId(related.id)}
                >
                  {label}
                </span>
                <span
                  className="min-w-0 flex-1 cursor-pointer truncate text-sm"
                  onClick={() => setSelectedId(related.id)}
                >
                  {related.name}
                </span>
                {connection.relationshipGroupId ? (
                  <div className="flex gap-1">
                    <button
                      className="icon-button h-8 w-8 text-[#667085] hover:text-[#0f7cff]"
                      type="button"
                      onClick={() => onEditConnection(connection)}
                    >
                      <Icon name="edit" className="h-4 w-4" />
                    </button>
                    <button
                      className="icon-button h-8 w-8 text-[#667085] hover:text-[#f43f5e]"
                      type="button"
                      onClick={() => onDeleteConnection(connection)}
                    >
                      <Icon name="trash" className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <Icon className="text-[#667085]" name="more" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Action buttons */}
      <div className="grid gap-3 border-t border-[#eee7df] p-4 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
        <button
          className="secondary-button h-11 justify-center"
          type="button"
          onClick={() => setActiveModal('connection')}
        >
          <Icon name="edit" />
          Edit Person
        </button>
        <button className="danger-button" type="button" onClick={onDelete}>
          <Icon name="trash" />
          Delete Person
        </button>
        <button
          className="secondary-button h-11 justify-center sm:col-span-2 xl:col-span-1 2xl:col-span-2"
          type="button"
          onClick={() => setActiveModal('merge')}
        >
          <Icon name="merge" />
          Review Merge Queue ({relationshipTypes.length})
        </button>
      </div>
    </aside>
  );
}
