import NotificationItem from './NotificationItem';

function NotificationDropdown({ notificationIds, onClose }) {
  return (
    <>
      <div 
        className="fixed inset-0 z-10" 
        onClick={onClose}
      />
      <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl z-20 max-h-96 overflow-y-auto">
        <div className="p-4 border-b">
          <h3 className="font-bold text-lg">Notifications</h3>
        </div>
        {notificationIds && notificationIds.length > 0 ? (
          <div className="divide-y">
            {[...notificationIds].reverse().slice(0, 10).map((id) => (
              <NotificationItem key={id.toString()} notificationId={id} />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            No notifications yet
          </div>
        )}
      </div>
    </>
  );
}

export default NotificationDropdown;