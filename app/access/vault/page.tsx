'use client'
import { AppContext } from "@/app/contextProvider";
import { useRouter } from "next/navigation";
import { useContext} from "react";

export default function Page() {
    const {vaultId, setVaultId, entries, setEntries} = useContext(AppContext);
    const router = useRouter();

    const handleCloseVault = async () => {
      setVaultId("");
      setEntries([]);
      router.push('/');
    };

    return (
      <div className="screen-container-top">
        <div className="content-wrapper space-y-6">
          <h2 className="section-title">Your Vault: {vaultId}</h2>
          
          <div className="card space-y-2">
            {entries?.length === 0 ? (
              <p className="empty-state">No secrets stored yet</p>
            ) : (
              entries?.map((entry, index) => (
                <button
                  key={index}
                  onClick={() => {}}
                  className="secret-item"
                >
                  <div className="secret-item-label">{entry.tag}</div>
                </button>
              ))
            )}
          </div>

          <div className="space-y-3">
            <button
              onClick={() => router.push("/access/vault/add")}
              className="btn-primary"
            >
              Add
            </button>
            <button
              onClick={() => alert('Export functionality coming soon')}
              className="btn-secondary"
            >
              Export
            </button>
            <button
              onClick={handleCloseVault}
              className="btn-neutral"
            >
              Close
            </button>
          </div>
        </div>
      </div>
      )
}