import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';
import { toast } from 'sonner';

import { ApiError } from './http';

export function handleFormError<T extends FieldValues>(error: unknown, setError: UseFormSetError<T>, fields: Path<T>[]) {
  if (error instanceof ApiError && error.fieldErrors.length > 0) {
    let matched = false;

    for (const issue of error.fieldErrors) {
      if ((fields as string[]).includes(issue.field)) {
        setError(issue.field as Path<T>, { message: issue.error });
        matched = true;
      }
    }

    if (matched) {
      return;
    }
  }

  toast.error(error instanceof Error ? error.message : 'Algo deu errado. Tente novamente.');
}
