import { type ComponentProps, useId } from 'react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type FormFieldProps = ComponentProps<typeof Input> & {
  label: string;
  error?: string;
  hint?: string;
};

export function FormField({ label, error, hint, id, ...props }: FormFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const messageId = `${inputId}-message`;

  return (
    <div className="grid gap-2">
      <Label htmlFor={inputId}>{label}</Label>
      <Input
        id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={error || hint ? messageId : undefined}
        {...props}
      />
      {error ? (
        <p id={messageId} className="text-sm text-destructive">{error}</p>
      ) : hint ? (
        <p id={messageId} className="text-sm text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
