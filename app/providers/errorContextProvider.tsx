
'use client';

import { createContext, useState, useCallback, ReactNode, useContext } from 'react';
import { useRouter } from 'next/navigation';
interface ErrorContextType {
  showError: (error: Error | string, redirectToErrorPage?: boolean) => void;
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

  const showError = useCallback((error: Error | string, redirectToErrorPage = true) => {
    const errorObj = typeof error === 'string' ? new Error(error) : error;
    setError(errorObj);
    
    console.error('Application error:', errorObj);
    
    if (redirectToErrorPage) {
      // Encode error message for URL
      const encodedMessage = encodeURIComponent(errorObj.message);
      router.push(`/error?message=${encodedMessage}`);
    }
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