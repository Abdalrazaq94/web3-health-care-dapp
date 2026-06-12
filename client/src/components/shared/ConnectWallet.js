import { useAccount, useConnect, useDisconnect } from 'wagmi';

function ConnectWallet() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  const handleConnect = () => {
    // If a wallet extension exists (computer or MetaMask in-app browser) use it
    if (typeof window !== 'undefined' && window.ethereum) {
      const inj = connectors.find((c) => c.type === 'injected');
      if (inj) return connect({ connector: inj });
    }
    // Otherwise (normal phone browser) use WalletConnect
    const wc = connectors.find((c) => c.id === 'walletConnect');
    if (wc) return connect({ connector: wc });
  };

  if (isConnected) {
    return (
      <div className="text-center">
        <p className="text-green-600 font-bold mb-2">
          ✅ Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
        </p>
        <button
          onClick={() => disconnect()}
          className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="text-center">
      <button
        onClick={handleConnect}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 text-lg font-bold"
      >
        🦊 Connect Wallet
      </button>
    </div>
  );
}

export default ConnectWallet;