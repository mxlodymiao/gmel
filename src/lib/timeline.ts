import { people } from '../data/thread';
import type { DerivedThread, Message } from '../types';
import { audienceOf } from './branches';
import type { PreviewCard, ThreadViewModel } from './threadView';
import { joinNames, namesFor } from './visibility';

export type ActivityKind = 'private' | 'audience' | 'subject';

export type TimelineItem =
  | { type: 'message'; message: Message }
  | { type: 'activity'; kind: ActivityKind; text: string }
  | { type: 'branch'; card: PreviewCard; names: string[] };

const firstNames = (ids: string[]) => joinNames(ids.map((id) => people[id].name).sort());

// What changed between a reply and the message it replies to
function activityFor(message: Message, parent: Message | undefined): TimelineItem[] {
  if (!parent) return [];
  const before = audienceOf(parent);
  const after = audienceOf(message);
  const removed = before.filter((id) => !after.includes(id));
  const added = after.filter((id) => !before.includes(id));

  const items: TimelineItem[] = [];
  if (removed.length > 0) {
    items.push(
      after.length === 2
        ? { type: 'activity', kind: 'private', text: `Private conversation with ${joinNames(namesFor(after))}` }
        : { type: 'activity', kind: 'audience', text: `${firstNames(removed)} removed` },
    );
  }
  if (added.length > 0) items.push({ type: 'activity', kind: 'audience', text: `${firstNames(added)} added` });
  if (message.subject !== parent.subject) {
    items.push({ type: 'activity', kind: 'subject', text: `Subject changed to "${message.subject}"` });
  }
  return items;
}

/**
 * The sidebar's activity timeline for the current view: the same messages in the
 * same order, the other branch as a card at the fork, and notes where the
 * audience or subject changed. Messages folded into a count circle are listed
 * too, so the timeline always shows the whole path.
 */
export function buildTimeline(thread: DerivedThread, view: ThreadViewModel): TimelineItem[] {
  const all = [thread.main, ...thread.sides].flatMap((b) => b.messages);
  const byId = new Map(all.map((m) => [m.id, m]));
  const branchById = (id: string) => [thread.main, ...thread.sides].find((b) => b.id === id)!;

  const messageItems = (message: Message): TimelineItem[] => [
    ...activityFor(message, message.parentId ? byId.get(message.parentId) : undefined),
    { type: 'message', message },
  ];

  const branchItem = (card: PreviewCard): TimelineItem => ({
    type: 'branch',
    card,
    names: namesFor(branchById(card.branchId).audience),
  });

  return view.items.flatMap((item): TimelineItem[] => {
    switch (item.type) {
      case 'message':
        return messageItems(item.entry.message);
      case 'collapsedCount':
        return item.items.flatMap((folded) =>
          folded.type === 'message' ? messageItems(folded.entry.message) : [branchItem(folded.card)],
        );
      case 'preview':
        return [branchItem(item.card)];
      case 'subjectChange':
        return []; // covered by the subject activity note
    }
  });
}
