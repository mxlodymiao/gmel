import type { Person } from '../types';

export function Avatar({ person }: { person: Person }) {
  return <img src={person.avatar} alt="" width={40} height={40} className="block size-10 shrink-0" />;
}
