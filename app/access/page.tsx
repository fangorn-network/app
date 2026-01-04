'use client'
import { useState } from "react";
import { mockApi } from "@/utils/mockApi";
import { useRouter } from "next/navigation";

export default function Page() {

    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleAccessVault = async () => {
      setIsLoading(true);
      const vaultId = '123';
      const result = await mockApi.verifyPassword(vaultId, password);
      setIsLoading(false);
      if (result.success) {
        router.push("/access/vault");
      }
    };
    return (
        <div>
        {isLoading? (
          <div className="screen-container">
          <div className="content-wrapper space-y-6">
          <div className="spinner"></div>
          <h2 className="section-title">Loading vault...</h2>
          </div>
          </div>
          ):(
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
              onClick={() => router.push("/")}
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
