'use client';
import { FangornContext } from '@/app/providers/fangornProvider';
import { AppContext } from '@/app/providers/vaultContextProvider';
import { useRouter } from 'next/navigation';
import { useContext, useEffect, useState } from 'react';
import { EntryContext } from './entryContext';
import { VaultEntry } from 'fangorn-sdk/lib/types/types';

export default function Page() {
  const {
    currentVaultId,
    entries,
    setEntries,
    setVault,
    setVaultManifest,
    vault,
    cleanupVaultContext,
    setVaultName,
    currentVaultName,
  } = useContext(AppContext);
  const { setSelectedEntry } = useContext(EntryContext);
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
    router.push('/access/vault/entry');
  };

  useEffect(() => {
    const loadVault = async () => {
      setLoadingText('Loading vault...');
      const vaultHex = currentVaultId as `0x${string}`;
      const vault = await client?.getVault(vaultHex!);
      setVaultName(vault!.name);
      setVault(vault!);
      if (vault?.manifestCid) {
        setLoadingText('Loading manifest...');
        const manifest = await client?.fetchManifest(vault.manifestCid);
        setVaultManifest(manifest!);
        setEntries(manifest!.entries!);
      }
      setIsLoading(false);
    };
    if (vault) {
      setIsLoading(false);
    } else {
      loadVault();
    }
  }, [vault, currentVaultId, client, setVaultName, setVault, setVaultManifest, setEntries]);

return (
    <div>
      {isLoading ? (
        <div className="loading-container">
          <div className="spinner" />
          <span className="loading-text">{loadingText}</span>
        </div>
      ) : (
        <div className="app">
          <main className="app-main">
            <div className="app-content" style={{ maxWidth: '400px' }}>
              <div className="vault-header">
                <span className="vault-title">vault://{currentVaultName}</span>
                <span className="vault-name">{entries?.length || 0} entries</span>
              </div>

              <div className="vault-entries">
                {entries?.length === 0 ? (
                  <div className="vault-empty">no entries yet</div>
                ) : (
                  entries?.map((entry, index) => (
                    <button
                      key={index}
                      onClick={() => handleEntryClick(entry)}
                      className="vault-entry"
                    >
                      <span className="vault-entry-icon">→</span>
                      <span>{entry.tag}</span>
                    </button>
                  ))
                )}
              </div>

              <div className="vault-actions">
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
          </main>
        </div>
      )}
    </div>
  );
}
