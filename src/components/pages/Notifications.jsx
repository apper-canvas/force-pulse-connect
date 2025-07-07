import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import NotificationItem from '@/components/molecules/NotificationItem';
import NotificationDetailModal from '@/components/organisms/NotificationDetailModal';
import Button from '@/components/atoms/Button';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import ApperIcon from '@/components/ApperIcon';
import notificationService from '@/services/api/notificationService';
import userService from '@/services/api/userService';
const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [markingAllAsRead, setMarkingAllAsRead] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [notificationsData, usersData] = await Promise.all([
        notificationService.getAll(),
        userService.getAll()
      ]);
      
      setNotifications(notificationsData);
      setUsers(usersData);
    } catch (err) {
      setError(err.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(notification => 
          notification.Id === notificationId 
            ? { ...notification, is_read: true }
            : notification
        )
      );
    } catch (err) {
      toast.error('Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setMarkingAllAsRead(true);
      await notificationService.markAllAsRead();
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, is_read: true }))
      );
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error('Failed to mark all notifications as read');
    } finally {
      setMarkingAllAsRead(false);
    }
  };

  const handleOpenDetail = (notification) => {
    setSelectedNotification(notification);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetail = () => {
    setSelectedNotification(null);
    setIsDetailModalOpen(false);
  };

  const getUserById = (userId) => {
    return users.find(user => user.Id === userId);
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <Loading type="notifications" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <Error message={error} onRetry={fetchData} />
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <Empty
          icon="Bell"
          title="No notifications yet"
          description="When people interact with your posts, you'll see their activity here."
          actionLabel="Go to Home"
          onAction={() => window.location.href = '/'}
        />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 pb-20 md:pb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-500 mt-1">
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        
        {unreadCount > 0 && (
          <Button
            onClick={handleMarkAllAsRead}
            disabled={markingAllAsRead}
            variant="outline"
            size="sm"
          >
            {markingAllAsRead ? (
              <>
                <ApperIcon name="Loader2" size={16} className="mr-2 animate-spin" />
                Marking...
              </>
            ) : (
              <>
                <ApperIcon name="CheckCheck" size={16} className="mr-2" />
                Mark All Read
              </>
            )}
          </Button>
        )}
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="divide-y divide-gray-100">
          {notifications.map((notification) => {
            const user = getUserById(notification.from_user_id);
            return (
              <NotificationItem
                key={notification.Id}
                notification={notification}
                user={user}
                onMarkAsRead={handleMarkAsRead}
                onOpenDetail={handleOpenDetail}
              />
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 flex justify-center">
        <Button
          variant="ghost"
          onClick={fetchData}
          className="text-gray-500 hover:text-gray-700"
        >
          <ApperIcon name="RefreshCw" size={16} className="mr-2" />
          Refresh Notifications
        </Button>
      </div>

      {/* Notification Detail Modal */}
      <NotificationDetailModal
        notification={selectedNotification}
        user={selectedNotification ? getUserById(selectedNotification.from_user_id) : null}
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetail}
        onMarkAsRead={handleMarkAsRead}
      />
    </div>
  );
};

export default Notifications;