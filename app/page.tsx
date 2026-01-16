'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

const WAITLIST_ENABLED =
  !process.env.NEXT_PUBLIC_CHAIN_RPC_URL!.includes('sepolia');

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
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      }).then(() => setSubmitted(true));
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
            <button
              onClick={() => router.push('/create')}
              className="btn-primary-lg"
            >
              Create Vault
            </button>
            <button
              onClick={() => router.push('/access')}
              className="btn-secondary-lg"
            >
              Access Vault
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
