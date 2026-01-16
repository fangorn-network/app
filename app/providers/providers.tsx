'use client';

import { ReactNode, useState } from 'react';
import { State, WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getConfig } from '@/app/wagmi-config';
import { FangornProvider } from './fangornProvider';
import { AppContextProvider } from './vaultContextProvider';
import { ErrorProvider } from './errorContextProvider';
import { BlockingStatusCheck } from './blockingStatusCheck';

type Props = {
    children: ReactNode,
    initialState: State | undefined
}

export function Providers({ children, initialState }: Props) {
  const [config] = useState(() => getConfig())
  const [queryClient] = useState(() => new QueryClient())
  return (
    <ErrorProvider>
      <WagmiProvider config={config} initialState={initialState} reconnectOnMount = {true}>
        <QueryClientProvider client={queryClient}>
          <FangornProvider>
            <AppContextProvider>
                <BlockingStatusCheck>
                    {children}
                </BlockingStatusCheck>
            </AppContextProvider>
          </FangornProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ErrorProvider>
  );
}