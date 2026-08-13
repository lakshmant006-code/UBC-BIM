import type { CSSProperties, SelectHTMLAttributes } from 'react';

/** Dropdown for building type, service and machine selection. */
export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  options?: (string | { value: string; label: string })[];
  placeholder?: string;
  invalid?: boolean;
  style?: CSSProperties;
}
export function Select(props: SelectProps): JSX.Element;
