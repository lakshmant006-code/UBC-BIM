import type { ReactNode, CSSProperties } from 'react';

/**
 * Dark full-bleed stage for an interactive 3D model — the brief's 3D Project Lab centrepiece.
 * @startingPoint section="Model" subtitle="3D stage, hotspots, layer rail and spec panel" viewport="700x420"
 */
export interface ModelStageProps {
  /** Mono caption over a bottom scrim */
  caption?: string;
  /** Rotate / zoom / fullscreen tools — the one place icons stand alone */
  tools?: boolean;
  height?: number;
  footer?: ReactNode;
  /** The real viewer embed. Omit for the labelled placeholder. */
  children?: ReactNode;
  style?: CSSProperties;
}
export function ModelStage(props: ModelStageProps): JSX.Element;
