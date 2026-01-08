'use client';
import { FangornContext } from '@/app/providers/fangornProvider';
import { AppContext } from '@/app/providers/vaultContextProvider';
import { useRouter } from 'next/navigation';
import { useContext, useEffect, useState } from 'react';
import { EntryContext } from './layout';
import { VaultEntry } from 'fangorn/lib/types/types';

export default function Page() {
  const { currentVaultId, entries, setEntries, setVault, setVaultManifest, vault, cleanupVaultContext} = useContext(AppContext);
  const {setSelectedEntry} = useContext(EntryContext);
  const { client } = useContext(FangornContext);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingText, setLoadingText] = useState('');
  const router = useRouter();

  const handleCloseVault = async () => {
    cleanupVaultContext();
    router.push('/');
  };

  const handleEntryClick = (entry: VaultEntry) => {
    setSelectedEntry(entry);
    router.push("/access/vault/entry")
  };


  useEffect(() => {
    const loadVault = async() => {
      setLoadingText('Loading vault...')
      let vaultHex = currentVaultId as`0x${string}`
      const vault = await client?.getVault(vaultHex!);
      setVault(vault!)
      if (vault?.manifestCid) {
        setLoadingText('Loading manifest...')
        const manifest = await client?.fetchManifest(vault.manifestCid);
        setVaultManifest(manifest!);
        setEntries(manifest!.entries!);
      }
      setIsLoading(false);
    }
    if(vault) {
      setIsLoading(false);
    } else {
      loadVault();
    }
  })

  return (
    <div>
    {
      isLoading? (
        <div className="screen-container">
          <div className="content-wrapper space-y-6">
            <div className="spinner"></div>
            <h2 className="section-title">{loadingText}</h2>
          </div>
        </div>
      ):(
      <div className="screen-container-top">
      <div className="content-wrapper space-y-6">
        <h2 className="section-title">Your Vault: {currentVaultId}</h2>

        <div className="card space-y-2">
          {entries?.length === 0 ? (
            <p className="empty-state">No secrets stored yet</p>
          ) : (
            entries?.map((entry, index) => (
              <button key={index} onClick={() => handleEntryClick(entry)} className="secret-item">
                <div className="secret-item-label">{entry.tag}</div>
              </button>
            ))
          )}
        </div>

        <div className="space-y-3">
          <button
            onClick={() => router.push('/access/vault/add')}
            className="btn-primary"
          >
            Add
          </button>
          <button
            onClick={() => alert('Export functionality coming soon')}
            className="btn-secondary"
          >
            Export
          </button>
          <button onClick={handleCloseVault} className="btn-neutral">
            Close
          </button>
        </div>
      </div>
    </div>
      )
    }
    </div>
  );
}
