import { ActiveModal, Person } from '../../types/graph';
import { Avatar } from '../ui/Avatar';
import { Icon } from '../ui/Icon';

type AppHeaderProps = {
  globalSearch: string;
  globalResults: Person[];
  currentUser: Person | undefined;
  setGlobalSearch: (value: string) => void;
  setSelectedId: (id: string) => void;
  setActiveModal: (modal: ActiveModal) => void;
};

export function AppHeader({
  globalSearch,
  globalResults,
  currentUser,
  setGlobalSearch,
  setSelectedId,
  setActiveModal,
}: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-20 flex min-h-[88px] items-center gap-4 border-b border-[#eee7df] bg-white/95 px-4 backdrop-blur md:px-8">
      <button className="icon-button lg:hidden" type="button" aria-label="Open menu">
        <Icon name="menu" />
      </button>
      <button className="icon-button hidden lg:grid" type="button" aria-label="Collapse menu">
        <Icon name="menu" />
      </button>

      {/* Global search */}
      <div className="relative max-w-xl flex-1">
        <Icon
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#667085]"
          name="search"
        />
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

      {currentUser && (
        <div className="hidden items-center gap-3 md:flex">
          <Avatar person={currentUser} size="sm" />
          <span>
            <strong className="block text-sm">Guruji</strong>
            <span className="text-xs text-[#667085]">Admin</span>
          </span>
        </div>
      )}
    </header>
  );
}
