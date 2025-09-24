import { useCallback, useEffect, useMemo } from 'react';
import { useImmer } from 'use-immer';
import { formatWalletAddress } from '@yd/libs';

export interface WalletState {
  address?: string;
  chainId?: string;
  isConnected: boolean;
  status: 'idle' | 'connecting' | 'error';
  error?: string;
}

export interface UseWalletOptions {
  /**
   * Automatically attempt to connect to an injected provider when the hook mounts.
   */
  autoConnect?: boolean;
}

interface EthereumProvider {
  request<T = unknown>(args: { method: string; params?: unknown[] }): Promise<T>;
  on?(event: string, handler: (...args: unknown[]) => void): void;
  removeListener?(event: string, handler: (...args: unknown[]) => void): void;
}

const defaultState: WalletState = {
  address: undefined,
  chainId: undefined,
  isConnected: false,
  status: 'idle',
  error: undefined
};

function getEthereumProvider(): EthereumProvider | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }

  return (window as unknown as { ethereum?: EthereumProvider }).ethereum;
}

async function requestAccounts(provider: EthereumProvider): Promise<string[]> {
  const accounts = await provider.request<string[]>({ method: 'eth_requestAccounts' });
  if (!Array.isArray(accounts)) {
    return [];
  }

  return accounts;
}

async function requestChainId(provider: EthereumProvider): Promise<string | undefined> {
  const chainId = await provider.request<string>({ method: 'eth_chainId' });
  return typeof chainId === 'string' ? chainId : undefined;
}

export function useWallet(options: UseWalletOptions = {}) {
  const { autoConnect = false } = options;
  const [state, update] = useImmer<WalletState>(defaultState);

  const connect = useCallback(async () => {
    const provider = getEthereumProvider();
    if (!provider || typeof provider.request !== 'function') {
      update((draft) => {
        draft.status = 'error';
        draft.error = 'MetaMask (window.ethereum) was not found.';
        draft.isConnected = false;
      });
      return;
    }

    update((draft) => {
      draft.status = 'connecting';
      draft.error = undefined;
    });

    try {
      const accounts = await requestAccounts(provider);
      const chainId = await requestChainId(provider);
      const [primary] = accounts ?? [];

      update((draft) => {
        draft.address = primary;
        draft.chainId = chainId;
        draft.isConnected = Boolean(primary);
        draft.status = 'idle';
        draft.error = undefined;
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      update((draft) => {
        draft.status = 'error';
        draft.error = message;
        draft.isConnected = false;
      });
    }
  }, [update]);

  const disconnect = useCallback(() => {
    update((draft) => {
      draft.address = undefined;
      draft.chainId = undefined;
      draft.isConnected = false;
      draft.status = 'idle';
      draft.error = undefined;
    });
  }, [update]);

  const setAddress = useCallback(
    (address?: string) => {
      update((draft) => {
        draft.address = address;
        draft.isConnected = Boolean(address);
        draft.status = 'idle';
      });
    },
    [update]
  );

  const formattedAddress = useMemo(() => formatWalletAddress(state.address), [state.address]);

  useEffect(() => {
    if (!autoConnect) {
      return;
    }

    void connect();
  }, [autoConnect, connect]);

  useEffect(() => {
    const provider = getEthereumProvider();
    if (!provider?.on || !provider?.removeListener) {
      return;
    }

    const handleAccountsChanged = (accounts: unknown) => {
      const [address] = Array.isArray(accounts) ? (accounts as string[]) : [];
      setAddress(address);
    };

    const handleChainChanged = (chainId: unknown) => {
      update((draft) => {
        draft.chainId = typeof chainId === 'string' ? chainId : undefined;
      });
    };

    provider.on('accountsChanged', handleAccountsChanged);
    provider.on('chainChanged', handleChainChanged);

    return () => {
      provider.removeListener?.('accountsChanged', handleAccountsChanged);
      provider.removeListener?.('chainChanged', handleChainChanged);
    };
  }, [setAddress, update]);

  return {
    state,
    formattedAddress,
    connect,
    disconnect,
    setAddress
  };
}
