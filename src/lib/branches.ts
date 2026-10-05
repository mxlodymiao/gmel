import type { Branch, DerivedThread, Message } from '../types';

// Audience = sender + To + CC. Including the sender means your own replies
// always count you in (rule 5).
export function audienceOf(message: Message): string[] {
  return [...new Set([message.from, ...message.to, ...message.cc])];
}

export function sameAudience(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((id) => b.includes(id));
}

// Oldest first; ties broken by id so the order is stable (rule 6)
export function byTime(a: Message, b: Message): number {
  return a.sentAt.localeCompare(b.sentAt) || a.id.localeCompare(b.id);
}

/**
 * Splits a thread into the main branch and its side branches.
 *
 * Walking messages oldest to newest:
 * - A message with no parent starts the main branch.
 * - A reply inside a side branch stays there, even if it adds everyone back (rule 3).
 * - A reply to a main-thread message that drops anyone from the parent's
 *   audience starts a new side branch (rule 1).
 * - Otherwise, including replies that only add people, it stays in main (rule 2).
 *
 * Subject changes are ignored here; they're shown inline, not as branches (rule 4).
 */
export function deriveBranches(messages: Message[]): DerivedThread {
  const byId = new Map(messages.map((m) => [m.id, m]));
  const main: Branch = { id: 'main', kind: 'main', messages: [], audience: [], forkParentId: null };
  const sides: Branch[] = [];
  const branchOf: Record<string, string> = {};
  const branchById = (id: string) => (id === main.id ? main : sides.find((b) => b.id === id)!);

  const add = (branch: Branch, message: Message) => {
    branch.messages.push(message);
    branchOf[message.id] = branch.id;
  };

  for (const message of [...messages].sort(byTime)) {
    const parent = message.parentId ? byId.get(message.parentId) : undefined;
    if (!parent) {
      add(main, message);
      continue;
    }

    const parentBranch = branchById(branchOf[parent.id]);
    if (parentBranch.kind === 'side') {
      add(parentBranch, message);
      continue;
    }

    const audience = audienceOf(message);
    const removedSomeone = audienceOf(parent).some((id) => !audience.includes(id));
    if (removedSomeone) {
      const side: Branch = {
        id: `side-${message.id}`,
        kind: 'side',
        messages: [],
        audience,
        forkParentId: parent.id,
      };
      sides.push(side);
      add(side, message);
    } else {
      add(main, message);
    }
  }

  // The main audience is everyone who's been on the main thread, since adding
  // people doesn't branch
  main.audience = [...new Set(main.messages.flatMap(audienceOf))];

  return { main, sides, branchOf };
}
