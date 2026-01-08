'use client';
import { AppContext } from '@/app/providers/vaultContextProvider';
import { FangornContext } from '@/app/providers/fangornProvider';
import { useRouter, useSearchParams } from 'next/navigation';
import { useContext, useEffect, useState } from 'react';
import { EntryContext } from '../layout';
import {getAddress} from "viem";
import circuit from "fangorn/circuits/preimage/target/preimage.json";

export default function Page() {
  const { currentVaultId, entries } = useContext(AppContext);
  const {selectedEntry} = useContext(EntryContext);
  const { client } = useContext(FangornContext);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [isDecrypting, setIsDecrypting] = useState(false);

//   useEffect(() => {
//     // Get entry index from URL params
//     const entryIndex = searchParams.get('index');
    
//     if (entryIndex !== null && entries) {
//       const entry = entries[parseInt(entryIndex)];
//       setSelectedEntry(entry);
//     } else {
//       // If no valid entry, redirect back to vault
//       router.push('/access/vault');
//     }
//   }, [searchParams, entries, router]);

  const handleDecryptAndDownload = async () => {
    setIsDecrypting(true);
    
    try {
      // Add your decryption and download logic here
      console.log('Decrypting and downloading:', selectedEntry, 'with password:', password);
      
      // Simulate decryption delay
    //   await new Promise(resolve => setTimeout(resolve, 1000));
      const decryptedContent = await client?.decryptFile(currentVaultId as`0x${string}`, selectedEntry?.tag!, password, circuit)
      
      // After successful decryption:
      // 1. Decrypt the file
      // 2. Create a blob and download
      // Example:
      const blob = new Blob([decryptedContent!], { type: selectedEntry?.fileType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = selectedEntry?.tag!;
      a.click();
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Decryption failed:', error);
    } finally {
      setIsDecrypting(false);
    }
  };

  const handleShareLink = () => {
    // Add your share link logic here
    console.log('Sharing link for:', selectedEntry);
    alert('Share link functionality coming soon');
  };

  const handleBack = () => {
    router.push('/access/vault');
  };

  if (!selectedEntry) {
    return (
      <div className="screen-container">
        <div className="content-wrapper">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="screen-container-top">
      <div className="content-wrapper space-y-6">
        <h2 className="section-title">{currentVaultId}</h2>

        <div className="card-lg space-y-4">
          <div>
            <label className="form-label">File Name:</label>
            <div className="display-field">{selectedEntry.tag || 'N/A'}</div>
          </div>

          <div>
            <label className="form-label">CID:</label>
            <div className="display-field-mono break-all">{selectedEntry.cid || 'N/A'}</div>
          </div>

          <div>
            <label className="form-label">Index:</label>
            <div className="display-field">{selectedEntry.index !== undefined ? selectedEntry.index : 'N/A'}</div>
          </div>

          <div>
            <label className="form-label">Leaf:</label>
            <div className="display-field-mono break-all">{selectedEntry.leaf || 'N/A'}</div>
          </div>

          <div>
            <label className="form-label">Commitment:</label>
            <div className="display-field-mono break-all">{selectedEntry.commitment || 'N/A'}</div>
          </div>

          <div>
            <label className="form-label">Extension:</label>
            <div className="display-field">{selectedEntry.extension || 'N/A'}</div>
          </div>

          <div>
            <label className="form-label">File Type:</label>
            <div className="display-field">{selectedEntry.fileType || 'N/A'}</div>
          </div>

          <div>
            <label className="form-label">Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="Enter password to decrypt"
              disabled={isDecrypting}
            />
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleDecryptAndDownload}
            disabled={isDecrypting || !password}
            className="btn-primary flex items-center justify-center"
          >
            {isDecrypting ? (
              <div className="spinner"></div>
            ) : (
              'Decrypt and Download'
            )}
          </button>

          <button
            onClick={handleShareLink}
            className="btn-secondary"
          >
            Share Link
          </button>

          <button
            onClick={handleBack}
            className="btn-neutral"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
}