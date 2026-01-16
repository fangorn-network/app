'use client';

import { createContext } from 'react';
import { VaultEntry } from 'fangorn-sdk/lib/types/types';

interface EntryContextType {
  selectedEntry: VaultEntry | null;
  setSelectedEntry: (state: VaultEntry) => void;
}

export const EntryContext = createContext<EntryContextType>({
  selectedEntry: null,
  setSelectedEntry: () => {},
});
