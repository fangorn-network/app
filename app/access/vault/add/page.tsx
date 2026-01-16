'use client';
import { useContext, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppContext } from '@/app/providers/vaultContextProvider';
import { useFangorn } from '@/app/providers/fangornProvider';
import { Filedata } from 'fangorn-sdk/lib/types/types';
import { useError } from '@/app/providers/errorContextProvider';

export default function Page() {
  const { currentVaultId, setEntries, setVaultManifest } =
    useContext(AppContext);
  const { client } = useFangorn();
  const { showError } = useError();
  const [secretLabel, setSecretLabel] = useState('');
  const [secretInfo, setSecretInfo] = useState('');
  const [uploadMode, setUploadMode] = useState('text'); // 'text' or 'file'
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isCreatingEntry, setIsCreatingEntry] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (event: ProgressEvent<FileReader>) => {
        const result = event.target?.result;
        if (result instanceof ArrayBuffer) {
          // Convert to base64 string for the FileData.data field
          const base64 = Buffer.from(result).toString('base64');
          setSecretInfo(base64);
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleCreateEntry = async () => {
    const tag = secretLabel || 'tag';
    let fileData: Filedata;
    setIsCreatingEntry(true);
    if (uploadMode === 'text') {
      const data = secretInfo;
      fileData = { tag, data, extension: '.txt', fileType: 'text/plain' };
    } else {
      const data = secretInfo;
      const extension = selectedFile!.name.slice(
        selectedFile!.name.lastIndexOf('.')
      );
      const fileType = selectedFile!.type;
      fileData = { tag, data, extension, fileType };
    }
    setLoadingText('Uploading new entry...');
    const vaultHex = currentVaultId as `0x${string}`;
    const manifestInfo = await client?.upload(vaultHex, [fileData], false);
    if (!manifestInfo) {
      showError('An error occurred when retrieving the manifest information');
    } else {
      setLoadingText('Retreiving new manifest...');
      if (!client) {
        showError('The fangorn client never loaded');
      } else {
        const manifest = await client.fetchManifest(manifestInfo.manifestCid!);
        if (!manifest) {
          // TODO: Display error saying something went wrong with manifest retrieval
          showError('An error occurred when retrieving the manifest');
        } else {
          setVaultManifest(manifest);
          setEntries(manifest.entries);
          setLoadingText('Complete!');
          router.push('/access/vault/add/success');
        }
      }
    }
  };

  const isFormValid =
    (uploadMode === 'text' ? secretInfo : selectedFile) && secretLabel;

  return (
    <div>
      {isCreatingEntry ? (
        <div className="screen-container">
          <div className="content-wrapper space-y-6">
            <div className="spinner"></div>
            <h2 className="section-title">{loadingText}</h2>
          </div>
        </div>
      ) : (
        <div className="screen-container">
          <div className="content-wrapper space-y-6">
            <h2 className="section-title">Add New Entry</h2>

            <div className="space-y-4">
              <div>
                <label className="form-label">Tag</label>
                <input
                  type="text"
                  value={secretLabel}
                  onChange={(e) => setSecretLabel(e.target.value)}
                  className="input-field"
                  placeholder="Enter a tag"
                />
              </div>

              <div>
                <label className="form-label">Data Input Method</label>
                <div className="toggle-button-group">
                  <button
                    type="button"
                    onClick={() => setUploadMode('text')}
                    className={
                      uploadMode === 'text'
                        ? 'toggle-button-active'
                        : 'toggle-button'
                    }
                  >
                    Text Input
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadMode('file')}
                    className={
                      uploadMode === 'file'
                        ? 'toggle-button-active'
                        : 'toggle-button'
                    }
                  >
                    File Upload
                  </button>
                </div>
              </div>

              {uploadMode === 'text' ? (
                <div>
                  <label className="form-label">Data</label>
                  <input
                    type="text"
                    value={secretInfo}
                    onChange={(e) => setSecretInfo(e.target.value)}
                    className="input-field"
                    placeholder="Enter data"
                  />
                </div>
              ) : (
                <div>
                  <label className="form-label">Upload File</label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                    accept=".txt,.json,.csv,.png,.jpeg,.gif"
                    key={selectedFile?.name || 'file-input'}
                  />
                  <label
                    htmlFor="file-upload"
                    className="btn-secondary block cursor-pointer"
                    style={{ width: '100%' }}
                  >
                    Choose File
                  </label>
                  {selectedFile && (
                    <div className="file-info-box">
                      <p className="file-info-text">
                        Selected: {selectedFile.name} (
                        {(selectedFile.size / 1024).toFixed(2)} KB)
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFile(null);
                          setSecretInfo('');
                        }}
                        className="file-remove-button"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="btn-group">
              <button
                onClick={() => router.push('/access/vault')}
                className="btn-flex btn-neutral"
              >
                Back
              </button>
              <button
                onClick={handleCreateEntry}
                disabled={!isFormValid}
                className="btn-flex btn-primary"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
