import { useState, type ReactNode, type Ref } from 'react';
import accountAvatar from '../assets/account-avatar.png';
import { icons } from '../assets/icons';
import logo from '../assets/logo.png';
import { Icon } from './Icon';

/**
 * Static Gmail chrome: header and left sidebar. Like Gmail, the page itself never
 * scrolls; the header, sidebar and toolbar stay put and only the messages scroll.
 */
export function AppShell({
  toolbar,
  children,
  scrollRef,
}: {
  toolbar: ReactNode;
  children: ReactNode;
  scrollRef?: Ref<HTMLDivElement>;
}) {
  // Gmail shows a line under the toolbar once messages scroll beneath it
  const [scrolled, setScrolled] = useState(false);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-canvas">
      <Header />
      <div className="flex min-h-0 flex-1 pr-4 pb-5">
        <Sidebar />
        <main className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-card bg-surface">
          <div
            className={`shrink-0 border-b px-4 pt-4 pb-4 transition-colors ${scrolled ? 'border-divider' : 'border-transparent'}`}
          >
            {toolbar}
          </div>
          <div
            ref={scrollRef}
            onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 0)}
            className="min-h-0 flex-1 overflow-y-auto px-4 pt-4 pb-20"
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

function Header() {
  return (
    <header className="flex items-center gap-[83px] pt-2 pr-[18px] pb-2.5 pl-6">
      <div className="flex items-center gap-4">
        <Icon src={icons.menu} size={24} />
        <div className="flex items-center gap-2">
          {/* The logo PNG is a sprite; only its left 34px is the mark */}
          <div className="relative h-10 w-[34px] overflow-hidden">
            <img src={logo} alt="" className="absolute top-0 left-0 h-full w-[320.59%] max-w-none" />
          </div>
          <span className="font-display text-logo text-ink">Gmel</span>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 items-center justify-between">
        <div className="flex max-w-[716px] min-w-[180px] flex-1 items-start justify-between rounded-full bg-search-field px-3 py-[11px]">
          <div className="flex items-center gap-2">
            <Icon src={icons.search} size={24} />
            <span className="text-search text-muted">Search mail</span>
          </div>
          <Icon src={icons.tune} size={24} />
        </div>
        <div className="flex items-center gap-5 pl-4">
          <Icon src={icons.help} size={24} />
          <Icon src={icons.settings} size={24} />
          <Icon src={icons.gemini} size={24} />
          <Icon src={icons.apps} size={24} />
          <img src={accountAvatar} alt="" width={32} height={32} className="block size-8" />
        </div>
      </div>
    </header>
  );
}

const categories = [
  { label: 'Inbox', icon: icons.inbox, count: 3, active: true },
  { label: 'Snoozed', icon: icons.schedule },
  { label: 'Sent', icon: icons.send },
  { label: 'Drafts', icon: icons.draft },
  { label: 'More', icon: icons.arrowDown },
];

const labels = [
  { label: 'Applications', icon: icons.labelApplications },
  { label: 'Bills', icon: icons.labelBills },
  { label: 'Docs', icon: icons.labelDocs },
  { label: 'Family', icon: icons.labelFamily },
  { label: 'Newsletters', icon: icons.labelNewsletters },
  { label: 'Reconstruction', icon: icons.labelReconstruction },
  { label: 'More', icon: icons.arrowDown },
];

function Sidebar() {
  return (
    <nav aria-label="Mail folders" className="flex w-64 shrink-0 flex-col gap-4 overflow-y-auto pt-2">
      <div className="pl-2">
        <div className="inline-flex items-center gap-4 rounded-card bg-compose py-[18px] pr-6 pl-4">
          <Icon src={icons.edit} size={24} />
          <span className="text-body font-medium text-ink-active">Compose</span>
        </div>
      </div>

      <div className="flex flex-col gap-6 pr-4">
        <ul className="flex flex-col">
          {categories.map((item) => (
            <SidebarItem key={item.label} {...item} />
          ))}
        </ul>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between pl-6">
            <span className="text-section font-medium text-ink">Labels</span>
            <Icon src={icons.add} />
          </div>
          <ul className="flex flex-col">
            {labels.map((item, i) => (
              <SidebarItem key={i} {...item} />
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
}

function SidebarItem({ label, icon, count, active }: { label: string; icon: string; count?: number; active?: boolean }) {
  const text = active ? 'font-bold text-ink-active' : 'text-ink-nav';
  return (
    <li className={`flex items-center gap-2.5 rounded-r-full py-1.5 pr-2.5 pl-6 ${active ? 'bg-nav-active' : ''}`}>
      <div className="flex w-44 items-center gap-[18px]">
        <Icon src={icon} />
        <span className={`truncate text-body ${text}`}>{label}</span>
      </div>
      {count !== undefined && <span className={`w-5 text-right text-body ${text}`}>{count}</span>}
    </li>
  );
}
