import { useAccount, useDisconnect } from 'wagmi';
import { useConnectWallet } from '@privy-io/react-auth';

function ConnectWallet() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { connectWallet } = useConnectWallet();

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
        onClick={() => connectWallet()}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 text-lg font-bold"
      >
        🦊 Connect Wallet
      </button>
    </div>
  );
}

export default ConnectWallet;