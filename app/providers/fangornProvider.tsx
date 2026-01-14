'use client';

import { createContext, useState, useCallback, ReactNode, useEffect, useContext } from 'react';
import { AppConfig, Fangorn } from 'fangorn-sdk';
import { useWallet } from './walletProvider';

interface FangornContextType {
  client: Fangorn | null;
  loading: boolean;
  error: Error | null;
  retry: () => void;
}

const FangornContext = createContext<FangornContextType>({
  client: null,
  loading: true,
  error: null,
  retry: () => {},
});

export function FangornProvider({ children }: { children: ReactNode }) {
  const { account, error: WalletError, chain, walletClient } = useWallet();
  const [client, setClient] = useState<Fangorn | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const initializeFangorn = useCallback(async () => {
    if (!account || WalletError || !chain || !walletClient) {
      setClient(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Initializing Fangorn client');

      const gateway = process.env.NEXT_PUBLIC_PINATA_GATEWAY;
      if (!gateway) throw new Error('NEXT_PUBLIC_PINATA_GATEWAY required');

      console.log('Requesting JWT');
      const jwtResponse = await fetch('/api/jwt');
      if (!jwtResponse.ok) throw new Error('Failed to fetch JWT');

      const { jwt } = await jwtResponse.json();

      const litActionCid = process.env.NEXT_PUBLIC_LIT_ACTION_CID;
      if (!litActionCid) throw new Error('NEXT_PUBLIC_LIT_ACTION_CID required');

      const circuitJsonCid = process.env.NEXT_PUBLIC_CIRCUIT_JSON_CID;
      if (!circuitJsonCid) throw new Error('NEXT_PUBLIC_CIRCUIT_JSON_CID required');

      const zkGateContractAddress = process.env.NEXT_PUBLIC_ZK_GATE_ADDR as `0x${string}`;
      if (!zkGateContractAddress) throw new Error('NEXT_PUBLIC_ZK_GATE_ADDR required');

      console.log("Domain being used: ", window.location.origin);

      const fangornConfig: AppConfig = {
        litActionCid,
        circuitJsonCid,
        zkGateContractAddress,
        chainName: 'baseSepolia',
        domain: window.location.host,
        rpcUrl: 'https://sepolia.base.org',
      };

      const fangornClient = await Fangorn.init(jwt, gateway, walletClient, fangornConfig);

      console.log('Fangorn client initialized');
      setClient(fangornClient);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      console.error('Fangorn initialization error:', err);
    } finally {
      setLoading(false);
    }
  }, [account, WalletError, chain, walletClient]);

  // Initialize Fangorn client when account is available
  useEffect(() => {
    initializeFangorn();
  }, [initializeFangorn]);

  return (
    <FangornContext.Provider value={{ client, loading, error, retry: initializeFangorn }}>
      {children}
    </FangornContext.Provider>
  );
}

export function useFangorn() {
  const context = useContext(FangornContext);
  if (!context) {
    throw new Error('useFangorn must be used within a FangornProvider');
  }
  return context;
}