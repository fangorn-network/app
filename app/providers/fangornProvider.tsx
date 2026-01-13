'use client';

import { createContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { Fangorn } from 'fangorn-sdk';
import { ProviderRpcErrorCode } from 'viem';

interface FangornContextType {
  client: Fangorn | null;
  account: string | null;
  loading: boolean;
  error: Error | null;
  connect: () => Promise<void>;
  disconnect: () => void;
}

export const FangornContext = createContext<FangornContextType>({
  client: null,
  account: null,
  loading: true,
  error: null,
  connect: () => new Promise((_resolve) => { }),
  disconnect: () => { },
});

export function FangornProvider({ children }: { children: ReactNode }) {
  const [client, setClient] = useState<Fangorn | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const connect = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('connecting to wallet');
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed');
      }
      const [userAccount] = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      console.log('userAccount: ', userAccount);

      const baseSepoliaChainId = '0x14a34';

      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: baseSepoliaChainId }],
        });
      } catch (error) {
        // This error code indicates that the chain has not been added to MetaMask
        const switchError = error as ProviderRpcErrorCode;
        if (switchError === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: baseSepoliaChainId,
                  chainName: 'Base Sepolia',
                  nativeCurrency: {
                    name: 'Ether',
                    symbol: 'ETH',
                    decimals: 18,
                  },
                  rpcUrls: [process.env.NEXT_PUBLIC_CHAIN_RPC_URL],
                  blockExplorerUrls: ['https://sepolia.basescan.org'],
                },
              ],
            });
          } catch (addError) {
            console.log("Error: ", addError);
            throw new Error('Failed to add Base Sepolia network to MetaMask');
          }
        } else {
          throw switchError;
        }
      }

      const gateway = process.env.NEXT_PUBLIC_PINATA_GATEWAY;
      console.log("importing env vars")
      if (!gateway) throw new Error('NEXT_PUBLIC_PINATA_GATEWAY required');
      console.log("requesting jwt")
      const jwtResponse = await fetch('/api/jwt');
      if (!jwtResponse.ok) throw new Error('Failed to fetch JWT');

      const { jwt } = await jwtResponse.json();

      console.log('Creating Fangorn client');
      // let fangornClient = null;
      const fangornClient = await Fangorn.init(userAccount, jwt, gateway);

      console.log('Setting Client!');

      setClient(fangornClient);
      setAccount(userAccount);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      console.error('Fangorn connection error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    connect();
  }, [connect]);

  const disconnect = useCallback(() => {
    setClient(null);
    setAccount(null);
    setError(null);
  }, []);

  return (
    <FangornContext.Provider
      value={{ client, account, loading, error, connect, disconnect }}
    >
      {children}
    </FangornContext.Provider>
  );
}
