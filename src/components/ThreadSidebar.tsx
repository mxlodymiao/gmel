import type { ReactNode } from 'react';
import { icons } from '../assets/icons';
import { people } from '../data/thread';
import { formatShortDate } from '../lib/format';
import type { ActivityKind, TimelineItem } from '../lib/timeline';
import { joinNames } from '../lib/visibility';
import type { Message } from '../types';
import { Avatar } from './Avatar';
import { Icon } from './Icon';

/**
 * Right-hand panel: who's on the current thread, and a timeline of its messages.
 * The timeline follows the thread view: the open branch is the main line and the
 * other branch hangs off the fork.
 */
export function ThreadSidebar({
  recipients,
  timeline,
  onJump,
  onOpenBranch,
}: {
  recipients: string[];
  timeline: TimelineItem[];
  onJump: (messageId: string) => void;
  onOpenBranch: (branchId: string) => void;
}) {
  return (
    <aside
      aria-label="Thread details"
      className="flex w-[300px] shrink-0 flex-col overflow-y-auto border-l border-panel-border"
    >
      <section className="flex flex-col gap-4 border-b border-panel-border p-4">
        <div className="flex items-center gap-2">
          <Icon src={icons.users} size={18} />
          <h2 className="font-google-sans text-panel-title font-medium text-ink">Recipients ({recipients.length})</h2>
        </div>
        <ul className="flex flex-col gap-4">
          {recipients.map((id) => (
            <li key={id} className="flex items-center gap-3">
              <Avatar person={people[id]} size={36} />
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-body font-medium text-ink">{people[id].name}</span>
                <span className="truncate text-label text-ink-soft">{people[id].email}</span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-4 px-4 pt-4 pb-6">
        <h2 className="font-google-sans text-panel-title font-medium text-ink">Activity</h2>
        <ol>
          {timeline.map((item, i) => {
            const isLast = i === timeline.length - 1;
            switch (item.type) {
              case 'message':
                return (
                  <MessageNode
                    key={item.message.id}
                    message={item.message}
                    isLast={isLast}
                    onJump={() => onJump(item.message.id)}
                  />
                );
              case 'activity':
                return <ActivityNote key={`${item.kind}-${i}`} kind={item.kind} text={item.text} isLast={isLast} />;
              case 'branch':
                return (
                  <BranchNode
                    key={item.card.branchId}
                    from={item.card.message.from}
                    names={item.names}
                    isLast={isLast}
                    onOpen={() => onOpenBranch(item.card.branchId)}
                  />
                );
            }
          })}
        </ol>
      </section>
    </aside>
  );
}

// The 32px column the timeline line runs down; each row draws its own segment
// below its node so the rows join into one continuous line
function Track({ children, isLast }: { children?: ReactNode; isLast: boolean }) {
  return (
    <span className="flex w-8 shrink-0 flex-col items-center">
      {children}
      {!isLast && <span className="w-0.5 flex-1 bg-line" />}
    </span>
  );
}

function MessageNode({
  message,
  isLast,
  onJump,
}: {
  message: Message;
  isLast: boolean;
  onJump: () => void;
}) {
  const sender = people[message.from];
  return (
    <li>
      <button
        type="button"
        onClick={onJump}
        aria-label={`Go to ${sender.name}'s message, ${formatShortDate(message.sentAt)}`}
        className="focus-ring flex min-h-[68px] w-full cursor-pointer gap-2.5 rounded-chip text-left"
      >
        <Track isLast={isLast}>
          <Avatar person={sender} size={32} />
        </Track>
        {/* Name and date share one bold style; the snippet sits under them in soft gray */}
        <span className="flex min-w-0 flex-1 flex-col gap-1.5 pt-1.5 pb-5">
          <span className="flex items-center justify-between gap-2 text-body font-semibold text-ink">
            <span className="truncate">{sender.name}</span>
            <span className="shrink-0">{formatShortDate(message.sentAt)}</span>
          </span>
          <span className="truncate text-label text-ink-soft">{message.body}</span>
        </span>
      </button>
    </li>
  );
}

const activityIcons: Record<ActivityKind, string> = {
  private: icons.lock,
  audience: icons.audienceChange,
  subject: icons.subjectChange,
};

// A small note on the line, e.g. "Private conversation with Bear". The gap around the
// icon breaks the line, as in the Figma.
function ActivityNote({ kind, text, isLast }: { kind: ActivityKind; text: string; isLast: boolean }) {
  return (
    <li className="flex min-h-10 gap-2.5">
      <Track isLast={isLast}>
        <span className="py-1.5">
          <Icon src={activityIcons[kind]} size={14} />
        </span>
      </Track>
      <span className="pt-1 pb-3 text-caption text-subtle">{text}</span>
    </li>
  );
}

// The other branch, indented off the fork with an L-shaped connector
function BranchNode({
  from,
  names,
  isLast,
  onOpen,
}: {
  from: string;
  names: string[];
  isLast: boolean;
  onOpen: () => void;
}) {
  return (
    // Pulled up into the message above's bottom padding so the card sits close to it
    <li className="relative -mt-1 flex">
      <span className="flex w-8 shrink-0 justify-center">{!isLast && <span className="w-0.5 bg-line" />}</span>
      {/* Ends at the card's middle: half the row, less half the bottom padding */}
      <span
        aria-hidden
        className="absolute top-0 left-[15px] h-[calc(50%-6px)] w-[33px] rounded-bl-[10px] border-b-2 border-l-2 border-line"
      />
      <div className="ml-4 min-w-0 flex-1 pb-3">
        <button
          type="button"
          onClick={onOpen}
          className="focus-ring flex w-full cursor-pointer items-start gap-2 rounded-card border-2 border-line bg-surface p-3 text-left transition-colors duration-300 ease-in-out hover:bg-card-hover"
        >
          <Avatar person={people[from]} size={28} />
          <span className="flex min-w-0 flex-1 flex-col items-start gap-1">
            <span className="w-full truncate text-label font-semibold text-ink">{joinNames(names)}</span>
            {/* Same type and color as the "Open thread" link on the card in the thread */}
            <span className="flex items-center gap-1.5 text-body text-link">
              Open thread
              <Icon src={icons.arrowOutward} size={14} />
            </span>
          </span>
        </button>
      </div>
    </li>
  );
}
