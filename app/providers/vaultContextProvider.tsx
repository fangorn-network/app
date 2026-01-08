'use client';

import { createContext, useState, ReactNode, useContext, useCallback } from 'react';
import { Vault } from 'fangorn/lib/interface/zkGate';
import {VaultEntry, VaultManifest} from 'fangorn/lib/types/types.js';

type VaultContextType = {
  currentVaultId?: string;
  allVaults?: string[];
  vault?: Vault | null;
  manifest?: VaultManifest | null;
  entries?: VaultEntry[];
  litActionCid?: string;
  setVaultId: (state: string) => void;
  setEntries: (state: VaultEntry[]) => void;
  setVaults: (state: string[]) => void;
  setVault: (state: Vault | null) => void;
  setVaultManifest: (state: VaultManifest | null) => void;
  cleanupVaultContext: () => void;
};

export const AppContext = createContext<VaultContextType>({
  currentVaultId: '',
  entries: [],
  allVaults: [],
  litActionCid: '',
  vault: undefined,
  manifest: undefined,
  setVaultId: () => {},
  setEntries: () => {},
  setVaults: () => {},
  setVault: () => undefined,
  setVaultManifest: () => undefined,
  cleanupVaultContext: () => {}
});

export function AppContextProvider({ children }: { children: ReactNode }) {
  const [currentVaultId, setVaultId] = useState('');
  const [entries, setEntries] = useState<VaultEntry[]>([]);
  const [allVaults, setVaults] = useState(['']);
  const [vault, setVault] = useState<Vault | null>();
  const [manifest, setVaultManifest] = useState<VaultManifest | null>();
  const providedLitActionCid = process.env.NEXT_PUBLIC_LIT_ACTION_CID;
  if (!providedLitActionCid) throw new Error('NEXT_PUBLIC_LIT_ACTION_CID; required');
  const [litActionCid] = useState(providedLitActionCid);

  const cleanupVaultContext = () => {
    setVaultId('');
    setEntries([]);
    setVault(null);
    setVaultManifest(null);
  }

  return (
    <AppContext.Provider value={{ currentVaultId, setVaultId, entries, setEntries, allVaults, setVaults, litActionCid, vault, setVault, manifest, setVaultManifest, cleanupVaultContext }}>
      {children}
    </AppContext.Provider>
  );
}
