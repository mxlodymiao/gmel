import { Fragment } from 'react';
import { separatorBefore } from '../lib/visibility';
import type { Chip } from '../types';

// Gray pill saying who can see this part of the thread, e.g. "Visible to **Adam**, **Bear** & **me**"
export function VisibilityChip({ chip }: { chip: Chip }) {
  return (
    <span className="inline-flex shrink-0 items-center self-stretch rounded-chip bg-chip-fill px-2 text-chip whitespace-nowrap text-muted">
      {/* One inline run, so the spaces around "&" survive the flex layout */}
      <span>
        {chip.lead}{' '}
        {chip.names.map((name, i) => (
          <Fragment key={name}>
            {separatorBefore(i, chip.names.length)}
            <b className="font-bold">{name}</b>
          </Fragment>
        ))}
      </span>
    </span>
  );
}
