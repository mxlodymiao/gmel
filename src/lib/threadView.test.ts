import { describe, expect, it } from 'vitest';
import { messages } from '../data/thread';
import { deriveBranches } from './branches';
import { buildThreadView, foldedMessages, type PreviewCard, type ThreadViewModel } from './threadView';
import { recipientsOf, buildTimeline } from './timeline';
import { chipText, joinNames } from './visibility';

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
      const folded = item.items.map((f) => (f.type === 'message' ? f.entry.message.id : cardLine(f.card)));
      lines.push(`(${foldedMessages(item.items).length}) ${folded.join(' | ')}`);
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
      '(2) m2 | m3',
      'm4 collapsed',
      'card m5 [Thread visible to Bear] -> Open thread (2)',
      'm6 expanded',
    ]);
  });

  it('lays out the side view', () => {
    const view = outline(buildThreadView(thread, thread.sides[0].id));
    console.log(`SIDE VIEW\n  ${view.join('\n  ')}`);
    expect(view).toEqual([
      'subject: Website copy feedback',
      'm1 collapsed',
      '(3) m2 | m3 | m4 | card m6 [Thread visible to Adam, Bear] -> Return to main thread (1)',
      'm5 collapsed [Private conversation with Bear]',
      'subject: [Approved] Website copy feedback',
      'm7 expanded [Visible to Adam, Bear]',
    ]);
  });
});

describe('activity timeline', () => {
  const thread = deriveBranches(messages);
  const timeline = (branchId: string) =>
    buildTimeline(thread, buildThreadView(thread, branchId)).map((item) => {
      if (item.type === 'message') return `${item.message.id}`;
      if (item.type === 'activity') return `[${item.kind}] ${item.text}`;
      return `branch: ${joinNames(item.names)}`;
    });

  it('mirrors the main view', () => {
    expect(timeline('main')).toEqual(['m1', 'm2', 'm3', 'm4', 'branch: Bear', 'm6']);
  });

  it('mirrors the side view, with audience and subject changes', () => {
    expect(timeline(thread.sides[0].id)).toEqual([
      'm1',
      'm2',
      'm3',
      'm4',
      'branch: Adam, Bear',
      '[private] Private conversation with Bear',
      'm5',
      '[audience] Adam added',
      '[subject] Subject changed to "[Approved] Website copy feedback"',
      'm7',
    ]);
  });

  it('lists everyone on the current branch', () => {
    expect(recipientsOf(thread.main)).toEqual(['bear', 'me', 'adam']);
    expect(recipientsOf(thread.sides[0])).toEqual(['bear', 'me', 'adam']);
  });
});
