import type { ReactNode, CSSProperties } from 'react';

/** Checkbox for consent, file selection and multi-select filters. */
export interface CheckboxProps {
  label?: ReactNode;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  style?: CSSProperties;
}
export function Checkbox(props: CheckboxProps): JSX.Element;
