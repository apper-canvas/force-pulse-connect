import React from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import Avatar from '@/components/atoms/Avatar';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import ApperIcon from '@/components/ApperIcon';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/utils/cn';

const NotificationDetailModal = ({ 
  notification, 
  user, 
  isOpen, 
  onClose,
  onMarkAsRead
}) => {
  const navigate = useNavigate();

  if (!isOpen || !notification) return null;

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like':
        return <ApperIcon name="Heart" size={24} className="text-red-500" />;
      case 'comment':
        return <ApperIcon name="MessageCircle" size={24} className="text-blue-500" />;
      case 'follow':
        return <ApperIcon name="UserPlus" size={24} className="text-green-500" />;
      default:
        return <ApperIcon name="Bell" size={24} className="text-gray-500" />;
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

  const getActionText = (type) => {
    switch (type) {
      case 'like':
        return 'View Post';
      case 'comment':
        return 'View Post';
      case 'follow':
        return 'View Profile';
      default:
        return 'View';
    }
  };

const handleAction = () => {
    if (notification.type === 'follow') {
      navigate(`/profile/${notification.fromUserId}`);
    } else if (notification.postId) {
      navigate('/');
    }
    onClose();
  };

  const handleMarkAsRead = async () => {
    if (!notification.isRead) {
      try {
        await onMarkAsRead(notification.Id);
        toast.success('Notification marked as read');
      } catch (error) {
        toast.error('Failed to mark notification as read');
      }
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Notification Details</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <ApperIcon name="X" size={20} />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* User and notification info */}
          <div className="flex items-start space-x-4">
            <div className="relative">
              <Avatar
                src={user?.avatar}
                alt={user?.displayName}
                size="lg"
              />
              <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-lg">
                {getNotificationIcon(notification.type)}
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="font-semibold text-gray-900">{user?.displayName}</h3>
                {!notification.isRead && (
                  <Badge variant="primary">New</Badge>
                )}
              </div>
              <p className="text-gray-600 mb-1">{getNotificationText(notification.type)}</p>
              <p className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(notification.timestamp))} ago
              </p>
            </div>
          </div>

          {/* Additional details */}
          {notification.message && (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-700">{notification.message}</p>
            </div>
          )}

          {/* Content preview for post-related notifications */}
          {(notification.type === 'like' || notification.type === 'comment') && notification.postContent && (
            <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
              <p className="text-sm text-gray-600 mb-1">Related post:</p>
              <p className="text-sm text-gray-800 line-clamp-3">{notification.postContent}</p>
            </div>
          )}

          {/* Timestamp details */}
          <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <ApperIcon name="Clock" size={14} />
              <span>
                {new Date(notification.timestamp).toLocaleDateString()} at{' '}
                {new Date(notification.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-100 space-y-3">
          <div className="flex space-x-3">
            <Button
              onClick={handleAction}
              className="flex-1"
              variant="primary"
            >
              <ApperIcon name="ExternalLink" size={16} className="mr-2" />
              {getActionText(notification.type)}
            </Button>
            
            {!notification.isRead && (
              <Button
                onClick={handleMarkAsRead}
                variant="outline"
                className="flex-shrink-0"
              >
                <ApperIcon name="Check" size={16} className="mr-2" />
                Mark Read
              </Button>
            )}
          </div>
          
          <Button
            onClick={onClose}
            variant="ghost"
            className="w-full"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotificationDetailModal;