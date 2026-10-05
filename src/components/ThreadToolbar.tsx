import { icons } from '../assets/icons';
import { Icon } from './Icon';

// Static toolbar above the subject (archive, spam, delete, pagination...)
export function ThreadToolbar() {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-9">
        <Icon src={icons.arrowBack} />
        <div className="flex items-center gap-5">
          <Icon src={icons.archive} />
          <Icon src={icons.report} />
          <Icon src={icons.delete} />
          <div className="h-5 w-px bg-toolbar-divider" />
          <Icon src={icons.markUnread} />
          <Icon src={icons.driveMove} />
          <Icon src={icons.moreVert} />
        </div>
      </div>

      <div className="flex items-center gap-5">
        <span className="text-meta text-muted">2 of 43</span>
        <Icon src={icons.chevronLeft} />
        <Icon src={icons.chevronRight} />
        <div className="flex items-center">
          <Icon src={icons.keyboard} className="-mr-0.5" />
          <Icon src={icons.arrowDropDown} />
        </div>
      </div>
    </div>
  );
}
