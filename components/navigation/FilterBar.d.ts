import type { CSSProperties } from 'react';

/** Horizontal filter rail for the project library — the brief's Residential / Commercial / Multifamily / LGS / Wood filters. */
export interface FilterBarProps {
  options?: string[];
  value?: string;
  onChange?: (value: string) => void;
  /** Result count shown at the right */
  count?: number;
  style?: CSSProperties;
}
export function FilterBar(props: FilterBarProps): JSX.Element;
