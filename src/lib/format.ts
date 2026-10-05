import { ME, NOW, people } from '../data/thread';
import type { Message } from '../types';

const fullDate = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});
const timeOnly = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' });

const plural = (n: number, unit: string) => `${n} ${unit}${n === 1 ? '' : 's'} ago`;

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

// Gmail style: "3:16 PM (26 minutes ago)" today, "Sep 4, 2026, 9:12 AM (6 days ago)" before
export function formatSentAt(iso: string, now = NOW): string {
  const sent = new Date(iso);
  const days = Math.round((startOfDay(now) - startOfDay(sent)) / 86_400_000);
  if (days > 0) return `${fullDate.format(sent)} (${plural(days, 'day')})`;

  const minutes = Math.max(0, Math.round((now.getTime() - sent.getTime()) / 60_000));
  const ago = minutes < 60 ? plural(minutes, 'minute') : plural(Math.floor(minutes / 60), 'hour');
  return `${timeOnly.format(sent)} (${ago})`;
}

const dayOnly = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });

// Just the date, for the sidebar timeline: "Sep 4"
export function formatShortDate(iso: string): string {
  return dayOnly.format(new Date(iso));
}

// "to me, Bear"
export function recipientsLine(message: Message): string {
  const names = [...message.to, ...message.cc].map((id) => (id === ME ? 'me' : people[id].name));
  return `to ${names.join(', ')}`;
}
