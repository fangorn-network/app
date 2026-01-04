'use client'
import { useState } from "react";
import { useRouter } from "next/navigation";
import { mockApi } from "@/utils/mockApi";

export default function Page() {
    const [secretLabel, setSecretLabel] = useState('');
    const [secretInfo, setSecretInfo] = useState('');
    const [isCreatingEntry, setIsCreatingEntry] = useState(false);
    const router = useRouter();
    const handleCreateEntry = async () => {
      const tag = "tag"
      setIsCreatingEntry(true);
      const result = await mockApi.addEntry("vaultId", tag);
      if (result.success) {
        router.push('/access/vault/add/success')
      }
    }
    return (
        <div>
        {isCreatingEntry? (
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
              <label className="form-label">Data</label>
              <input
                type="text"
                value={secretInfo}
                onChange={(e) => setSecretInfo(e.target.value)}
                className="input-field"
                placeholder="Enter data"
              />
            </div>
          </div>

          <div className="btn-group">
            <button
              onClick={() => router.push("/access/vault")}
              className="btn-flex btn-neutral"
            >
              Back
            </button>
            <button
              onClick={handleCreateEntry}
              disabled={!secretInfo}
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