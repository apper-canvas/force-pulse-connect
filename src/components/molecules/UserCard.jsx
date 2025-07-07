import React from "react";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import Avatar from "@/components/atoms/Avatar";
import Button from "@/components/atoms/Button";

const UserCard = ({ 
  user, 
  onFollow, 
  onUnfollow, 
  isFollowing,
  showFollowButton = true,
  showMessageButton = false,
  onMessage,
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
          {user.mutualFriends && user.mutualFriends.length > 0 && (
            <p className="text-xs text-primary mt-1 flex items-center space-x-1">
              <ApperIcon name="Users" size={12} />
              <span>
                {user.mutualFriends.length} mutual friend{user.mutualFriends.length !== 1 ? 's' : ''}
              </span>
            </p>
          )}
          {user.bio && !user.mutualFriends && (
            <p className="text-xs text-gray-400 mt-1 line-clamp-2">
              {user.bio}
            </p>
          )}
        </div>
      </div>

<div className="flex items-center space-x-2">
        {showFollowButton && (
          <Button
            variant={isFollowing ? 'outline' : 'primary'}
            size="sm"
            onClick={handleFollowToggle}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </Button>
        )}
        {showMessageButton && isFollowing && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onMessage?.(user)}
          >
            <ApperIcon name="MessageCircle" size={14} />
          </Button>
        )}
      </div>
    </div>
  );
};

export default UserCard;