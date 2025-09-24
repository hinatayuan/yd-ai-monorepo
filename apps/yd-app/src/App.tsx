import { useMemo, useState } from 'react';
import { formatWalletAddress } from '@yd/libs';
import { useWallet } from '@yd/hooks';

const SAMPLE_ADDRESS = '0x1234567890abcdef1234567890abcdef12345678';

function StateRow({ label, value }: { label: string; value: string | undefined }) {
  return (
    <div className="state-row">
      <span className="state-label">{label}</span>
      <span className="state-value">{value ?? '—'}</span>
    </div>
  );
}

function SectionTitle({ children }: { children: string }) {
  return <h2 className="section-title">{children}</h2>;
}

const App = () => {
  const [addressInput, setAddressInput] = useState<string>(SAMPLE_ADDRESS);
  const manualFormattedAddress = useMemo(() => formatWalletAddress(addressInput), [addressInput]);

  const { state, formattedAddress, connect, disconnect, setAddress } = useWallet();

  return (
    <div className="app-container">
      <header>
        <h1>YD Monorepo Playground</h1>
        <p>Utilities and hooks for Ethereum wallets, built with pnpm workspaces.</p>
      </header>

      <section className="card">
        <SectionTitle>Format wallet address</SectionTitle>
        <p>Use the shared utility from <code>@yd/libs</code> to keep addresses readable.</p>
        <label className="input-label" htmlFor="address-input">
          Wallet Address
        </label>
        <input
          id="address-input"
          value={addressInput}
          onChange={(event) => setAddressInput(event.target.value)}
          placeholder="0x..."
        />
        <div className="highlight">Formatted: {manualFormattedAddress}</div>
      </section>

      <section className="card">
        <SectionTitle>useWallet hook demo</SectionTitle>
        <p>
          The hook combines <code>useImmer</code> with the formatting helper. Try connecting to MetaMask or simulate a
          connection using the input above.
        </p>
        <div className="button-row">
          <button type="button" onClick={() => void connect()} className="primary">
            Connect MetaMask
          </button>
          <button type="button" onClick={disconnect}>
            Disconnect
          </button>
          <button type="button" onClick={() => setAddress(addressInput)}>
            Simulate Address
          </button>
        </div>
        <div className="state-panel">
          <StateRow label="Status" value={state.status} />
          <StateRow label="Connected" value={state.isConnected ? 'Yes' : 'No'} />
          <StateRow label="Chain ID" value={state.chainId} />
          <StateRow label="Raw Address" value={state.address} />
          <StateRow label="Formatted" value={formattedAddress} />
          <StateRow label="Error" value={state.error} />
        </div>
      </section>
    </div>
  );
};

export default App;
