'use client';

import { ReactNode, useState } from 'react';
import { State, WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getConfig } from '@/app/wagmi-config';
import { FangornProvider } from './fangornProvider';
import { AppContextProvider } from './vaultContextProvider';
import { ErrorProvider } from './errorContextProvider';
import { LitProvider } from './litProvider';

type Props = {
  children: ReactNode;
  initialState: State | undefined;
};

export function Providers({ children, initialState }: Props) {
  const [config] = useState(() => getConfig());
  const [queryClient] = useState(() => new QueryClient());
  return (
    <ErrorProvider>
      <WagmiProvider
        config={config}
        initialState={initialState}
        reconnectOnMount={false}
      >
        <QueryClientProvider client={queryClient}>
          <LitProvider>
            <FangornProvider>
              <AppContextProvider>
                {children}
              </AppContextProvider>
            </FangornProvider>
          </LitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ErrorProvider>
  );
}
