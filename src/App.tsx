import { useEffect, useMemo, useRef, useState } from 'react';
import { AppShell } from './components/AppShell';
import { ReplyBar } from './components/ReplyBar';
import { ThreadSidebar } from './components/ThreadSidebar';
import { ThreadToolbar } from './components/ThreadToolbar';
import { ThreadView } from './components/ThreadView';
import { messages } from './data/thread';
import { deriveBranches } from './lib/branches';
import { buildTimeline } from './lib/timeline';
import { buildThreadView, type ThreadViewModel } from './lib/threadView';

// Which messages are open and which count circles are revealed, for one view
type OpenState = { expanded: Set<string>; revealed: Set<string> };

function initialOpenState(view: ThreadViewModel): OpenState {
  const expanded = view.items.flatMap((i) => (i.type === 'message' && i.initiallyExpanded ? [i.entry.message.id] : []));
  return { expanded: new Set(expanded), revealed: new Set() };
}

export default function App() {
  const thread = useMemo(() => deriveBranches(messages), []);
  const [branchId, setBranchId] = useState(thread.main.id);
  // The branch we just left, so focus lands on the card that leads back to it
  const [cameFrom, setCameFrom] = useState<string>();
  const view = buildThreadView(thread, branchId);
  const [open, setOpen] = useState(() => initialOpenState(view));
  const scrollRef = useRef<HTMLDivElement>(null);

  // After a timeline click re-renders the thread, scroll to and focus that message
  const pendingJump = useRef<string | null>(null);
  useEffect(() => {
    const id = pendingJump.current;
    if (!id) return;
    pendingJump.current = null;
    const el = scrollRef.current?.querySelector<HTMLElement>(`[data-message-id="${id}"]`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    el?.querySelector('button')?.focus({ preventScroll: true });
  });

  const openBranch = (id: string) => {
    setCameFrom(id === thread.main.id ? branchId : thread.main.id);
    setBranchId(id);
    setOpen(initialOpenState(buildThreadView(thread, id)));
    scrollRef.current?.scrollTo({ top: 0 });
  };

  const toggle = (id: string) =>
    setOpen((prev) => {
      const expanded = new Set(prev.expanded);
      if (expanded.has(id)) expanded.delete(id);
      else expanded.add(id);
      return { ...prev, expanded };
    });

  const reveal = (key: string) => setOpen((prev) => ({ ...prev, revealed: new Set(prev.revealed).add(key) }));

  // From the timeline: reveal the message if it's folded into a count, open it, scroll to it
  const jumpTo = (id: string) => {
    const count = view.items.find(
      (i) => i.type === 'collapsedCount' && i.items.some((f) => f.type === 'message' && f.entry.message.id === id),
    );
    setOpen((prev) => ({
      expanded: new Set(prev.expanded).add(id),
      revealed: count?.type === 'collapsedCount' ? new Set(prev.revealed).add(count.key) : prev.revealed,
    }));
    pendingJump.current = id;
  };

  return (
    <AppShell
      toolbar={<ThreadToolbar />}
      scrollRef={scrollRef}
      sidebar={
        <ThreadSidebar
          timeline={buildTimeline(thread, view)}
          onJump={jumpTo}
          onOpenBranch={openBranch}
        />
      }
    >
      <ThreadView
        key={view.branchId}
        view={view}
        expanded={open.expanded}
        revealed={open.revealed}
        onToggle={toggle}
        onReveal={reveal}
        onOpenBranch={openBranch}
        focusCardFor={cameFrom}
      />
      <ReplyBar />
    </AppShell>
  );
}
