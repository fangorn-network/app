'use client';
import { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppContext, VaultMetadata } from '../providers/vaultContextProvider';
import { useFangorn } from '../providers/fangornProvider';
import { Hex } from 'viem';
import { useError } from '../providers/errorContextProvider';

export default function Page() {
  const { setVaultId, allVaults, setVaults } = useContext(AppContext);
  const { showError } = useError();
  const { client } = useFangorn();
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadVaults = async () => {
      try {
        setIsLoading(true);
        // loads vaultIds that we own
        const vaults: VaultMetadata[] = [];
        const vaultIds = await client?.getUserVaults();
        console.log('Loading vaults');
        // load vault metadata (TODO - Q: is it better to query this per-vault, or to duplicate the vault name in storage?)
        for (const vaultId of vaultIds!) {
          const vaultIdHex = vaultId as Hex;
          const vaultData = await client?.getVault(vaultIdHex);
          vaults.push({ id: vaultIdHex, name: vaultData!.name });
        }
        setVaults(vaults);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to load vaults:', err);
        setIsLoading(false);
        showError(err as Error);
      }
    };

    if (client) {
      loadVaults();
    } else {
      setIsLoading(false);
    }
  }, [client, setVaults, showError]);

  return (
    <div>
      {isLoading ? (
        <div className="screen-container">
          <div className="content-wrapper space-y-6">
            <div className="spinner"></div>
            <h2 className="section-title">Loading vaults...</h2>
          </div>
        </div>
      ) : allVaults && allVaults.length > 0 ? (
        <div className="screen-container">
          <div className="content-wrapper space-y-6">
            <h2 className="section-title">Your Vaults</h2>
            <div className="space-y-4">
              {allVaults.map((vault) => (
                <button
                  key={vault.id}
                  onClick={() => {
                    setVaultId(vault.id);
                    router.push('access/vault');
                  }}
                  className="w-full p-4 text-left border rounded-lg hover:bg-gray-400 transition-colors"
                >
                  <div className="font-medium">{`${vault.name}`}</div>
                </button>
              ))}
            </div>
            <div className="btn-group">
              <button
                onClick={() => router.push('/')}
                className="btn-flex btn-neutral"
              >
                Back
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="screen-container">
          <div className="content-wrapper space-y-6">
            <h2 className="section-title">No Vaults Found</h2>
            <p className="text-gray-600 text-center">
              You don&apos;t have any vaults yet. Create your first vault to get
              started.
            </p>
            <div className="btn-group">
              <button
                onClick={() => router.push('/')}
                className="btn-flex btn-neutral"
              >
                Back
              </button>
              <button
                onClick={() => {
                  router.push('/create');
                }}
                className="btn-flex btn-primary"
              >
                Create Vault
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
