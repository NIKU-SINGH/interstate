import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useMemo } from 'react';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';

export function useWallet() {
  const { address, isConnected, isConnecting } = useAccount();
  const { connect, connectors, error } = useConnect();
  const { disconnect } = useDisconnect();

  // Use the first available connector (e.g., MetaMask, WalletConnect)
  const connectWallet = () => {
    if (connectors && connectors.length > 0) {
      connect({ connector: connectors[0] });
    }
  };

  // Connect with a specific connector (e.g., MetaMask)
  const connectWith = (connector: typeof connectors[0]) => {
    connect({ connector });
  };

  return {
    address,
    isConnected,
    connecting: isConnecting,
    connect: connectWallet,
    connectWith,
    disconnect,
    error,
    connectors,
  };
} 