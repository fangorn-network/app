import { ReactNode } from "react";
import { useWallet } from "./walletProvider";
import { useFangorn } from "./fangornProvider";

export function BlockingStatusCheck({ children }: { children: ReactNode }) {
  const { account, loading: walletLoading, error: walletError, connect } = useWallet();
  const { loading: fangornLoading, error: fangornError, retry } = useFangorn();

  // Wallet is loading
  if (walletLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-text">Connecting to wallet...</p>
      </div>
    );
  }

  // No wallet connected (includes rejection case)
  if (!account) {
    return (
      <div className="screen-container">
        <div className="content-wrapper">
          <div className="space-y-8">
            <div className="text-center">
              <div className="icon-lg">👛</div>
              <h1 className="section-title">Connect Your Wallet</h1>
              <p className="subtitle" style={{ marginTop: '0.5rem' }}>
                {walletError 
                  ? walletError.message.includes('MetaMask is not installed')
                    ? 'MetaMask is required to use this application'
                    : 'Connect your MetaMask wallet to continue'
                  : 'Connect your MetaMask wallet to continue'
                }
              </p>
            </div>

            {walletError && (
              <div className="card-lg">
                <label className="form-label">Error Details</label>
                <div className="display-field-mono">{walletError.message}</div>
              </div>
            )}

            <div className="btn-group">
              {walletError?.message.includes('MetaMask is not installed') ? (
                <a
                  href="https://metamask.io/download/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                  style={{ textAlign: 'center', display: 'block' }}
                >
                  Install MetaMask
                </a>
              ) : (
                <button onClick={connect} className="btn-primary-lg">
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Fangorn is loading
  if (fangornLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-text">Initializing Fangorn client...</p>
      </div>
    );
  }

  // Fangorn error
  if (fangornError) {
    return (
      <div className="screen-container">
        <div className="content-wrapper">
          <div className="space-y-8">
            <div className="text-center">
              <div className="icon-lg">⚙️</div>
              <h1 className="section-title">Initialization Failed</h1>
            </div>

            <div className="card-lg space-y-4">
              <div>
                <label className="form-label">Error Details</label>
                <div className="display-field-mono">{fangornError.message}</div>
              </div>

              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Failed to initialize the Fangorn client. This could be due to a network issue or missing configuration.
              </p>
            </div>

            <button onClick={retry} className="btn-primary">
              Retry Initialization
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Everything is ready, render the app
  return <>{children}</>;
}