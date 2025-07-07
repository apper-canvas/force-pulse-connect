import React from 'react';
import Avatar from '@/components/atoms/Avatar';
import Badge from '@/components/atoms/Badge';
import ApperIcon from '@/components/ApperIcon';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/utils/cn';

const NotificationItem = ({ 
  notification, 
  user, 
  onMarkAsRead,
  onOpenDetail,
  className 
}) => {
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like':
        return <ApperIcon name="Heart" size={16} className="text-red-500" />;
      case 'comment':
        return <ApperIcon name="MessageCircle" size={16} className="text-blue-500" />;
      case 'follow':
        return <ApperIcon name="UserPlus" size={16} className="text-green-500" />;
      default:
        return <ApperIcon name="Bell" size={16} className="text-gray-500" />;
    }
  };

  const getNotificationText = (type) => {
    switch (type) {
      case 'like':
        return 'liked your post';
      case 'comment':
        return 'commented on your post';
      case 'follow':
        return 'started following you';
      default:
        return 'sent you a notification';
    }
  };

const handleClick = () => {
    // Open detail modal first
    onOpenDetail?.(notification);
    
    // Then mark as read if unread
    if (!notification.isRead) {
      onMarkAsRead?.(notification.Id);
    }
  };

  return (
    <div 
      className={cn(
        'flex items-start space-x-3 p-4 hover:bg-gray-50 transition-colors cursor-pointer',
        !notification.isRead && 'bg-blue-50 border-l-4 border-primary',
        className
      )}
      onClick={handleClick}
    >
      <div className="relative">
        <Avatar
          src={user?.avatar}
          alt={user?.displayName}
          size="sm"
        />
        <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1">
          {getNotificationIcon(notification.type)}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-900">
            <span className="font-semibold">{user?.displayName}</span>
            {' '}
            <span className="text-gray-600">{getNotificationText(notification.type)}</span>
          </p>
          {!notification.isRead && (
            <Badge variant="primary" className="ml-2">
              New
            </Badge>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {formatDistanceToNow(new Date(notification.timestamp))} ago
        </p>
      </div>
    </div>
  );
};

export default NotificationItem;