'use client';

import { useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppContext } from '../../providers/vaultContextProvider';

export default function StartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentVaultId} = useContext(AppContext);
  const router = useRouter();

  useEffect(() => {
    if (!currentVaultId) {
      const timer = setTimeout(() => {
        router.push('/');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentVaultId, router]);

  if (!currentVaultId) {
    return (
      <div className="screen-container">
        <div className="content-wrapper space-y-6">
          <div className="spinner"></div>
          <h2 className="section-title">
            No Vault Detected. Redirecting home.
          </h2>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
