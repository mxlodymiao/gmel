import type { ReactNode } from 'react';
import { icons } from '../assets/icons';
import { people } from '../data/thread';
import { formatSentAt, recipientsLine } from '../lib/format';
import type { Chip, Message } from '../types';
import { Avatar } from './Avatar';
import { Icon } from './Icon';
import { VisibilityChip } from './VisibilityChip';

/**
 * Full message: header plus body. Clicking the header collapses it, except on
 * the last message, which stays open like Gmail (pass no onCollapse).
 */
export function MessageExpanded({
  message,
  chip,
  onCollapse,
}: {
  message: Message;
  chip: Chip | null;
  onCollapse?: () => void;
}) {
  const sender = people[message.from];

  const header: ReactNode = (
    <>
      <span className="flex min-w-0 items-center gap-4">
        <Avatar person={sender} />
        <span className="flex min-w-0 flex-col">
          <span className="flex items-center gap-1 whitespace-nowrap">
            <span className="text-body font-bold text-ink">{sender.name}</span>
            <span className="text-meta text-muted">{`<${sender.email}>`}</span>
          </span>
          <span className="flex items-start gap-1">
            <span className="flex items-start">
              <span className="text-meta text-muted">{recipientsLine(message)}</span>
              <Icon src={icons.arrowDropDown} />
            </span>
            {chip && <VisibilityChip chip={chip} />}
          </span>
        </span>
      </span>
      <span className="flex shrink-0 items-center gap-5">
        <span className="text-meta text-muted">{formatSentAt(message.sentAt)}</span>
        <Icon src={icons.starEmpty} />
        <Icon src={icons.mood} />
        <Icon src={icons.reply} />
        <Icon src={icons.moreVert} />
      </span>
    </>
  );

  const headerClass = 'flex items-center justify-between gap-4 text-left';

  return (
    <article className="flex flex-col gap-4">
      {onCollapse ? (
        <button
          type="button"
          aria-expanded
          onClick={onCollapse}
          className={`focus-ring clickable-row ${headerClass}`}
        >
          {header}
        </button>
      ) : (
        <div className={`w-full ${headerClass}`}>{header}</div>
      )}
      <p className="min-h-[49px] pl-14 font-email text-body whitespace-pre-wrap text-ink">{message.body}</p>
    </article>
  );
}
