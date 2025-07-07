import React from 'react';
import Avatar from '@/components/atoms/Avatar';
import Button from '@/components/atoms/Button';
import { cn } from '@/utils/cn';

const UserCard = ({ 
  user, 
  onFollow, 
  onUnfollow, 
  isFollowing,
  showFollowButton = true,
  className 
}) => {
  const handleFollowToggle = () => {
    if (isFollowing) {
      onUnfollow?.(user.Id);
    } else {
      onFollow?.(user.Id);
    }
  };

  return (
    <div className={cn(
      'flex items-center justify-between p-4 bg-white rounded-xl',
      'border border-gray-100 hover:shadow-md transition-all duration-200',
      className
    )}>
      <div className="flex items-center space-x-3">
        <Avatar
          src={user.avatar}
          alt={user.displayName}
          size="md"
        />
        <div>
          <h3 className="font-semibold text-gray-900">{user.displayName}</h3>
          <p className="text-sm text-gray-500">@{user.username}</p>
          {user.bio && (
            <p className="text-xs text-gray-400 mt-1 line-clamp-2">
              {user.bio}
            </p>
          )}
        </div>
      </div>

      {showFollowButton && (
        <Button
          variant={isFollowing ? 'outline' : 'primary'}
          size="sm"
          onClick={handleFollowToggle}
        >
          {isFollowing ? 'Following' : 'Follow'}
        </Button>
      )}
    </div>
  );
};

export default UserCard;