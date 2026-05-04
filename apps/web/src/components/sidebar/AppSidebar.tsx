import { ActiveModal, IconName, Person } from '../../types/graph';
import { Icon } from '../ui/Icon';

const navItems: Array<{ label: string; icon: IconName }> = [
  { label: 'Network View', icon: 'network' },
  { label: 'People', icon: 'people' },
  { label: 'Connections', icon: 'link' },
  { label: 'Add Person', icon: 'person-plus' },
  { label: 'Reports', icon: 'reports' },
  { label: 'Settings', icon: 'settings' },
];

type SummaryItem = {
  label: string;
  value: number;
  icon: IconName;
  tone: string;
};

type AppSidebarProps = {
  currentUser: Person | undefined;
  summaryItems: SummaryItem[];
  setActiveModal: (modal: ActiveModal) => void;
  activities?: any[];
};

export function AppSidebar({ currentUser, summaryItems, setActiveModal, activities = [] }: AppSidebarProps) {
  return (
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
              <span
                className="grid h-8 w-8 place-items-center rounded-md"
                style={{ background: `${item.tone}14`, color: item.tone }}
              >
                <Icon name={item.icon} />
              </span>
              <span className="flex-1 text-sm text-[#667085]">{item.label}</span>
              <strong className="text-sm">{item.value}</strong>
            </div>
          ))}
        </div>
        <button
          className="mt-5 h-10 w-full rounded-md border border-[#ff5a00] text-sm font-semibold text-[#f05200]"
          type="button"
        >
          View All
        </button>
      </section>

      <section className="mt-6 flex-1 overflow-hidden rounded-lg border border-[#eee7df] bg-white p-4 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
        <h2 className="text-sm font-semibold">Activity Feed</h2>
        <div className="mt-4 space-y-4 overflow-y-auto pr-1" style={{ maxHeight: 'calc(100vh - 550px)' }}>
          {activities.length === 0 && (
            <p className="text-xs text-[#667085]">No recent activities.</p>
          )}
          {activities.map((activity, idx) => (
            <div className="flex gap-3 text-xs" key={idx}>
              <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#ff5a00]" />
              <div className="min-w-0">
                <p className="font-medium text-[#101827]">{activity.description}</p>
                <p className="mt-0.5 text-[#667085]">
                  {new Date(activity.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </aside>
  );
}

function BrandBlock() {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-14 w-14 place-items-center rounded-lg bg-[#fff4ec] text-[#ff5a00]">
        <svg aria-hidden="true" className="h-9 w-9" fill="none" viewBox="0 0 48 48">
          <path
            d="M24 5c4 6 4 12 0 18-4-6-4-12 0-18Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.5"
          />
          <path
            d="M12 12c7 1 11 5 12 11-7-1-11-5-12-11Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.5"
          />
          <path
            d="M36 12c-7 1-11 5-12 11 7-1 11-5 12-11Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.5"
          />
          <path
            d="M7 25c8-1 14 1 17 7-8 1-14-1-17-7Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.5"
          />
          <path
            d="M41 25c-8-1-14 1-17 7 8 1 14-1 17-7Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.5"
          />
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
