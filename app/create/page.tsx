'use client';
import { useContext, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppContext } from '../providers/vaultContextProvider';
import { FangornContext } from '../providers/fangornProvider';
export default function Page() {
  const { setVaultId } = useContext(AppContext);
  const {client} = useContext(FangornContext);
  const [password, setPassword] = useState('');
  const [vaultName, setVaultName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isCreatingVault, setIsCreatingVault] = useState(false);
  const [loadingText, setLoadingText] = useState('Hashing Password...');

  const passwordsMatch = password === confirmPassword;
  const canProceed = password && confirmPassword && passwordsMatch && vaultName;
  const router = useRouter();
  const handleCreateVault = async () => {
    setIsCreatingVault(true);
    setLoadingText('Creating Vault...');

    const vaultId = await client?.createVault(vaultName, password);

    console.log("vaultId: ", vaultId)

    if (vaultId) {
      setVaultId(vaultId);
      router.push('/create/success');
    } else {
      throw new Error("Vault Creation Failed");
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
            <h2 className="section-title">Create Your Vault</h2>
            <div>
              <label className="form-label">Vault Name</label>
              <input
                type="text"
                value={vaultName}
                onChange={(e) => setVaultName(e.target.value)}
                className="input-field"
                placeholder="Enter Vault Name"
              />
            </div>
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
