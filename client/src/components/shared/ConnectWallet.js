import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';

function ConnectWallet() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

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
        onClick={() => connect({ connector: injected() })}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 text-lg font-bold"
      >
        🦊 Connect MetaMask
      </button>
    </div>
  );
}

export default ConnectWallet;