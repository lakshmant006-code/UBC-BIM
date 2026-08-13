import type { CSSProperties } from 'react';

/** The home page walkthrough rail — slab, walls, trusses, MEP. Selected layer is marked with a 2px accent leading rule. */
export interface LayerRailProps {
  layers?: (string | { label: string; note?: string })[];
  /** Index of the current layer */
  active?: number;
  onSelect?: (index: number) => void;
  inverse?: boolean;
  style?: CSSProperties;
}
export function LayerRail(props: LayerRailProps): JSX.Element;
