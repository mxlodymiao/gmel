import { icons } from '../assets/icons';
import { people } from '../data/thread';
import { formatSentAt } from '../lib/format';
import type { Chip, Message } from '../types';
import { Avatar } from './Avatar';
import { Icon } from './Icon';
import { VisibilityChip } from './VisibilityChip';

// One-line message row: avatar, sender, snippet, date. Click to expand.
export function MessageCollapsed({
  message,
  chip,
  onExpand,
}: {
  message: Message;
  chip: Chip | null;
  onExpand: () => void;
}) {
  const sender = people[message.from];
  return (
    <button
      type="button"
      aria-expanded={false}
      onClick={onExpand}
      className="focus-ring clickable-row flex items-center justify-between gap-4 text-left"
    >
      <span className="flex min-w-0 items-center gap-4">
        <Avatar person={sender} />
        <span className="flex min-w-0 flex-col">
          <span className="flex items-center gap-2">
            <span className="text-body font-bold text-ink">{sender.name}</span>
            {chip && <VisibilityChip chip={chip} />}
          </span>
          <span className="truncate text-meta text-muted">{message.body}</span>
        </span>
      </span>
      <span className="flex shrink-0 items-center gap-5">
        <span className="text-meta text-muted">{formatSentAt(message.sentAt)}</span>
        <Icon src={icons.starEmpty} />
      </span>
    </button>
  );
}
