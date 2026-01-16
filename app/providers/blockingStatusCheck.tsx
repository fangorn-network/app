'use client'

import { ReactNode, useEffect, useRef } from 'react'
import { useConnect, useConnection, useConnectors } from 'wagmi'
import { useFangorn } from './fangornProvider'
import { RpcError } from 'viem'

interface BlockingStatusCheckProps {
  children: ReactNode
}

export function BlockingStatusCheck({ children }: BlockingStatusCheckProps) {
  const { isConnected, status: accountStatus } = useConnection()
  const { mutate: connect, status: connectStatus, error } = useConnect()
  const connectors = useConnectors();
  const { loading: fangornLoading, error: fangornError, retry } = useFangorn();
  const didUserReject = useRef(false)
  const didAttemptAutoConnect = useRef(false)

  const injected = connectors.find(c => c.id === 'injected')

  const isLoading =
    accountStatus === 'connecting' ||
    accountStatus === 'reconnecting' ||
    connectStatus === 'pending';

  useEffect(() => {
    if (error) {
      const isRejection =
        error.name === 'UserRejectedRequestError' ||
        (error as RpcError).code === 4001

      if (isRejection) {
        didUserReject.current = true
      }
    }
  }, [error])

  // If wagmi is still resolving the session, block and show loading.
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-text">Connecting to wallet...</p>
      </div>
    );
  }

  // If not connected after loading, show connect UI and DO NOT auto-redirect.
  if (!isConnected) {
    if (injected && !didUserReject.current && !didAttemptAutoConnect.current) {
      didAttemptAutoConnect.current = true
      connect({ connector: injected })
    } else {

    return (
    <div className="screen-container">
        <div className="content-wrapper">
          <div className="space-y-8">
            <div className="text-center">
              <div className="icon-lg">👛</div>
              <h1 className="section-title">Connect Your Wallet</h1>
          <div className="space-y-4">
          {connectors.map((connector) => (
            <button
              key={connector.id}
              onClick={() => connect({ connector })}
              className="w-full p-4 text-center border rounded-lg hover:bg-gray-400 transition-colors"
            >
              {`Connect ${connector.name}`}
            </button>
          ))}
        </div>
      </div>
      </div>
      </div>
      </div>
    )

    }
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

  // Connected: render the app.
  return <>{children}</>
}
