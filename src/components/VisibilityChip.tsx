import { Fragment } from 'react';
import type { Chip } from '../types';

// Gray pill saying who can see this part of the thread, e.g. "Visible to **Adam**, **Bear**"
export function VisibilityChip({ chip }: { chip: Chip }) {
  return (
    <span className="inline-flex shrink-0 items-center self-stretch rounded-chip bg-chip-fill px-2 text-chip whitespace-nowrap text-muted">
      {/* One inline run, so the spaces after commas survive the flex layout */}
      <span>
        {chip.lead}{' '}
        {chip.names.map((name, i) => (
          <Fragment key={name}>
            {i > 0 && ', '}
            <b className="font-bold">{name}</b>
          </Fragment>
        ))}
      </span>
    </span>
  );
}
