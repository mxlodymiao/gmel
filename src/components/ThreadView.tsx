import { Fragment, useEffect, useRef } from 'react';
import { icons } from '../assets/icons';
import { foldedMessages, type MessageEntry, type ThreadItem, type ThreadViewModel } from '../lib/threadView';
import { CollapsedCount } from './CollapsedCount';
import { MessageCollapsed } from './MessageCollapsed';
import { MessageExpanded } from './MessageExpanded';
import { SubjectHeading } from './SubjectHeading';
import { ThreadPreviewCard } from './ThreadPreviewCard';

// What's on screen after the user has revealed counts: rows, counts, headings, cards
type Row =
  | { type: 'message'; entry: MessageEntry; isLast: boolean; wasHidden?: boolean }
  | { type: 'count'; key: string; entries: MessageEntry[] }
  | Extract<ThreadItem, { type: 'subjectChange' | 'preview' }>;

/**
 * Renders one branch. Which messages are open and which counts are revealed is
 * owned by App, so the sidebar timeline can stay in sync with it.
 * `focusCardFor` puts keyboard focus on that branch's card link after switching views.
 */
export function ThreadView({
  view,
  expanded,
  revealed,
  onToggle,
  onReveal,
  onOpenBranch,
  focusCardFor,
}: {
  view: ThreadViewModel;
  expanded: Set<string>;
  revealed: Set<string>;
  onToggle: (messageId: string) => void;
  onReveal: (countKey: string) => void;
  onOpenBranch: (branchId: string) => void;
  focusCardFor?: string;
}) {
  const lastId = lastMessageId(view.items);

  // Toggling swaps one button for another, so move focus to the new one
  const containerRef = useRef<HTMLDivElement>(null);
  const pendingFocus = useRef<string | null>(null);
  useEffect(() => {
    if (!pendingFocus.current) return;
    containerRef.current?.querySelector<HTMLElement>(`[data-message-id="${pendingFocus.current}"] button`)?.focus();
    pendingFocus.current = null;
  });

  useEffect(() => {
    if (!focusCardFor) return;
    containerRef.current?.querySelector<HTMLElement>(`[data-preview-card="${focusCardFor}"] button`)?.focus();
  }, [focusCardFor]);

  const toggle = (id: string) => {
    onToggle(id);
    pendingFocus.current = id;
  };

  const reveal = (key: string) => {
    onReveal(key);
    pendingFocus.current = key; // the key is the first hidden message's id
  };

  const rows: Row[] = view.items.flatMap((item): Row[] => {
    if (item.type === 'message') return [{ type: 'message', entry: item.entry, isLast: item.entry.message.id === lastId }];
    if (item.type !== 'collapsedCount') return [item];
    const { key } = item;
    if (!revealed.has(key)) return [{ type: 'count', key, entries: foldedMessages(item.items) }];
    return item.items.map((folded) =>
      folded.type === 'message' ? { type: 'message', entry: folded.entry, isLast: false, wasHidden: true } : folded,
    );
  });

  const isOpen = (row: Row | undefined) => row?.type === 'message' && expanded.has(row.entry.message.id);
  const wasHidden = (row: Row | undefined) => row?.type === 'message' && !!row.wasHidden;
  const isMessage = (row: Row | undefined) => row?.type === 'message';

  // A rule goes around open messages, between messages revealed from a count
  // (and their neighbors), after a preview card, and before a subject change
  const dividerBefore = (prev: Row | undefined, row: Row) => {
    if (!prev || prev.type === 'subjectChange') return false;
    if (row.type === 'subjectChange' || isOpen(prev) || isOpen(row)) return true;
    if (prev.type === 'preview' && isMessage(row)) return true;
    return isMessage(prev) && isMessage(row) && (wasHidden(prev) || wasHidden(row));
  };

  return (
    <div ref={containerRef} className="flex flex-col gap-5">
      <SubjectHeading subject={view.subject} isTitle />
      {rows.map((row, i) => (
        <Fragment key={rowKey(row)}>
          {dividerBefore(rows[i - 1], row) && <img src={icons.divider} alt="" aria-hidden className="block h-px w-full" />}
          {renderRow(row)}
        </Fragment>
      ))}
    </div>
  );

  function renderRow(row: Row) {
    switch (row.type) {
      case 'message': {
        const { message } = row.entry;
        return (
          <div data-message-id={message.id} className="scroll-mt-4">
            {expanded.has(message.id) ? (
              <MessageExpanded
                message={message}
                chip={row.entry.chip}
                onCollapse={row.isLast ? undefined : () => toggle(message.id)}
              />
            ) : (
              <MessageCollapsed message={message} chip={row.entry.chip} onExpand={() => toggle(message.id)} />
            )}
          </div>
        );
      }
      case 'count':
        return <CollapsedCount count={row.entries.length} onReveal={() => reveal(row.key)} />;
      case 'subjectChange':
        return <SubjectHeading subject={row.subject} />;
      case 'preview':
        return <ThreadPreviewCard card={row.card} onOpen={() => onOpenBranch(row.card.branchId)} />;
    }
  }
}

function lastMessageId(items: ThreadItem[]): string | undefined {
  const messages = items.filter((i) => i.type === 'message');
  return messages.at(-1)?.entry.message.id;
}

function rowKey(row: Row): string {
  switch (row.type) {
    case 'message':
      return row.entry.message.id;
    case 'count':
      return `count-${row.key}`;
    case 'subjectChange':
      return `subject-${row.subject}`;
    case 'preview':
      return `preview-${row.card.branchId}`;
  }
}
