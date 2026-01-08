'use client';
import { useContext, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppContext } from '../providers/vaultContextProvider';
import { FangornContext } from '../providers/fangornProvider';
export default function Page() {
  const { setVaultId } = useContext(AppContext);
  const {client} = useContext(FangornContext);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isCreatingVault, setIsCreatingVault] = useState(false);
  const [loadingText, setLoadingText] = useState('Hashing Password...');

  const passwordsMatch = password === confirmPassword;
  const canProceed = password && confirmPassword && passwordsMatch;
  const router = useRouter();
  const handleCreateVault = async () => {
    setIsCreatingVault(true);
    setLoadingText('Creating Vault...');

    const vaultId = await client?.createVault(password);

    console.log("vaultId: ", vaultId)

    if (vaultId) {
      setVaultId(vaultId);
      router.push('/create/success');
    } else {
      throw new Error("Vault ID Creation Failed");
    }

  };
  return (
    <div>
      {isCreatingVault ? (
        <div className="screen-container">
          <div className="content-wrapper space-y-6">
            <div className="spinner"></div>
            <h2 className="section-title">{loadingText}</h2>
          </div>
        </div>
      ) : (
        <div className="screen-container">
          <div className="content-wrapper space-y-6">
            <h2 className="section-title">Create Your Vault Password</h2>
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
            <div>
              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field"
                placeholder="Re-enter password"
              />
              {confirmPassword && !passwordsMatch && (
                <p className="text-red-500 text-sm mt-1">
                  Passwords do not match
                </p>
              )}
            </div>
            <div className="btn-group">
              <button
                onClick={() => router.push('/')}
                className="btn-flex btn-neutral"
              >
                Back
              </button>
              <button
                onClick={handleCreateVault}
                disabled={!canProceed}
                className="btn-flex btn-primary"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
