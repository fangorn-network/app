// 'use client';

// import { useMiniKit } from '@coinbase/onchainkit/minikit';
// import { useRouter } from 'next/navigation';
// import { useEffect } from 'react';

// export default function BaseVaultApp() {
//   // const { isMiniAppReady, setMiniAppReady } = useMiniKit();
//   // Initialize the miniapp
//   // useEffect(() => {
//   //   if (!isMiniAppReady) {
//   //     setMiniAppReady();
//   //   }
//   // }, [setMiniAppReady, isMiniAppReady]);
//   const router = useRouter();
//   return (
//     <div className="screen-container">
//       <div className="content-wrapper space-y-8">
//         <div className="text-center">
//           <h1 className="page-title">Fangorn Vault</h1>
//           <p className="subtitle">Secure data storage on Base</p>
//         </div>

//         <div className="space-y-4">
//           <button
//             onClick={() => {
//               router.push('/create');
//             }}
//             className="btn-primary-lg"
//           >
//             Create Vault
//           </button>

//           <button
//             onClick={() => {
//               router.push('/access');
//             }}
//             className="btn-secondary-lg"
//           >
//             Access Vault
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }
'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

// show waitlist if we are not running on testnet
const WAITLIST_ENABLED = !process.env.NEXT_PUBLIC_CHAIN_RPC_URL!.includes("sepolia");

export default function BaseVaultApp() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      const GOOGLE_SCRIPT_URL = process.env.NEXT_PUBLIC_WAITLIST_URL!;

      fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors', // required for Google Apps Script
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      }).then(() => setSubmitted(true));
      // With no-cors we can't read the response, but if it didn't throw, assume success
    } catch (err) {
      console.error('Waitlist signup error:', err);
      setError('Something went wrong. Please try again.');
    }
    
    setSubmitted(true);
  };

  // Waitlist UI
return (
    <div className="app">
      <main className="app-main">
         {!WAITLIST_ENABLED && (
          <div className="testnet-banner">
            <span className="testnet-banner-icon">⚠</span>
            <span>testnet only — data may be purged</span>
          </div>
        )}
       <div className="app-header">
          <h1 className="app-title">
            fangorn<span className="app-title-accent">://</span>vault
          </h1>
          <div className="app-tags">
            <span className="app-tag">
              <span className="app-tag-dot" />
              base sepolia
            </span>
            <span className="app-tag-separator">/</span>
            <span className="app-tag">
              <span className="app-tag-dot" />
              lit protocol
            </span>
          </div>
        </div>
        {WAITLIST_ENABLED ? (
          <div className="app-content">
            {submitted ? (
              <div className="success">
                <span>✓</span>
                <span>You&apos;re on the list.</span>
              </div>
            ) : (
              <form onSubmit={handleWaitlistSubmit} className="signup">
                <input
                  type="email"
                  placeholder="you@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="signup-input"
                />
                <button type="submit" className="signup-button">
                  JOIN
                </button>
              </form>
            )}
            {error && <p className="error">{error}</p>}
          </div>
        ) : (
          <div className="app-content">
            <button onClick={() => router.push('/create')} className="btn-primary-lg">
              Create Vault
            </button>
            <button onClick={() => router.push('/access')} className="btn-secondary-lg">
              Access Vault
            </button>
          </div>
        )}
      </main>
    </div>
  );
}