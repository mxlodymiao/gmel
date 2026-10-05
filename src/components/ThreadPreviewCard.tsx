import { icons } from '../assets/icons';
import { people } from '../data/thread';
import type { PreviewCard } from '../lib/threadView';
import { Avatar } from './Avatar';
import { VisibilityChip } from './VisibilityChip';

/**
 * Bordered card standing in for another branch: its latest message, who the
 * branch is visible to, and a link to switch to it. The whole card is clickable:
 * the link's click area stretches over it, so there's still just one button
 * (named "Open thread (2 replies)") for keyboard and screen reader users.
 */
export function ThreadPreviewCard({ card, onOpen }: { card: PreviewCard; onOpen: () => void }) {
  const sender = people[card.message.from];
  const label = card.target === 'side' ? 'Open thread' : 'Return to main thread';

  return (
    <div className="pl-14" data-preview-card={card.branchId}>
      <div className="relative flex items-center justify-between gap-4 rounded-card border-2 border-divider p-4 transition-colors duration-300 ease-in-out hover:bg-card-hover has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-link">
        <div className="flex min-w-0 items-center gap-4">
          <Avatar person={sender} />
          <div className="flex min-w-0 flex-col">
            <div className="flex items-center gap-2">
              <span className="text-body font-bold text-ink">{sender.name}</span>
              <VisibilityChip chip={card.chip} />
            </div>
            <p className="truncate text-meta text-muted">{card.message.body}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onOpen}
          className="flex shrink-0 cursor-pointer items-center gap-2 text-body text-link outline-none after:absolute after:inset-0 after:rounded-card after:content-['']"
        >
          <img src={icons.openThread} alt="" aria-hidden width={14} height={10.625} className="block rotate-180" />
          {`${label} (${card.replyCount} ${card.replyCount === 1 ? 'reply' : 'replies'})`}
        </button>
      </div>
    </div>
  );
}
