import type { ReactNode, CSSProperties } from 'react';

/**
 * Label + hint/error wrapper for any form control. Labels are mono uppercase.
 * @startingPoint section="Forms" subtitle="Web-to-lead form controls" viewport="700x340"
 */
export interface FormFieldProps {
  label?: string;
  hint?: string;
  /** Replaces the hint and turns it danger-coloured */
  error?: string;
  required?: boolean;
  htmlFor?: string;
  children?: ReactNode;
  style?: CSSProperties;
}
export function FormField(props: FormFieldProps): JSX.Element;
