import type { ReactNode, CSSProperties } from 'react';

/** Machines and software supported, and the file outputs clients receive — answers a client's compatibility questions at a glance. */
export interface CapabilityMatrixProps {
  columns?: string[];
  /** Row cells, first cell is the row label */
  rows?: ReactNode[][];
  style?: CSSProperties;
}
export function CapabilityMatrix(props: CapabilityMatrixProps): JSX.Element;
