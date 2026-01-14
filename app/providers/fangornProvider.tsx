'use client';

import { createContext, useState, ReactNode, useEffect, useContext } from 'react';
import { AppConfig, Fangorn } from 'fangorn-sdk';
import { useWallet } from './walletProvider';
import { baseSepolia } from 'viem/chains';

interface FangornContextType {
  client: Fangorn | null;
  loading: boolean;
  error: Error | null;
}

const FangornContext = createContext<FangornContextType>({
  client: null,
  loading: true,
  error: null,
});

export function FangornProvider({ children }: { children: ReactNode }) {
  const { account } = useWallet();
  const [client, setClient] = useState<Fangorn | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!account) {
      setClient(null);
      setLoading(false);
      return;
    }

    const initializeFangorn = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log('Initializing Fangorn client');

        const gateway = process.env.NEXT_PUBLIC_PINATA_GATEWAY;
        if (!gateway) throw new Error('NEXT_PUBLIC_PINATA_GATEWAY required');

        // TODO: JWT doesn't need to be passed around
        const jwt = process.env.NEXT_PUBLIC_PINATA_JWT;
        if (!jwt) throw new Error('NEXT_PUBLIC_PINATA_JWT required');

        const litActionCid = process.env.NEXT_PUBLIC_LIT_ACTION_CID;
        if (!litActionCid) throw new Error('NEXT_PUBLIC_LIT_ACTION_CID required');

        const circuitJsonCid = process.env.NEXT_PUBLIC_CIRCUIT_JSON_CID;
        if (!circuitJsonCid) throw new Error('NEXT_PUBLIC_CIRCUIT_JSON_CID required');

        const zkGateContractAddress = process.env.NEXT_PUBLIC_ZK_GATE_ADDR as `0x${string}`;
        if (!zkGateContractAddress) throw new Error('NEXT_PUBLIC_ZK_GATE_ADDR required');

        const fangornConfig: AppConfig = {
          litActionCid,
          circuitJsonCid,
          zkGateContractAddress,
          chain: baseSepolia,
          chainName: 'baseSepolia',
          rpcUrl: 'https://sepolia.base.org',
        };

        const fangornClient = await Fangorn.init(account as `0x${string}`, jwt, gateway, fangornConfig);

        console.log('Fangorn client initialized');
        setClient(fangornClient);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        console.error('Fangorn initialization error:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeFangorn();
  }, [account]);

  return (
    <FangornContext.Provider value={{ client, loading, error }}>
      {children}
    </FangornContext.Provider>
  );
}

export function useFangorn() {
  return useContext(FangornContext);
}
