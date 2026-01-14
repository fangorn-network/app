'use client';

import { createContext, useState, useCallback, ReactNode, useEffect, useContext } from 'react';
import { Address, Chain, createWalletClient, custom, getAddress, ProviderRpcErrorCode, WalletClient } from 'viem';
import { baseSepolia } from 'viem/chains';

// ========== Wallet Provider ==========

interface WalletContextType {
  account: string | null;
  walletClient: WalletClient | null;
  chain: Chain | null;
  loading: boolean;
  error: Error | null;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType>({
  account: null,
  walletClient: null,
  chain: null,
  loading: true,
  error: null,
  connect: () => new Promise((_resolve) => {}),
  disconnect: () => {},
});

export function WalletProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<string | null>(null);
  const [walletClient, setWalletClient] = useState<WalletClient | null> (null);
  const [chain, setChain] = useState<Chain | null> (null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const switchToBaseSepolia = async () => {
    if (!window.ethereum) return;

    const baseSepoliaChainId = '0x14a34';

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: baseSepoliaChainId }],
      });
    } catch (error) {
      const switchError = error as ProviderRpcErrorCode;
      if (switchError === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: baseSepoliaChainId,
                chainName: 'Base Sepolia',
                nativeCurrency: {
                  name: 'Ether',
                  symbol: 'ETH',
                  decimals: 18,
                },
                rpcUrls: [process.env.NEXT_PUBLIC_CHAIN_RPC_URL],
                blockExplorerUrls: ['https://sepolia.basescan.org'],
              },
            ],
          });
        } catch (addError) {
          console.log('Error: ', addError);
          throw new Error('Failed to add Base Sepolia network to MetaMask');
        }
      } else {
        throw switchError;
      }
    }
  };

  const connect = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('Connecting to wallet');
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed');
      }

      console.log('Requesting eth accounts');
      const [userAccount] = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      console.log('User account:', userAccount);

      await switchToBaseSepolia();

      const walletClient: WalletClient = createWalletClient({
				account: getAddress(userAccount as Address),
				transport: custom(window.ethereum),
				chain: baseSepolia,
			});

    // const siweMessageOverrides: WalletClientAuthenticator = {
		// 	domain: DOMAIN,
		// 	statement: "This is the statement",
		// };
		// const messageToSign = "Please sign in to enable LIT functionality.";

		// await WalletClientAuthenticator.authenticate(
		// 	walletClient,
		// 	messageToSign,
		// 	siweMessageOverrides,
		// );

      setWalletClient(walletClient);
      setChain(baseSepolia);
      setAccount(userAccount);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setAccount(null);
      setWalletClient(null);
      console.error('Wallet connection error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAccount(null);
    setError(null);
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    connect();
  }, [connect]);

  // Listen for account changes
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      console.log('Accounts changed:', accounts);
      if (accounts.length === 0) {
        disconnect();
      } else {
        setAccount(accounts[0]);
      }
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, [disconnect]);

  return (
    <WalletContext.Provider value={{ account, loading, error, walletClient, chain, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}