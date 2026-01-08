'use client';
import { useContext, useEffect, useState } from 'react';
import { mockApi } from '@/utils/mockApi';
import { useRouter } from 'next/navigation';
import { AppContext } from '../providers/vaultContextProvider';
import { FangornContext } from '../providers/fangornProvider';

export default function Page() {
  const { setVaultId, allVaults, setVaults } = useContext(AppContext);
  const {client} = useContext(FangornContext);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

useEffect(() => {
  const loadVaults = async () => {
    try {
      setIsLoading(true);
      const vaults = await client?.getUserVaults();
      setVaults(vaults!);
    } catch (err) {
      console.error('Failed to load vaults:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (client) {
    loadVaults();
  } else {
    setIsLoading(false);
  }
  }, [client]);

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
                  key={vault}
                  onClick={() => {setVaultId(vault); router.push('access/vault')}}
                  className="w-full p-4 text-left border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="font-medium">{`Vault ${vault}`}</div>
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
              You don't have any vaults yet. Create your first vault to get started.
            </p>
            <div className="btn-group">
              <button
                onClick={() => router.push('/')}
                className="btn-flex btn-neutral"
              >
                Back
              </button>
              <button
                onClick={() => {router.push("/create")}}
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
