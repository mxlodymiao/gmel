import { ME, people } from '../data/thread';
import type { Branch, Chip, Message } from '../types';
import { audienceOf, sameAudience } from './branches';

// Everyone else in an audience, alphabetically. You're always on your own
// thread, so labels leave you out: "Visible to Adam, Bear"
export function namesFor(audience: string[]): string[] {
  return audience
    .filter((id) => id !== ME)
    .map((id) => people[id].name)
    .sort();
}

export function joinNames(names: string[]): string {
  return names.join(', ');
}

export function chipText(chip: Chip): string {
  return `${chip.lead} ${joinNames(chip.names)}`.trim();
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
  if (names.length === 0) return { lead: 'Only visible to you', names };
  if (names.length === 1) return { lead: 'Private conversation with', names };
  return { lead: 'Visible to', names };
}

// Chip on a thread preview card: who the whole branch is for
export function threadChip(branch: Branch): Chip {
  return { lead: 'Thread visible to', names: namesFor(branch.audience) };
}
