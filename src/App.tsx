import { useMemo, useRef, useState } from 'react';
import { AppShell } from './components/AppShell';
import { ReplyBar } from './components/ReplyBar';
import { ThreadToolbar } from './components/ThreadToolbar';
import { ThreadView } from './components/ThreadView';
import { messages } from './data/thread';
import { deriveBranches } from './lib/branches';
import { buildThreadView } from './lib/threadView';

export default function App() {
  const thread = useMemo(() => deriveBranches(messages), []);
  const [branchId, setBranchId] = useState(thread.main.id);
  // The branch we just left, so focus lands on the card that leads back to it
  const [cameFrom, setCameFrom] = useState<string>();
  const view = buildThreadView(thread, branchId);
  const scrollRef = useRef<HTMLDivElement>(null);

  const openBranch = (id: string) => {
    setCameFrom(id === thread.main.id ? branchId : thread.main.id);
    setBranchId(id);
    scrollRef.current?.scrollTo({ top: 0 });
  };

  return (
    <AppShell toolbar={<ThreadToolbar />} scrollRef={scrollRef}>
      <ThreadView key={view.branchId} view={view} onOpenBranch={openBranch} focusCardFor={cameFrom} />
      <ReplyBar />
    </AppShell>
  );
}
