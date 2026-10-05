import { icons } from '../assets/icons';

// The "2" circle standing in for hidden messages. Click to reveal them.
export function CollapsedCount({ count, onReveal }: { count: number; onReveal: () => void }) {
  return (
    <div className="flex items-center">
      <button
        type="button"
        aria-expanded={false}
        aria-label={`Show ${count} more messages`}
        onClick={onReveal}
        className="group focus-ring relative flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full hover:bg-hover"
      >
        <img src={icons.countCircle} alt="" aria-hidden width={40} height={40} className="absolute inset-0" />
        <span className="relative text-meta text-count group-hover:text-ink">{count}</span>
      </button>
      <div aria-hidden className="h-1 flex-1 border-y border-divider" />
    </div>
  );
}
