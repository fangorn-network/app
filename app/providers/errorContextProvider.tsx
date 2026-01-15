
'use client';

import { createContext, useState, useCallback, ReactNode, useContext } from 'react';
import { useRouter } from 'next/navigation';
interface ErrorContextType {
  showError: (error: Error | string) => void;
  clearError: () => void;
  error: Error | null;
}

const ErrorContext = createContext<ErrorContextType>({
  showError: () => {},
  clearError: () => {},
  error: null,
});

export function ErrorProvider({ children }: { children: ReactNode }) {
  const [error, setError] = useState<Error | null>(null);
  const router = useRouter();

  const showError = useCallback((error: Error | string) => {
    const errorObj = typeof error === 'string' ? new Error(error) : error;
    setError(errorObj);
    router.push('/error');
  }, [router]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <ErrorContext.Provider value={{ showError, clearError, error }}>
      {children}
    </ErrorContext.Provider>
  );
}

export function useError() {
  return useContext(ErrorContext);
}