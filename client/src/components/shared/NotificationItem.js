import { useState, useEffect } from 'react';
import { CONTRACT_ADDRESS } from '../../config/contract';

function NotificationItem({ notificationId, onDismiss }) {
  const [notification, setNotification] = useState(null);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const fetchNotification = async () => {
      try {
        const response = await fetch('https://sepolia.infura.io/v3/3e91b5a0a535418b8bb650c36e10c22d', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_getLogs',
            params: [{
              address: CONTRACT_ADDRESS,
              fromBlock: '0x0',
              toBlock: 'latest',
              topics: [
                '0x1d268a9e5adc5fdefd5d31825d22e4f472c2458e8ad5ed87587d9edccfc348f4',
                '0x' + Number(notificationId).toString(16).padStart(64, '0')
              ]
            }],
            id: 1
          })
        });

        const data = await response.json();
        
        if (data.result && data.result.length > 0) {
          const log = data.result[0];
          const dataHex = log.data.startsWith('0x') ? log.data.slice(2) : log.data;
          
          const offset = parseInt(dataHex.slice(0, 64), 16) * 2;
          const length = parseInt(dataHex.slice(offset, offset + 64), 16) * 2;
          const titleHex = dataHex.slice(offset + 64, offset + 64 + length);
          
          let title = '';
          for (let i = 0; i < titleHex.length; i += 2) {
            const charCode = parseInt(titleHex.substr(i, 2), 16);
            if (charCode) title += String.fromCharCode(charCode);
          }
          
          setNotification({ 
            id: notificationId, 
            title: title || 'New notification',
            timeAgo: 'Recently'
          });
        }
      } catch (error) {
        console.error('Error fetching notification:', error);
        setNotification({ 
          id: notificationId, 
          title: 'Notification',
          timeAgo: 'Recently'
        });
      }
    };

    fetchNotification();
  }, [notificationId]);

  const handleDismiss = () => {
    setIsDismissed(true);
    if (onDismiss) onDismiss(notificationId);
  };

  if (!notification || isDismissed) return null;

  return (
    <div className="p-4 hover:bg-gray-50 border-b last:border-b-0 group">
      <div className="flex items-start gap-3">
        <span className="text-2xl">🔔</span>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">{notification.title}</p>
          <p className="text-xs text-gray-500 mt-1">{notification.timeAgo}</p>
        </div>
        <button
          onClick={handleDismiss}
          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 text-xl"
        >
          ×
        </button>
      </div>
    </div>
  );
}

export default NotificationItem;