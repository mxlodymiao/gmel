# Gmel: Gmail threading redesign prototype

A clickable React prototype of a redesigned Gmail thread view, built for a UX Engineer design exercise. It makes **side conversations** and **changes in who can see what** visible.

Gmail shows every thread as one straight line, which causes two problems:

1. **You can't tell when a thread forks.** A side conversation looks like just the next message.
2. **You can't tell who is in each part of a thread.** Audience changes are buried in the To/CC lines.

The redesign adds:

- **Visibility chips:** a gray pill next to a message saying who can see it, whenever that differs from the rest of the thread ("Private conversation with Bear", "Visible to Adam, Bear").
- **Thread preview cards:** where a side conversation branches off, the main thread shows a card with its latest message, who it's visible to, and "Open thread (2 replies)". The side conversation shows a matching card at the same fork point to "Return to main thread (1 reply)".
- **Activity sidebar:** a timeline of the thread's path. The open thread is the main line, the other branch hangs off the fork, and small notes mark audience and subject changes. It stays in sync with the thread view and collapses to a narrow rail of avatars and icons.

## Setup

Requires Node 20.19+.

```sh
npm install
npm run dev     # http://localhost:5173
npm test        # checks the derived thread views and sidebar timeline
npm run build
```

## What's clickable

Everything else (header, left navigation, toolbar, star/emoji/reply icons, Reply/Forward) is static on purpose.

| Element | Action |
| --- | --- |
| Collapsed message row | Expand it |
| Expanded message header | Collapse it (except the last message, which stays open) |
| Count circle ("2") | Reveal the hidden messages |
| Thread preview card (anywhere on it) | Switch to the other thread |
| Sidebar timeline message | Reveal it in the thread, open it, and scroll to it |
| Sidebar branch card (or fork icon when collapsed) | Switch to that thread |
| "Activity" title | Collapse or expand the activity sidebar |

All of these are buttons: Tab to reach them, Enter or Space to activate. Switching threads moves keyboard focus to the card that leads back.

## The mock thread

Three people discuss website copy from Sep 4 to Sep 10, 2026 ("now" is Sep 10, 3:42 PM). All the data is in `src/data/thread.ts`.

| | From | To | Replies to | |
| --- | --- | --- | --- | --- |
| m1 | Bear | me, Adam | | Draft has 3 sections… |
| m2 | Adam | Bear, me | m1 | Section 1: the headline feels too long. |
| m3 | Bear | Adam, me | m2 | Good call on Section 1. How about "Ship faster"? |
| m4 | me | Bear, Adam | m1 | Section 3: the FAQ needs a refund question. |
| m5 | Bear | me | m4 | Agree on Section 3. Let's sort it out offline, just us. |
| m6 | Adam | me, Bear | m3 | "Ship faster" works for Section 1. |
| m7 | me | Adam, Bear | m5 | Update: Manager has approved! *(new subject: "[Approved] Website copy feedback")* |

m5 drops Adam, so it starts a side conversation. m7 adds him back and changes the subject, but it stays in the side conversation.

## How branches are derived

Messages are stored flat, each with a `parentId` and From/To/CC. Branches are never hardcoded; `deriveBranches` in `src/lib/branches.ts` works them out, walking messages oldest to newest:

1. **Removing people starts a side branch.** A reply that drops anyone from its parent's audience (sender + To + CC) splits off.
2. **Adding people doesn't.** The reply stays where it is.
3. **Side branches stay side branches.** A reply inside a side branch stays there, even if it adds everyone back.
4. **A subject change isn't a branch.** It's shown as a new subject heading above that message.
5. **Your own replies are always included.** The sender is part of the audience.
6. **Oldest at the top, newest at the bottom.**

`buildThreadView` in `src/lib/threadView.ts` then lays out one branch:

- **Main view:** the main branch, with a preview card where each side branch started.
- **Side view:** the main thread up to the fork, a card back to the main thread at the fork, then the side branch. The two views mirror each other.
- Like Gmail, the first and last two messages show (the last one open), and two or more in between fold into a count.
- In the main view, the message each side branch forked from always stays visible, so its "Open thread" card is never hidden. In a side view, the earlier main-thread context folds away like any older messages, and the card back to the main thread folds with the message it forked from.

**Chips** (`src/lib/visibility.ts`): a message gets one when its audience differs from the full thread, or, inside a side branch, from that branch's audience. Wording leaves you out, since you're always on your own thread: "Private conversation with Bear" when it's just you and one other person, "Visible to Adam, Bear" for more, and "Thread visible to …" on cards.

**Activity sidebar** (`src/lib/timeline.ts`): `buildTimeline` turns the current view into the timeline, so the two always match:

- The open branch is the main line; the other branch is an indented card at the fork. Every message in the view is listed, including ones folded into a count.
- Clicking a timeline message reveals it in the thread, opens it, and scrolls to it. `App` owns which messages are open and revealed, so both panels read the same state.
- Notes come from comparing each message with the one it replies to: "Private conversation with Bear" when the audience narrows to you and one other person, "Adam added" / "Adam removed", and "Subject changed to …".
- Clicking the "Activity" title collapses the panel to an 80px rail of avatars and activity icons, with a « button at the top to expand it again. The branch card becomes a fork icon on the line. Hovering an icon shows what it stands for.

## Design notes

- **Tokens:** colors, type scale and radii are defined once in `src/index.css` (Tailwind v4 `@theme`).
- **Fonts follow Gmail:** Roboto for the interface, Google Sans Flex for subjects, sidebar section titles and monogram avatars, and Arial for email body text.
- **Hover cues:** only clickable things get a pointer, and the preview cards get a soft gray fill that eases in. Static icons never react.
- **Avatars:** Bear and Adam are Google-style monograms drawn in code. Their letters are sized and positioned to match the "M" photo avatar.

## Code map

```
src/
  data/thread.ts        people, messages, "now"
  lib/branches.ts       deriveBranches (the rules above)
  lib/threadView.ts     buildThreadView: one branch -> rows, counts, headings, cards
  lib/visibility.ts     chip rules and wording
  lib/timeline.ts       buildTimeline (activity sidebar)
  lib/format.ts         dates and "to me, Bear"
  components/           AppShell, ThreadToolbar, ThreadView, MessageCollapsed,
                        MessageExpanded, CollapsedCount, VisibilityChip,
                        ThreadPreviewCard, SubjectHeading, ReplyBar,
                        ThreadSidebar, Avatar, Icon
  assets/icons/         icons exported from the Figma file
  index.css             design tokens (Tailwind v4 @theme)
```

Built with React, Vite, TypeScript and Tailwind v4. There's no backend; switching views is plain React state.
