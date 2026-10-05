import { icons } from '../assets/icons';
import { Icon } from './Icon';

// Static Reply / Forward / emoji buttons at the bottom of the thread
export function ReplyBar() {
  return (
    <div className="flex items-center gap-2.5 pt-10 pl-14">
      <GhostButton icon={icons.reply} label="Reply" />
      <GhostButton icon={icons.forward} label="Forward" />
      <div className="flex items-center rounded-full border border-button-border p-2">
        <Icon src={icons.mood} />
      </div>
    </div>
  );
}

function GhostButton({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-button-border py-2 pr-5 pl-4">
      <Icon src={icon} />
      <span className="text-body font-medium text-ink-button">{label}</span>
    </div>
  );
}
