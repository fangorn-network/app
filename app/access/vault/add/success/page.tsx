'use client';
import { useRouter } from 'next/navigation';
export default function Page() {
  const router = useRouter();
  return (
    <div className="screen-container">
      <div className="content-wrapper space-y-6">
        <div className="text-center">
          <div className="icon-lg">🎉</div>
          <h2 className="section-title">Entry Added!</h2>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => {
              router.push('/access/vault/add');
            }}
            className="btn-primary"
          >
            Add Another
          </button>
          <button
            onClick={() => router.push('/access/vault')}
            className="btn-neutral"
          >
            View Vault
          </button>
        </div>
      </div>
    </div>
  );
}
