import { useMemo, useState } from 'react';
import { formatWalletAddress, generateMockAddress } from '@yd/libs';
import { useWallet } from '@yd/hooks';

const NETWORKS: Record<number, string> = {
  1: '以太坊主网',
  56: 'BNB Chain',
  137: 'Polygon PoS',
  8453: 'Base',
};

export function App(): JSX.Element {
  const [previewAddress, setPreviewAddress] = useState(generateMockAddress());
  const [chainInput, setChainInput] = useState('1');

  const wallet = useWallet({
    initialChainId: 1,
    networkNames: NETWORKS,
  });

  const previewFormatted = useMemo(
    () =>
      formatWalletAddress(previewAddress, {
        filler: '•••',
        placeholder: '请输入地址以预览效果',
      }),
    [previewAddress],
  );

  const connectionLabel = wallet.state.status === 'connected'
    ? '已连接'
    : wallet.state.status === 'connecting'
      ? '连接中'
      : '未连接';

  const connectionTone = wallet.state.status === 'connected'
    ? '#34d399'
    : wallet.state.status === 'connecting'
      ? '#fbbf24'
      : '#f87171';

  return (
    <div className="card">
      <header>
        <h1>YD 钱包演示</h1>
        <p className="helper">演示 @yd/libs 与 @yd/hooks 中封装的钱包地址格式化与连接流程。</p>
      </header>

      <section className="status">
        <span>连接状态</span>
        <strong style={{ color: connectionTone }}>{connectionLabel}</strong>

        <span>当前地址</span>
        <strong>{wallet.formattedAddress}</strong>

        <span>当前网络</span>
        <strong>
          {wallet.state.chainId == null
            ? '未选择'
            : `${wallet.state.networkName ?? '未知网络'} (#${wallet.state.chainId})`}
        </strong>

        <span>历史事件</span>
        <strong>{wallet.state.history.length} 条</strong>
      </section>

      <section className="actions">
        <button onClick={() => wallet.connect(previewAddress)} disabled={wallet.isConnected || wallet.isConnecting}>
          模拟连接
        </button>
        <button
          className="secondary"
          onClick={() => wallet.disconnect()}
          disabled={!wallet.isConnected && !wallet.isConnecting}
        >
          断开连接
        </button>
        <button
          className="secondary"
          onClick={() => wallet.updateAddress(previewAddress)}
          disabled={!wallet.isConnected}
        >
          同步地址
        </button>
        <button className="secondary" onClick={() => wallet.clearHistory()} disabled={wallet.state.history.length === 0}>
          清空历史
        </button>
      </section>

      <section>
        <label className="helper" htmlFor="chain-input">
          切换网络（输入链 ID）：
        </label>
        <div className="actions" style={{ gap: '8px' }}>
          <input
            id="chain-input"
            value={chainInput}
            onInput={(event: Event) => setChainInput((event.target as HTMLInputElement).value)}
            placeholder="例如 1、56、137"
          />
          <button
            className="secondary"
            onClick={() => {
              const id = Number(chainInput);
              if (Number.isFinite(id)) {
                wallet.switchChain(id);
              }
            }}
          >
            切换网络
          </button>
        </div>
      </section>

      <section>
        <label className="helper" htmlFor="address-input">
          输入任意地址体验格式化：
        </label>
        <input
          id="address-input"
          value={previewAddress}
          onInput={(event: Event) => setPreviewAddress((event.target as HTMLInputElement).value)}
          placeholder="0x 开头的钱包地址"
        />
        <p className="helper">格式化结果：{previewFormatted}</p>
      </section>

      <section>
        <h2 style={{ margin: '0 0 12px', fontSize: '18px' }}>最近事件</h2>
        {wallet.state.history.length === 0 ? (
          <p className="helper">暂无事件，可尝试连接钱包或切换网络。</p>
        ) : (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {wallet.state.history.map((event) => (
              <li
                key={event.id}
                style={{
                  background: 'rgba(59, 130, 246, 0.12)',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}
              >
                <span style={{ fontSize: '14px', color: '#cbd5f5' }}>{event.summary}</span>
                <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                  {new Date(event.timestamp).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
