import type { CSSProperties, TextareaHTMLAttributes } from 'react';

/** Multi-line input for project descriptions and enquiry detail. */
export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
  rows?: number;
  style?: CSSProperties;
}
export function Textarea(props: TextareaProps): JSX.Element;
