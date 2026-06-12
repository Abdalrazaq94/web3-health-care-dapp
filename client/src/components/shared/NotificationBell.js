import { useAccount } from 'wagmi';
import { CONTRACT_ADDRESS } from '../../config/contract';
import { useState, useEffect } from 'react';
import NotificationDropdown from './NotificationDropdown';

function NotificationBell() {
  const { address } = useAccount();
  const [isOpen, setIsOpen] = useState(false);
  const [notificationIds, setNotificationIds] = useState([]);

useEffect(() => {
  const fetchNotifications = async () => {
    if (!address) return;

    try {
      // Get current block
      const blockResponse = await fetch('https://sepolia.infura.io/v3/3e91b5a0a535418b8bb650c36e10c22d', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_blockNumber',
          params: [],
          id: 1
        })
      });

      const blockData = await blockResponse.json();
      const currentBlock = parseInt(blockData.result, 16);
      const fromBlock = currentBlock - 5000; // Only last 1000 blocks (~50 minutes)

      console.log('📦 Searching blocks:', fromBlock, 'to', currentBlock);

      const response = await fetch('https://sepolia.infura.io/v3/3e91b5a0a535418b8bb650c36e10c22d', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_getLogs',
          params: [{
            address: CONTRACT_ADDRESS,
            fromBlock: '0x' + fromBlock.toString(16),
            toBlock: 'latest',
            topics: [
              '0x1d268a9e5adc5fdefd5d31825d22e4f472c2458e8ad5ed87587d9edccfc348f4',
              null,
              '0x' + address.slice(2).padStart(64, '0')
            ]
          }],
          id: 2
        })
      });

      const data = await response.json();
      console.log('📥 Response:', data);
      
      if (data.result) {
        const ids = data.result.map(log => parseInt(log.topics[1], 16));
        console.log('✅ Found IDs:', ids);
        setNotificationIds(ids.reverse());
      }
    } catch (error) {
      console.error('💥 Error:', error);
    }
  };

  fetchNotifications();
}, [address]);
  const notificationCount = notificationIds.length;

  if (!address) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100 rounded-full transition"
      >
        <span className="text-2xl">🔔</span>
        {notificationCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {notificationCount}
          </span>
        )}
      </button>

      {isOpen && (
        <NotificationDropdown 
          notificationIds={notificationIds} 
          onClose={() => setIsOpen(false)} 
        />
      )}
    </div>
  );
}

export default NotificationBell;