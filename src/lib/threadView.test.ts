import { describe, expect, it } from 'vitest';
import { messages } from '../data/thread';
import { deriveBranches } from './branches';
import { buildThreadView, type PreviewCard, type ThreadViewModel } from './threadView';
import { chipText } from './visibility';

const cardLine = (card: PreviewCard) =>
  `card ${card.message.id} [${chipText(card.chip)}] -> ${card.target === 'side' ? 'Open thread' : 'Return to main thread'} (${card.replyCount})`;

// One line per thing on screen, top to bottom
function outline(view: ThreadViewModel): string[] {
  const lines = [`subject: ${view.subject}`];
  for (const item of view.items) {
    if (item.type === 'message') {
      const chip = item.entry.chip ? ` [${chipText(item.entry.chip)}]` : '';
      lines.push(`${item.entry.message.id} ${item.initiallyExpanded ? 'expanded' : 'collapsed'}${chip}`);
    } else if (item.type === 'collapsedCount') {
      lines.push(`(${item.entries.length}) ${item.entries.map((e) => e.message.id).join(' ')}`);
    } else if (item.type === 'subjectChange') {
      lines.push(`subject: ${item.subject}`);
    } else {
      lines.push(cardLine(item.card));
    }
  }
  return lines;
}

describe('thread views', () => {
  const thread = deriveBranches(messages);

  it('splits m5 and m7 into one side branch', () => {
    expect(thread.main.messages.map((m) => m.id)).toEqual(['m1', 'm2', 'm3', 'm4', 'm6']);
    expect(thread.sides.map((b) => b.messages.map((m) => m.id))).toEqual([['m5', 'm7']]);
  });

  it('lays out the main view', () => {
    const view = outline(buildThreadView(thread, 'main'));
    console.log(`MAIN VIEW\n  ${view.join('\n  ')}`);
    expect(view).toEqual([
      'subject: Website copy feedback',
      'm1 collapsed',
      '(2) m2 m3',
      'm4 collapsed',
      'card m5 [Thread visible to Bear & me] -> Open thread (2)',
      'm6 expanded',
    ]);
  });

  it('lays out the side view', () => {
    const view = outline(buildThreadView(thread, thread.sides[0].id));
    console.log(`SIDE VIEW\n  ${view.join('\n  ')}`);
    expect(view).toEqual([
      'subject: Website copy feedback',
      'm1 collapsed',
      '(2) m2 m3',
      'm4 collapsed',
      'card m6 [Thread visible to Adam, Bear & me] -> Return to main thread (1)',
      'm5 collapsed [Private conversation between Bear & me]',
      'subject: [Approved] Website copy feedback',
      'm7 expanded [Visible to Adam, Bear & me]',
    ]);
  });
});
