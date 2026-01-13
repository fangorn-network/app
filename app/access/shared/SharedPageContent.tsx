'use client';
import { AppContext } from '@/app/providers/vaultContextProvider';
import { FangornContext } from '@/app/providers/fangornProvider';
import { useRouter, useSearchParams } from 'next/navigation';
import { useContext, useEffect, useState } from 'react';
import { VaultEntry } from 'fangorn-sdk/lib/types/types';

export default function SharedPageContent() {
  // Route -> /access/shared/[vaultId]/[entryCid]
  const params = useSearchParams();
  const vaultId = params.get('vaultId');
  const entryCid = params.get('entryId');
  const { setVault, setVaultManifest, setVaultName, setVaultId, currentVaultId, currentVaultName, cleanupVaultContext } = useContext(AppContext);
  const { client, loading } = useContext(FangornContext);
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [sharedEntry, setSharedEntry] = useState<VaultEntry | null>(null);

  useEffect( () => {

    const loadVault = async() => {
        if (!vaultId || !entryCid) {
          router.push('/');
        } else {
          if (!loading && client) {
            console.log("Loading vault with Id: ", vaultId)
            console.log("Loading entry with Id: ", entryCid)
            setVaultId(vaultId);
            console.log("retreiving vault")
            const vault = await client.getVault(vaultId! as `0x${string}`);
            if(!vault) {
              setIsError(true)
            } else {
              setVaultName(vault.name);
               console.log("vault: ", vault);
              setVault(vault);
              console.log("retreiving manifest")
              const manifest = await client.fetchManifest(vault.manifestCid!);
              if(!manifest) {
                setIsError(true)
              } else {
                setVaultManifest(manifest!);
                console.log("searching manifest for entry info")
                const matchedEntry = manifest?.entries.filter(e => e.cid === entryCid);
                if (matchedEntry) {
                  console.log("found entry")
                  setSharedEntry(matchedEntry[0]);
                  setIsLoading(false);
                } else {
                  console.log("something went wrong")
                  setIsError(true);
                  setIsLoading(false);
                }
              }
            }
        } else {
            console.log("Context is loading");
          }
        }
    }
    if (!sharedEntry && !isError && !loading) {
        loadVault();
    } 
  }, [loading, client, entryCid, isError, setVault, setVaultId, setVaultManifest, setVaultName, sharedEntry, vaultId, router])

  const handleDecryptAndDownload = async () => {
    setIsDecrypting(true);

    try {
      console.log(
        'Decrypting and downloading:',
        sharedEntry?.tag,
        'with password:',
        password,
        'MIME type: ',
        sharedEntry?.fileType,
        'and extension: ',
        sharedEntry?.extension
      );

      if(!client || !sharedEntry) {
        router.push('/')
      } else {

      const decryptedContent = await client.decryptFile(
        currentVaultId as `0x${string}`,
        sharedEntry.tag,
        password,
      );
      const dataString = new TextDecoder().decode(decryptedContent);
      let blob;
      if (sharedEntry?.fileType !== 'text/plain') {
        // Decode base64 to binary
        const binaryString = atob(dataString);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        blob = new Blob([bytes], { type: sharedEntry?.fileType });
      } else {
        blob = new Blob([dataString], { type: sharedEntry?.fileType });
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = sharedEntry.tag;
      a.click();
      URL.revokeObjectURL(url);
        
      }
    } catch (error) {
      console.error('Decryption failed:', error);
    } finally {
      setIsDecrypting(false);
      setPassword('');
    }
  };

    useEffect(() => {
    if (isError) {
      const timer = setTimeout(() => {
        router.push('/');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentVaultId, router, isError]);

  const handleBack = () => {
    cleanupVaultContext();
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="screen-container">
        <div className="content-wrapper">
          <div className="spinner"></div>
        </div>
      </div>
    );
  } else if (isError) {

    return (
      <div className="screen-container">
        <div className="content-wrapper space-y-6">
          <div className="spinner"></div>
          <h2 className="section-title">
            Entry not found. Redirecting home.
          </h2>
        </div>
      </div>
    );

  } else {

    return (
    <div className="screen-container-top">
      <div className="content-wrapper space-y-6">
        <h2 className="section-title">{currentVaultName}</h2>

        <div className="card-lg space-y-4">
          <div>
            <label className="form-label">File Name:</label>
            <div className="display-field">{sharedEntry!.tag || 'N/A'}</div>
          </div>

          <div>
            <label className="form-label">CID:</label>
            <div className="display-field-mono break-all">
              {sharedEntry!.cid || 'N/A'}
            </div>
          </div>

          <div>
            <label className="form-label">Index:</label>
            <div className="display-field">
              {sharedEntry!.index !== undefined ? sharedEntry!.index : 'N/A'}
            </div>
          </div>

          <div>
            <label className="form-label">Leaf:</label>
            <div className="display-field-mono break-all">
              {sharedEntry!.leaf || 'N/A'}
            </div>
          </div>

          <div>
            <label className="form-label">Commitment:</label>
            <div className="display-field-mono break-all">
              {sharedEntry!.commitment || 'N/A'}
            </div>
          </div>

          <div>
            <label className="form-label">Extension:</label>
            <div className="display-field">
              {sharedEntry!.extension || 'N/A'}
            </div>
          </div>

          <div>
            <label className="form-label">File Type:</label>
            <div className="display-field">
              {sharedEntry!.fileType || 'N/A'}
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

          <button onClick={handleBack} className="btn-neutral">
            Home
          </button>
        </div>
      </div>
    </div>
  );
}
}