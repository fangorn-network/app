'use client'

import { createContext, useState, ReactNode } from 'react';

type VaultContextType = {
  vaultId?: string;
  entries?: VaultEntry[];
  setVaultId: (state: string) => void;
  setEntries: (state: VaultEntry[]) => void;
};

export const AppContext = createContext<VaultContextType>({
  vaultId: "",
  entries: [],
  setVaultId: () => {},
  setEntries: () => {}
});

export function AppContextProvider({ children }: { children: ReactNode }) {
  const [vaultId, setVaultId] = useState('');
  const [entries, setEntries] = useState<VaultEntry[]>([]);
  
  return (
    <AppContext.Provider value={{ vaultId, setVaultId, entries, setEntries }}>
      {children}
    </AppContext.Provider>
  );
}