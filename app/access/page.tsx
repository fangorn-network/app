'use client';
import { useContext, useState } from 'react';
import { mockApi } from '@/utils/mockApi';
import { useRouter } from 'next/navigation';
import { AppContext } from '../contextProvider';

export default function Page() {
  const { setVaultId } = useContext(AppContext);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleAccessVault = async () => {
    setIsLoading(true);
    const vaultId = 'vault_id_access';
    setVaultId(vaultId);
    const result = await mockApi.getAllEntries(vaultId);
    if (result.success) {
      router.push('/access/vault');
    }
  };
  return (
    <div>
      {isLoading ? (
        <div className="screen-container">
          <div className="content-wrapper space-y-6">
            <div className="spinner"></div>
            <h2 className="section-title">Loading vault...</h2>
          </div>
        </div>
      ) : (
        <div className="screen-container">
          <div className="content-wrapper space-y-6">
            <h2 className="section-title">Access Your Vault</h2>
            <div>
              <label className="form-label">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="Enter password"
              />
            </div>

            <div className="btn-group">
              <button
                onClick={() => router.push('/')}
                className="btn-flex btn-neutral"
              >
                Back
              </button>
              <button
                onClick={handleAccessVault}
                disabled={!password}
                className="btn-flex btn-primary"
              >
                Unlock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
