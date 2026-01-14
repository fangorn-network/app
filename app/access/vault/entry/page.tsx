'use client';
import { AppContext } from '@/app/providers/vaultContextProvider';
import { useFangorn } from '@/app/providers/fangornProvider';
import { useRouter } from 'next/navigation';
import { useContext, useState } from 'react';
import { EntryContext } from '../entryContext';
import { useError } from '@/app/providers/errorContextProvider';

export default function Page() {
  const { currentVaultId, currentVaultName } = useContext(AppContext);
  const { selectedEntry } = useContext(EntryContext);
  const { client } = useFangorn();
  const {showError} = useError();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [isDecrypting, setIsDecrypting] = useState(false);

  const [isVisible, setIsVisible] = useState(false);

  const handleDecryptAndDownload = async () => {
    setIsDecrypting(true);

    try {
      console.log(
        'Decrypting and downloading:',
        selectedEntry?.tag,
        'with password:',
        password,
        'MIME type: ',
        selectedEntry?.fileType,
        'and extension: ',
        selectedEntry?.extension
      );

      if(!selectedEntry) {
        router.push('/access/vault')
      } else {
        const decryptedContent = await client?.decryptFile(
        currentVaultId as `0x${string}`,
        selectedEntry.tag,
        password,
      );
      const dataString = new TextDecoder().decode(decryptedContent);
      let blob;
      if (selectedEntry?.fileType !== 'text/plain') {
        // Decode base64 to binary
        const binaryString = atob(dataString);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        blob = new Blob([bytes], { type: selectedEntry?.fileType });
      } else {
        blob = new Blob([dataString], { type: selectedEntry?.fileType });
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = selectedEntry.tag;
      a.click();
      URL.revokeObjectURL(url);

      }
    } catch (error) {
      console.error('Decryption failed:', error);
      showError(error as Error);
    } finally {
      setIsDecrypting(false);
      setPassword('');
    }
  };

  const handleShareLink = () => {

    const envUrl = process.env.NEXT_PUBLIC_URL;
    const ROOT_URL = envUrl ? envUrl : 'http://localhost:3000';
    console.log('using root url ' + ROOT_URL)

    const pathName = `${ROOT_URL}/access/shared?vaultId=${currentVaultId}&entryId=${selectedEntry!.cid}`
    navigator.clipboard.writeText(pathName)
    // indicate we copied the message to the clipboard
    setIsVisible(true);

    setTimeout(() => {
      setIsVisible(false);
    }, 5000);
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
        <h2 className="section-title">{currentVaultName}</h2>

        <div className="card-lg space-y-4">
          <div>
            <label className="form-label">File Name:</label>
            <div className="display-field">{selectedEntry.tag || 'N/A'}</div>
          </div>

          <div>
            <label className="form-label">CID:</label>
            <div className="display-field-mono break-all">
              {selectedEntry.cid || 'N/A'}
            </div>
          </div>

          <div>
            <label className="form-label">Index:</label>
            <div className="display-field">
              {selectedEntry.index !== undefined ? selectedEntry.index : 'N/A'}
            </div>
          </div>

          <div>
            <label className="form-label">Leaf:</label>
            <div className="display-field-mono break-all">
              {selectedEntry.leaf || 'N/A'}
            </div>
          </div>

          <div>
            <label className="form-label">Commitment:</label>
            <div className="display-field-mono break-all">
              {selectedEntry.commitment || 'N/A'}
            </div>
          </div>

          <div>
            <label className="form-label">Extension:</label>
            <div className="display-field">
              {selectedEntry.extension || 'N/A'}
            </div>
          </div>

          <div>
            <label className="form-label">File Type:</label>
            <div className="display-field">
              {selectedEntry.fileType || 'N/A'}
            </div>
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

          <button onClick={handleShareLink} className="btn-secondary">
            {isVisible ? 'Copied to clipboard' : 'Share Link'}
          </button>

          <button onClick={handleBack} className="btn-neutral">
            Back
          </button>
        </div>
      </div>
    </div>
  );
}
