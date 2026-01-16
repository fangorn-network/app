'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
export default function Page() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/access/vault');
    }, 2000);
    // Cleanup function to clear timeout if component unmounts
    return () => clearTimeout(timer);
  }, [router]);
  return (
    <div className="screen-container">
      <div className="content-wrapper space-y-6">
        <div className="text-center">
          <div className="icon-lg">🎉</div>
          <h2 className="section-title">Vault Created!</h2>
        </div>
      </div>
    </div>
  );
}
