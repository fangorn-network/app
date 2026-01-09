'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppContext } from '../../providers/vaultContextProvider';
import { VaultEntry } from 'fangorn/lib/types/types';

interface EntryContextType {
  selectedEntry: VaultEntry | null;
  setSelectedEntry: (state: VaultEntry) => void;
}

export const EntryContext = createContext<EntryContextType>({
  selectedEntry: null,
  setSelectedEntry: () => {},
});

export default function StartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [selectedEntry, setSelectedEntry] = useState<VaultEntry | null>(null);
  const { currentVaultId } = useContext(AppContext);
  const router = useRouter();

  useEffect(() => {
    if (!currentVaultId) {
      const timer = setTimeout(() => {
        router.push('/');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentVaultId, router]);

  if (!currentVaultId) {
    return (
      <div className="screen-container">
        <div className="content-wrapper space-y-6">
          <div className="spinner"></div>
          <h2 className="section-title">
            No Vault Detected. Redirecting home.
          </h2>
        </div>
      </div>
    );
  }

  return (
    <EntryContext.Provider value={{ selectedEntry, setSelectedEntry }}>
      {children}
    </EntryContext.Provider>
  );
}
