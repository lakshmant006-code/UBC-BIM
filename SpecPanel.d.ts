import type { ReactNode, CSSProperties } from 'react';

/** The specs panel the brief requires beside every model: size, units, location, building type, capability tags, two actions. */
export interface SpecPanelProps {
  eyebrow?: string;
  title: ReactNode;
  specs?: { label: string; value: ReactNode }[];
  tags?: ReactNode;
  /** Typically "Download sample files" and "Request a similar quote" */
  actions?: ReactNode;
  open?: boolean;
  onClose?: () => void;
  /** Translucent dark treatment for floating over a ModelStage */
  inverse?: boolean;
  style?: CSSProperties;
}
export function SpecPanel(props: SpecPanelProps): JSX.Element;
