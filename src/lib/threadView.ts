import type { Branch, Chip, DerivedThread, Message } from '../types';
import { audienceOf, byTime, sameAudience } from './branches';
import { messageChip, threadChip } from './visibility';

export type MessageEntry = { message: Message; chip: Chip | null };

export type PreviewCard = {
  target: 'side' | 'main'; // "Open thread" vs "Return to main thread"
  branchId: string;
  message: Message;
  chip: Chip;
  replyCount: number; // messages in that branch you can't see from here
};

export type ThreadItem =
  | { type: 'message'; entry: MessageEntry; initiallyExpanded: boolean }
  | { type: 'collapsedCount'; entries: MessageEntry[] }
  | { type: 'subjectChange'; subject: string }
  | { type: 'preview'; card: PreviewCard };

export type ThreadViewModel = {
  branchId: string;
  subject: string;
  items: ThreadItem[];
};

// The card shows the latest message still sent only to the branch's audience,
// so a later reply that adds people back doesn't misrepresent who the thread is for
function previewCard(branch: Branch, target: PreviewCard['target'], replyCount: number): PreviewCard {
  const matching = branch.messages.filter((m) => sameAudience(audienceOf(m), branch.audience));
  const message = matching.at(-1) ?? branch.messages.at(-1)!;
  return { target, branchId: branch.id, message, chip: threadChip(branch), replyCount };
}

/**
 * Lays out one branch the way Gmail does, oldest at the top:
 * - First message, last two, and the message where a fork happens are visible;
 *   the last one is expanded.
 * - Two or more messages in between are folded into a count circle.
 * - A heading appears above any message whose subject changed.
 * - Main view: a card for each side branch, right where it forked off.
 * - Side view: the main thread up to the fork, a card back to the main thread
 *   at the fork, then the side branch. Both views mirror each other.
 */
export function buildThreadView(thread: DerivedThread, branchId: string): ThreadViewModel {
  const { main, sides, branchOf } = thread;
  const branchById = (id: string) => (id === main.id ? main : sides.find((b) => b.id === id)!);
  const branch = branchById(branchId);

  // Messages in this view, oldest first
  let shown: Message[];
  if (branch.kind === 'main') {
    shown = main.messages;
  } else {
    const firstInBranch = branch.messages[0];
    const beforeFork = main.messages.filter((m) => byTime(m, firstInBranch) < 0);
    shown = [...beforeFork, ...branch.messages];
  }

  // Cards for the other branches, each placed just before the first message
  // that comes after the fork (deriveBranches creates side branches oldest first).
  // Reply counts: every message in a side branch; for the main thread, only the
  // messages after the fork, since the side view already shows the ones before.
  const pendingCards =
    branch.kind === 'main'
      ? sides.map((side) => ({ card: previewCard(side, 'side', side.messages.length), forkStart: side.messages[0] }))
      : [
          {
            card: previewCard(main, 'main', main.messages.filter((m) => byTime(m, branch.messages[0]) > 0).length),
            forkStart: branch.messages[0],
          },
        ];

  // Keep fork points visible so each card sits right under the message it forked from
  const forkParentIds = (branch.kind === 'main' ? sides : [branch]).map((b) => b.forkParentId);
  const visible = new Set([shown[0], ...shown.slice(-2), ...shown.filter((m) => forkParentIds.includes(m.id))]);
  const hiddenCount = shown.length - visible.size;

  const items: ThreadItem[] = [];
  let pendingHidden: MessageEntry[] = [];
  const flushHidden = () => {
    if (pendingHidden.length === 0) return;
    items.push({ type: 'collapsedCount', entries: pendingHidden });
    pendingHidden = [];
  };

  let previousSubject = shown[0].subject;
  shown.forEach((message, index) => {
    while (pendingCards.length > 0 && byTime(pendingCards[0].forkStart, message) <= 0) {
      flushHidden();
      items.push({ type: 'preview', card: pendingCards.shift()!.card });
    }

    if (message.subject !== previousSubject) {
      flushHidden();
      items.push({ type: 'subjectChange', subject: message.subject });
      previousSubject = message.subject;
    }

    const entry: MessageEntry = {
      message,
      chip: messageChip(message, branchById(branchOf[message.id]), main),
    };

    // A single hidden message isn't worth a count circle, so just show it
    if (!visible.has(message) && hiddenCount >= 2) {
      pendingHidden.push(entry);
    } else {
      flushHidden();
      items.push({ type: 'message', entry, initiallyExpanded: index === shown.length - 1 });
    }
  });

  // Branches that started after the last message shown
  for (const { card } of pendingCards) items.push({ type: 'preview', card });

  return {
    branchId,
    subject: shown[0].subject,
    items,
  };
}
