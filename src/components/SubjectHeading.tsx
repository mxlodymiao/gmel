import { icons } from '../assets/icons';
import { Icon } from './Icon';

// Thread title (with print / open-in-new) or an inline subject change (without)
export function SubjectHeading({ subject, isTitle = false }: { subject: string; isTitle?: boolean }) {
  const Tag = isTitle ? 'h1' : 'h2';
  return (
    <div className="flex items-center justify-between pl-14">
      <Tag className="text-headline font-normal text-ink">{subject}</Tag>
      {isTitle && (
        <div className="flex items-center gap-5">
          <Icon src={icons.print} />
          <Icon src={icons.openInNew} />
        </div>
      )}
    </div>
  );
}
