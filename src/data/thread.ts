import type { Message, Person } from '../types';

export const ME = 'me';

// Treat this as "now" so relative times match the Figma frames
export const NOW = new Date('2026-10-04T09:08:00');

// Avatar files are added with the static shell (step 2)
export const people: Record<string, Person> = {
  me: { id: 'me', name: 'Melody Miao', email: 'melody@gmail.com', avatar: '/avatars/melody.png' },
  bear: { id: 'bear', name: 'Bear', email: 'bear@berkeley.edu', avatar: '/avatars/bear.png' },
  adam: { id: 'adam', name: 'Adam', email: 'adam@gmail.com', avatar: '/avatars/adam.png' },
};

const SUBJECT = 'Website copy feedback';

export const messages: Message[] = [
  {
    id: 'm1',
    parentId: null,
    from: 'bear',
    to: ['me', 'adam'],
    cc: [],
    subject: SUBJECT,
    sentAt: '2026-10-03T18:06:00',
    body: 'Draft has 3 sections: 1) Hero headline 2) Pricing 3) FAQ. Thoughts on any of them?',
  },
  {
    id: 'm2',
    parentId: 'm1',
    from: 'adam',
    to: ['bear', 'me'],
    cc: [],
    subject: SUBJECT,
    sentAt: '2026-10-03T18:07:00',
    body: 'Section 1: the headline feels too long.',
  },
  {
    id: 'm3',
    parentId: 'm2',
    from: 'bear',
    to: ['adam', 'me'],
    cc: [],
    subject: SUBJECT,
    sentAt: '2026-10-03T18:07:00',
    body: 'Good call on Section 1. How about "Ship faster"?',
  },
  {
    id: 'm4',
    parentId: 'm1',
    from: 'me',
    to: ['bear', 'adam'],
    cc: [],
    subject: SUBJECT,
    sentAt: '2026-10-03T18:08:00',
    body: 'Section 3: the FAQ needs a refund question.',
  },
  {
    id: 'm5',
    parentId: 'm4',
    from: 'bear',
    to: ['me'],
    cc: [],
    subject: SUBJECT,
    sentAt: '2026-10-03T18:08:00',
    body: "Agree on Section 3. Let's sort it out offline, just us.",
  },
  {
    id: 'm6',
    parentId: 'm3',
    from: 'adam',
    to: ['me', 'bear'],
    cc: [],
    subject: SUBJECT,
    sentAt: '2026-10-03T18:09:00',
    body: '"Ship faster" works for Section 1.',
  },
  {
    id: 'm7',
    parentId: 'm5',
    from: 'me',
    to: ['adam', 'bear'],
    cc: [],
    subject: `[Approved] ${SUBJECT}`,
    sentAt: '2026-10-04T08:58:00',
    body: 'Update: Manager has approved!',
  },
];
