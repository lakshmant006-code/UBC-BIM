import type { CSSProperties, InputHTMLAttributes } from 'react';

/** Single-line text input. 4px radius, hairline border, accent focus ring. */
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
  style?: CSSProperties;
}
export function Input(props: InputProps): JSX.Element;
