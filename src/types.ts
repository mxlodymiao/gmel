// A photo, or a Google-style monogram (first letter on a colored circle)
export type Avatar = { src: string } | { color: string };

export type Person = { id: string; name: string; email: string; avatar: Avatar };

export type Message = {
  id: string;
  parentId: string | null; // the message this replies to
  from: string; // person id
  to: string[];
  cc: string[];
  subject: string;
  sentAt: string; // ISO
  body: string;
};

export type Branch = {
  id: string;
  kind: 'main' | 'side';
  messages: Message[]; // oldest first
  audience: string[]; // person ids the branch is for
  forkParentId: string | null; // side branches: the main-thread message they split from
};

export type DerivedThread = {
  main: Branch;
  sides: Branch[];
  branchOf: Record<string, string>; // message id -> branch id
};

// Chip text is a lead-in plus a list of names, e.g. "Visible to" + [Adam, Bear, me]
export type Chip = { lead: string; names: string[] };
