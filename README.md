# Gmel: Gmail threading redesign prototype

A clickable React prototype of a redesigned Gmail thread view that makes **side conversations** and **changes in who can see what** visible.

- **Visibility chips:** a gray pill saying who can see a message whenever that differs from the rest of the thread.
- **Thread preview card:** where a side conversation branches off, the main thread shows a card with its latest message, who it's visible to, and an "Open thread (2 replies)" link. The side conversation shows a matching card at the same fork point to "Return to main thread".

Designs: [main thread](https://www.figma.com/design/BXWFPMzyfsbF2UGaJJ2LR2/Gmail-Mockup-2026-Auto-Layouted--Community-?node-id=4003-1800) · [side conversation](https://www.figma.com/design/BXWFPMzyfsbF2UGaJJ2LR2/Gmail-Mockup-2026-Auto-Layouted--Community-?node-id=4033-2977)

## Setup

Requires Node 20.19+.

```sh
npm install
npm run dev     # http://localhost:5173
npm test        # checks the derived main and side views
npm run build
```

## What's clickable

Everything else (header, sidebar, toolbar, star/reply icons, Reply/Forward) is static on purpose.

| Element | Action |
| --- | --- |
| Collapsed message row | Expand it |
| Expanded message header | Collapse it (except the last message, which stays open) |
| Count circle ("2") | Reveal the hidden messages as rows |
| "Open thread" | Switch to the side conversation |
| "Return to main thread" | Switch back |

All of these are buttons: Tab to reach them, Enter or Space to activate.

## How branches are derived

Messages are stored flat, each with a `parentId` and From/To/CC (`src/data/thread.ts`). Branches are never hardcoded; `deriveBranches` in `src/lib/branches.ts` works them out, walking messages oldest to newest:

1. **Removing people starts a side branch.** A reply that drops anyone from its parent's audience (sender + To + CC) splits off.
2. **Adding people doesn't.** The reply stays where it is.
3. **Side branches stay side branches.** A reply inside a side branch stays there, even if it adds everyone back.
4. **A subject change isn't a branch.** It's shown as a new subject heading above that message.
5. **Your own replies are always included.** The sender is part of the audience.
6. **Oldest at the top, newest at the bottom.**

`buildThreadView` in `src/lib/threadView.ts` then lays out one branch:

- **Main view:** the main branch, with a preview card where each side branch started.
- **Side view:** the main thread up to the fork, a card back to the main thread at the fork, then the side branch. The two views mirror each other.
- Like Gmail, the first and last two messages show (the last one open), and two or more in between fold into a count. The message where a fork happens always stays visible, so the card sits right under it.

**Chips** (`src/lib/visibility.ts`): a message gets one when its audience differs from the full thread, or, inside a side branch, from that branch's audience. Wording: "Private conversation between Bear & me" for two people, "Visible to Adam, Bear & me" for three or more, and "Thread visible to …" on cards. "me" always comes last.

## Code map

```
src/
  data/thread.ts        people, messages, "now"
  lib/branches.ts       deriveBranches (the rules above)
  lib/threadView.ts     buildThreadView: one branch -> rows, counts, headings, cards
  lib/visibility.ts     chip rules and wording
  lib/format.ts         dates and "to me, Bear"
  components/           AppShell, ThreadToolbar, ThreadView, MessageCollapsed,
                        MessageExpanded, CollapsedCount, VisibilityChip,
                        ThreadPreviewCard, SubjectHeading, ReplyBar
  index.css             design tokens (Tailwind v4 @theme)
```

Built with React, Vite, TypeScript and Tailwind v4. There's no backend; switching views is plain React state.
