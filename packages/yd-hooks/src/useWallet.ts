import { useCallback, useEffect, useMemo, useRef } from 'react';
import { formatWalletAddress, generateMockAddress } from '@yd/libs';
import { useImmer } from './useImmer.js';

export type WalletStatus = 'disconnected' | 'connecting' | 'connected';

export interface WalletEvent {
  id: string;
  type: 'connect' | 'disconnect' | 'switch-chain' | 'address';
  timestamp: number;
  summary: string;
}

export interface WalletState {
  status: WalletStatus;
  address: string | null;
  chainId: number | null;
  networkName: string | null;
  history: WalletEvent[];
}

export interface UseWalletOptions {
  initialAddress?: string | null;
  initialChainId?: number | null;
  networkNames?: Record<number, string>;
  latency?: number;
  autoConnect?: boolean;
  historyLimit?: number;
}

export interface UseWalletResult {
  state: WalletState;
  formattedAddress: string;
  isConnected: boolean;
  isConnecting: boolean;
  connect: (address?: string) => void;
  disconnect: () => void;
  switchChain: (nextChainId: number) => void;
  updateAddress: (address: string) => void;
  clearHistory: () => void;
}

export function useWallet(options: UseWalletOptions = {}): UseWalletResult {
  const {
    initialAddress = null,
    initialChainId = null,
    networkNames = {},
    latency = 600,
    autoConnect = false,
    historyLimit = 10,
  } = options;

  const networkMap = useMemo(() => ({ ...networkNames }), [networkNames]);

  const [state, update] = useImmer<WalletState>(() => ({
    status: autoConnect ? 'connecting' : 'disconnected',
    address: initialAddress,
    chainId: initialChainId,
    networkName: resolveNetworkName(initialChainId, networkMap),
    history: [],
  }));

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pushHistory = useCallback(
    (event: Omit<WalletEvent, 'id' | 'timestamp'>) => {
      update((draft) => {
        draft.history.unshift({
          ...event,
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          timestamp: Date.now(),
        });
        if (draft.history.length > historyLimit) {
          draft.history.length = historyLimit;
        }
      });
    },
    [historyLimit, update],
  );

  const connect = useCallback(
    (nextAddress?: string) => {
      const target = nextAddress ?? state.address ?? generateMockAddress(Math.random() * 10_000);
      update((draft) => {
        if (draft.status === 'connecting') {
          return;
        }
        draft.status = 'connecting';
      });

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => {
        update((draft) => {
          draft.status = 'connected';
          draft.address = target;
          draft.networkName = resolveNetworkName(draft.chainId, networkMap);
        });
        pushHistory({ type: 'connect', summary: `已连接 ${formatWalletAddress(target)}` });
      }, latency);
    },
    [latency, networkMap, pushHistory, state.address, update],
  );

  const disconnect = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    update((draft) => {
      if (draft.status === 'disconnected') {
        return;
      }
      draft.status = 'disconnected';
      draft.address = null;
      draft.networkName = null;
    });
    pushHistory({ type: 'disconnect', summary: '已断开钱包连接' });
  }, [pushHistory, update]);

  const switchChain = useCallback(
    (nextChainId: number) => {
      update((draft) => {
        draft.chainId = Number.isFinite(nextChainId) ? Math.trunc(nextChainId) : draft.chainId;
        draft.networkName = resolveNetworkName(draft.chainId, networkMap);
      });
      pushHistory({ type: 'switch-chain', summary: `已切换至网络 ${resolveNetworkName(nextChainId, networkMap)}` });
    },
    [networkMap, pushHistory, update],
  );

  const updateAddress = useCallback(
    (address: string) => {
      const normalized = address.trim();
      update((draft) => {
        draft.address = normalized || null;
      });
      pushHistory({ type: 'address', summary: `地址更新为 ${formatWalletAddress(normalized || undefined)}` });
    },
    [pushHistory, update],
  );

  const clearHistory = useCallback(() => {
    update((draft) => {
      draft.history = [];
    });
  }, [update]);

  useEffect(() => {
    if (!autoConnect) {
      return;
    }
    connect(initialAddress ?? undefined);
  }, [autoConnect, connect, initialAddress]);

  useEffect(() => () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  }, []);

  const formattedAddress = useMemo(() => formatWalletAddress(state.address), [state.address]);

  return {
    state,
    formattedAddress,
    isConnected: state.status === 'connected',
    isConnecting: state.status === 'connecting',
    connect,
    disconnect,
    switchChain,
    updateAddress,
    clearHistory,
  };
}

function resolveNetworkName(chainId: number | null, mapping: Record<number, string>): string | null {
  if (chainId == null) {
    return null;
  }
  return mapping[chainId] ?? `链 #${chainId}`;
}
