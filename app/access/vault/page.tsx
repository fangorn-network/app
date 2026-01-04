'use client'
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Page() {
    const secrets = [{label: "a tag", cid: "cid"}]
    const router = useRouter();

    return (
      <div className="screen-container-top">
        <div className="content-wrapper space-y-6">
          <h2 className="section-title">Your Vault</h2>
          
          <div className="card space-y-2">
            {secrets.length === 0 ? (
              <p className="empty-state">No secrets stored yet</p>
            ) : (
              secrets.map((secret, index) => (
                <button
                  key={index}
                  onClick={() => {}}
                  className="secret-item"
                >
                  <div className="secret-item-label">{secret.label}</div>
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
              onClick={() => router.push("/")}
              className="btn-neutral"
            >
              Close
            </button>
          </div>
        </div>
      </div>
      )
}