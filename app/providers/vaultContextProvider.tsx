'use client';

import {
  createContext,
  useState,
  ReactNode,
  useContext,
  useCallback,
} from 'react';
import { Vault } from 'fangorn/lib/interface/zkGate';
import { VaultEntry, VaultManifest } from 'fangorn/lib/types/types.js';

type VaultContextType = {
  currentVaultId?: string;
  currentVaultName?: string;
  allVaults?: string[];
  vault?: Vault | null;
  manifest?: VaultManifest | null;
  entries?: VaultEntry[];
  setVaultId: (state: string) => void;
  setVaultName: (state: string) => void;
  setEntries: (state: VaultEntry[]) => void;
  setVaults: (state: string[]) => void;
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

export function AppContextProvider({ children }: { children: ReactNode }) {
  const [currentVaultId, setVaultId] = useState('');
  const [currentVaultName, setVaultName] = useState('');
  const [entries, setEntries] = useState<VaultEntry[]>([]);
  const [allVaults, setVaults] = useState(['']);
  const [vault, setVault] = useState<Vault | null>();
  const [manifest, setVaultManifest] = useState<VaultManifest | null>();

  const cleanupVaultContext = () => {
    setVaultId('');
    setVaultName('');
    setEntries([]);
    setVault(null);
    setVaultManifest(null);
  };

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
