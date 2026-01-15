'use client';

import { createContext, useState, useCallback, ReactNode, useEffect, useContext, useRef } from 'react';
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
  const { error: WalletError, chain, walletClient } = useWallet();
  const [client, setClient] = useState<Fangorn | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Track if we're currently initializing to prevent concurrent calls
  const isInitializingRef = useRef(false);
  // Track if we've successfully initialized to prevent re-init
  const hasInitializedRef = useRef(false);

  const initializeFangorn = useCallback(async () => {

    if (WalletError || !chain || !walletClient) {
      setClient(null);
      setLoading(false);
      setError(null);
      return;
    }


    if (isInitializingRef.current) {
      console.log('Already initializing, skipping...');
      return;
    }

    // Guard: Don't re-initialize if already successful
    if (hasInitializedRef.current && client) {
      console.log('Already initialized, skipping...');
      setLoading(false);
      return;
    }

    isInitializingRef.current = true;
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

      console.log("Domain being used: ", window.location.host);

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
      hasInitializedRef.current = true;
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      console.error('Fangorn initialization error:', err);
    } finally {
      isInitializingRef.current = false;
    }
  }, [WalletError, chain, walletClient, client]);

  const retry = useCallback(() => {
    console.log('Retrying Fangorn initialization...');
    hasInitializedRef.current = false;
    setClient(null);
    setError(null);
    initializeFangorn();
  }, [initializeFangorn]);

  // Initialize only when wallet becomes available and we haven't initialized yet
  useEffect(() => {
    // Only attempt initialization if:
    // 1. Wallet is ready (no error, has chain and client)
    // 2. Not currently initializing
    // 3. Haven't successfully initialized yet
    if (walletClient && chain && !WalletError && !isInitializingRef.current && !hasInitializedRef.current) {
      console.log('Wallet ready, initializing Fangorn...');
      initializeFangorn();
    }
  }, [walletClient, chain, WalletError, initializeFangorn]);

  // Reset initialization status when wallet changes
  useEffect(() => {
    console.log('Wallet client changed resetting Fangorn state...');
    hasInitializedRef.current = false;
    isInitializingRef.current = false;
    setClient(null);
    setError(null);
    setLoading(true);
  }, [walletClient]);

  return (
    <FangornContext.Provider value={{ client, loading, error, retry }}>
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