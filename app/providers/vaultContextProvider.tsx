'use client';

import {
  createContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';
import { Vault } from 'fangorn-sdk/lib/interface/zkGate';
import { VaultEntry, VaultManifest } from 'fangorn-sdk/lib/types/types.js';
import { Hex } from 'viem';
import { useWallet } from './walletProvider';

type VaultContextType = {
  currentVaultId?: string;
  currentVaultName?: string;
  allVaults?: VaultMetadata[];
  vault?: Vault | null;
  manifest?: VaultManifest | null;
  entries?: VaultEntry[];
  setVaultId: (state: string) => void;
  setVaultName: (state: string) => void;
  setEntries: (state: VaultEntry[]) => void;
  setVaults: (state: VaultMetadata[]) => void;
  setVault: (state: Vault | null) => void;
  setVaultManifest: (state: VaultManifest | null) => void;
  cleanupVaultContext: () => void;
};

export const AppContext = createContext<VaultContextType>({
  currentVaultId: '',
  currentVaultName: '',
  entries: [],
  allVaults: [],
  vault: undefined,
  manifest: undefined,
  setVaultId: () => {},
  setVaultName: () => {},
  setEntries: () => {},
  setVaults: () => {},
  setVault: () => undefined,
  setVaultManifest: () => undefined,
  cleanupVaultContext: () => {},
});

export interface VaultMetadata {
  id: Hex;
  name: string;
}

export function AppContextProvider({ children }: { children: ReactNode }) {
  const {walletClient} = useWallet();
  const [currentVaultId, setVaultId] = useState('');
  const [currentVaultName, setVaultName] = useState('');
  const [entries, setEntries] = useState<VaultEntry[]>([]);
  const [allVaults, setVaults] = useState<VaultMetadata[]>([]);
  const [vault, setVault] = useState<Vault | null>();
  const [manifest, setVaultManifest] = useState<VaultManifest | null>();

  const cleanupVaultContext = () => {
    setVaultId('');
    setVaultName('');
    setEntries([]);
    setVault(null);
    setVaultManifest(null);
  };

  useEffect(() => {
    cleanupVaultContext();
  },[walletClient])

  return (
    <AppContext.Provider
      value={{
        currentVaultId,
        setVaultId,
        currentVaultName,
        setVaultName,
        entries,
        setEntries,
        allVaults,
        setVaults,
        vault,
        setVault,
        manifest,
        setVaultManifest,
        cleanupVaultContext,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
