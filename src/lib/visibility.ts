import { ME, people } from '../data/thread';
import type { Branch, Chip, Message } from '../types';
import { audienceOf, sameAudience } from './branches';

// Other people alphabetically, "me" always last
function namesFor(audience: string[]): string[] {
  const others = audience
    .filter((id) => id !== ME)
    .map((id) => people[id].name)
    .sort();
  return audience.includes(ME) ? [...others, 'me'] : others;
}

// What goes before the i-th name: "Adam, Bear & me" (no comma before "&")
export function separatorBefore(index: number, count: number): string {
  if (index === 0) return '';
  return index === count - 1 ? ' & ' : ', ';
}

export function joinNames(names: string[]): string {
  return names.map((name, i) => separatorBefore(i, names.length) + name).join('');
}

export function chipText(chip: Chip): string {
  return `${chip.lead} ${joinNames(chip.names)}`;
}

/**
 * A message gets a chip when its audience isn't the one a reader would assume:
 * the full thread on the main thread, or the side branch's own audience inside
 * a side branch. In practice every side-branch message gets one, since a side
 * branch's audience always differs from the full thread.
 */
export function messageChip(message: Message, branch: Branch, main: Branch): Chip | null {
  const audience = audienceOf(message);
  const differsFromMain = !sameAudience(audience, main.audience);
  const differsFromBranch = branch.kind === 'side' && !sameAudience(audience, branch.audience);
  if (!differsFromMain && !differsFromBranch) return null;

  const names = namesFor(audience);
  if (names.length === 1) return { lead: 'Only visible to', names };
  if (names.length === 2) return { lead: 'Private conversation between', names };
  return { lead: 'Visible to', names };
}

// Chip on a thread preview card: who the whole branch is for
export function threadChip(branch: Branch): Chip {
  return { lead: 'Thread visible to', names: namesFor(branch.audience) };
}
