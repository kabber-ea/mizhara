import { useCallback, useState } from "react";

export function useFieldErrors<T extends string>() {
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<T, string>>>({});

  const clearFieldError = useCallback((field: T) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const clearAllFieldErrors = useCallback(() => setFieldErrors({}), []);

  return { fieldErrors, setFieldErrors, clearFieldError, clearAllFieldErrors };
}
