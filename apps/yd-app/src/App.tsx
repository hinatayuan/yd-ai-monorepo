import { useMemo, useState } from 'react';
import { formatWalletAddress, generateMockAddress } from '@yd/libs';
import { useWallet } from '@yd/hooks';

const NETWORK_OPTIONS = [
  { id: 1, name: 'Ethereum Mainnet' },
  { id: 56, name: 'BNB Chain' },
  { id: 137, name: 'Polygon' },
  { id: 59144, name: 'Linea' },
];

export default function App(): JSX.Element {
  const [customAddress, setCustomAddress] = useState('');
  const [selectedChain, setSelectedChain] = useState<number>(NETWORK_OPTIONS[0].id);

  const networkMap = useMemo(() => {
    return NETWORK_OPTIONS.reduce<Record<number, string>>((acc, item) => {
      acc[item.id] = item.name;
      return acc;
    }, {});
  }, []);

  const wallet = useWallet({
    initialChainId: NETWORK_OPTIONS[0].id,
    networkNames: networkMap,
    latency: 400,
    historyLimit: 15,
  });

  const handleConnect = (): void => {
    if (customAddress.trim()) {
      wallet.connect(customAddress.trim());
    } else {
      wallet.connect(generateMockAddress());
    }
  };

  return (
    <div className="app">
      <header>
        <h1>YD 钱包工具演示</h1>
        <p>通过 pnpm 工作空间共享 @yd/libs 与 @yd/hooks，使用 Rollup 编译库代码。</p>
      </header>

      <main>
        <section className="panel wallet-status">
          <h2>连接状态</h2>
          <span className="badge">
            {wallet.isConnecting ? '连接中' : wallet.isConnected ? '已连接' : '未连接'}
          </span>
          <div>
            <strong>当前地址：</strong> {wallet.formattedAddress}
          </div>
          <div>
            <strong>原始地址：</strong>{' '}
            {wallet.state.address ?? '—'}
          </div>
          <div>
            <strong>网络：</strong> {wallet.state.networkName ?? '—'}
          </div>
          <div>
            <strong>格式化工具：</strong> {formatWalletAddress(wallet.state.address)}
          </div>
        </section>

        <section className="panel">
          <h2>操作钱包</h2>
          <div className="actions">
            <input
              placeholder="自定义地址（可选）"
              value={customAddress}
              onChange={(event) => setCustomAddress(event.target.value)}
            />
            <button type="button" onClick={handleConnect} disabled={wallet.isConnecting}>
              {wallet.isConnected ? '重新连接' : '连接钱包'}
            </button>
            <button type="button" onClick={wallet.disconnect} disabled={!wallet.isConnected}>
              断开连接
            </button>
          </div>

          <div className="actions">
            <select
              value={selectedChain}
              onChange={(event) => setSelectedChain(Number(event.target.value))}
            >
              {NETWORK_OPTIONS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
            <button type="button" onClick={() => wallet.switchChain(selectedChain)}>
              切换至所选网络
            </button>
          </div>

          <div className="actions">
            <button type="button" onClick={() => wallet.updateAddress(generateMockAddress())}>
              生成随机地址
            </button>
            <button type="button" onClick={wallet.clearHistory}>
              清空历史
            </button>
          </div>
        </section>

        <section className="panel">
          <h2>事件日志</h2>
          <div className="history">
            {wallet.state.history.length === 0 ? (
              <p className="empty">暂无事件</p>
            ) : (
              wallet.state.history.map((event) => (
                <article key={event.id} className="history-item">
                  <div>{event.summary}</div>
                  <time dateTime={new Date(event.timestamp).toISOString()}>
                    {new Date(event.timestamp).toLocaleString()}
                  </time>
                </article>
              ))
            )}
          </div>
        </section>
      </main>

      <footer className="footer-note">
        在没有真实钱包环境的情况下，通过 useWallet 模拟连接、切链与地址更新流程。
      </footer>
    </div>
  );
}
