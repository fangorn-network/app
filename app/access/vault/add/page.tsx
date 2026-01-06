'use client';
import { useContext, useState } from 'react';
import { useRouter } from 'next/navigation';
import { mockApi } from '@/utils/mockApi';
import { AppContext } from '@/app/contextProvider';

export default function Page() {
  const { vaultId, entries, setEntries } = useContext(AppContext);
  const [secretLabel, setSecretLabel] = useState('');
  const [secretInfo, setSecretInfo] = useState('');
  const [uploadMode, setUploadMode] = useState('text'); // 'text' or 'file'
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isCreatingEntry, setIsCreatingEntry] = useState(false);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Optionally read file content
      const reader = new FileReader();
      reader.onload = (event: ProgressEvent<FileReader>) => {
        const result = event.target?.result;
        if (typeof result === 'string') {
          setSecretInfo(result);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleCreateEntry = async () => {
    const tag = secretLabel || 'tag';
    const cid = Math.random().toString(36).substring(2, 15);
    setIsCreatingEntry(true);
    const result = await mockApi.addEntry(vaultId!, cid, tag);
    const createdAt = BigInt(123);
    const vaultEntry = { cid, tag, provider: 0, createdAt };
    setEntries([...(entries ?? []), vaultEntry]);
    if (result.success) {
      router.push('/access/vault/add/success');
    }
  };

  const isFormValid = uploadMode === 'text' ? secretInfo : selectedFile;

  return (
    <div>
      {isCreatingEntry ? (
        <div className="screen-container">
          <div className="content-wrapper space-y-6">
            <div className="spinner"></div>
            <h2 className="section-title">Creating Vault Entry...</h2>
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
                    className="input-field"
                    accept=".txt,.json,.csv"
                  />
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
