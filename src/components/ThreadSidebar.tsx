import { useState, type ReactNode } from 'react';
import { icons } from '../assets/icons';
import { people } from '../data/thread';
import { formatShortDate } from '../lib/format';
import type { ActivityKind, TimelineItem } from '../lib/timeline';
import { joinNames } from '../lib/visibility';
import type { Message } from '../types';
import { Avatar } from './Avatar';
import { Icon } from './Icon';

/**
 * Right-hand activity panel: a timeline of the open thread. The open branch is
 * the main line and the other branch hangs off the fork.
 *
 * Clicking the "Activity" title collapses it to a narrow rail of avatars and
 * activity icons, with a fork icon standing in for the other branch and just
 * the « button to expand it again. Hovering an icon shows what it stands for.
 */
export function ThreadSidebar({
  timeline,
  onJump,
  onOpenBranch,
}: {
  timeline: TimelineItem[];
  onJump: (messageId: string) => void;
  onOpenBranch: (branchId: string) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      aria-label="Activity"
      className={`flex shrink-0 flex-col overflow-x-hidden overflow-y-auto border-l border-divider transition-[width] duration-300 ease-in-out ${
        collapsed ? 'w-20' : 'w-[300px]'
      }`}
    >
      <div className={`pt-4 pb-4 transition-[padding] duration-300 ease-in-out ${collapsed ? 'px-2.5' : 'px-4'}`}>
        <button
          type="button"
          aria-expanded={!collapsed}
          aria-controls="activity-timeline"
          onClick={() => setCollapsed((c) => !c)}
          className={`focus-ring flex w-full cursor-pointer items-center gap-1 rounded-chip whitespace-nowrap ${
            collapsed ? 'justify-center' : 'justify-between'
          }`}
        >
          {/* Hidden when collapsed, but still names the button for screen readers */}
          <h2 className={collapsed ? 'sr-only' : 'font-google-sans text-panel-title font-medium text-ink'}>Activity</h2>
          {/* » collapses toward the edge; flipped to « to expand again */}
          <Icon src={icons.collapsePanel} size={20} className={collapsed ? 'rotate-180' : ''} />
        </button>
      </div>

      <ol
        id="activity-timeline"
        className={`pb-6 transition-[padding] duration-300 ease-in-out ${collapsed ? 'px-6' : 'px-4'}`}
      >
        {timeline.map((item, i) => {
          const isLast = i === timeline.length - 1;
          switch (item.type) {
            case 'message':
              return (
                <MessageNode
                  key={item.message.id}
                  message={item.message}
                  collapsed={collapsed}
                  isLast={isLast}
                  onJump={() => onJump(item.message.id)}
                />
              );
            case 'activity':
              return (
                <ActivityNote
                  key={`${item.kind}-${i}`}
                  kind={item.kind}
                  text={item.text}
                  collapsed={collapsed}
                  isLast={isLast}
                />
              );
            case 'branch':
              return collapsed ? (
                <ForkNode
                  key={item.card.branchId}
                  names={item.names}
                  isLast={isLast}
                  onOpen={() => onOpenBranch(item.card.branchId)}
                />
              ) : (
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
    </aside>
  );
}

// The 32px column the timeline line runs down; each row draws its own segment
// below its node so the rows join into one continuous line
function Track({ children, isLast }: { children?: ReactNode; isLast: boolean }) {
  return (
    <span className="flex w-8 shrink-0 flex-col items-center">
      {children}
      {!isLast && <span className="w-0.5 flex-1 bg-divider" />}
    </span>
  );
}

function MessageNode({
  message,
  collapsed,
  isLast,
  onJump,
}: {
  message: Message;
  collapsed: boolean;
  isLast: boolean;
  onJump: () => void;
}) {
  const sender = people[message.from];
  const label = `${sender.name}, ${formatShortDate(message.sentAt)}`;
  return (
    <li>
      <button
        type="button"
        onClick={onJump}
        aria-label={`Go to ${sender.name}'s message, ${formatShortDate(message.sentAt)}`}
        title={collapsed ? label : undefined}
        className={`focus-ring flex w-full cursor-pointer gap-2.5 rounded-chip text-left ${collapsed ? 'min-h-12' : 'min-h-[68px]'}`}
      >
        <Track isLast={isLast}>
          <Avatar person={sender} size={32} />
        </Track>
        {!collapsed && (
          // Name and date share one bold style; the snippet sits under them in soft gray
          <span className="flex min-w-0 flex-1 flex-col gap-1.5 pt-1.5 pb-5">
            <span className="flex items-center justify-between gap-2 text-body font-semibold text-ink">
              <span className="truncate">{sender.name}</span>
              <span className="shrink-0">{formatShortDate(message.sentAt)}</span>
            </span>
            <span className="truncate text-label text-ink-soft">{message.body}</span>
          </span>
        )}
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
// icon breaks the line, as in the Figma. Collapsed, only the icon shows.
function ActivityNote({
  kind,
  text,
  collapsed,
  isLast,
}: {
  kind: ActivityKind;
  text: string;
  collapsed: boolean;
  isLast: boolean;
}) {
  return (
    <li className="flex min-h-10 gap-2.5" title={collapsed ? text : undefined}>
      <Track isLast={isLast}>
        <span className="py-1.5">
          <Icon src={activityIcons[kind]} size={14} />
        </span>
      </Track>
      <span className={collapsed ? 'sr-only' : 'pt-1 pb-3 text-caption text-subtle'}>{text}</span>
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
      <span className="flex w-8 shrink-0 justify-center">{!isLast && <span className="w-0.5 bg-divider" />}</span>
      {/* Ends at the card's middle: half the row, less half the bottom padding */}
      <span
        aria-hidden
        className="absolute top-0 left-[15px] h-[calc(50%-6px)] w-[33px] rounded-bl-[10px] border-b-2 border-l-2 border-divider"
      />
      <div className="ml-4 min-w-0 flex-1 pb-3">
        <button
          type="button"
          onClick={onOpen}
          className="focus-ring flex w-full cursor-pointer items-start gap-2 rounded-card border-2 border-divider bg-surface p-3 text-left transition-colors duration-300 ease-in-out hover:bg-card-hover"
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

// Collapsed stand-in for the branch card: a fork icon on the line, same size as
// an avatar, that still opens the other thread
function ForkNode({ names, isLast, onOpen }: { names: string[]; isLast: boolean; onOpen: () => void }) {
  const label = `Open thread with ${joinNames(names)}`;
  return (
    <li className="flex min-h-12">
      <Track isLast={isLast}>
        <button
          type="button"
          onClick={onOpen}
          aria-label={label}
          title={label}
          className="focus-ring flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 border-divider bg-surface transition-colors duration-300 ease-in-out hover:bg-card-hover"
        >
          <Icon src={icons.fork} size={16} />
        </button>
      </Track>
    </li>
  );
}
