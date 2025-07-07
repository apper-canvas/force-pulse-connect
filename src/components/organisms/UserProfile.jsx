import React from 'react';
import Avatar from '@/components/atoms/Avatar';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import ApperIcon from '@/components/ApperIcon';
import { cn } from '@/utils/cn';

const UserProfile = ({ 
  user, 
  isCurrentUser = false,
  isFollowing = false,
  onFollow, 
  onUnfollow,
  onEdit,
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
      'bg-white rounded-2xl shadow-sm border border-gray-100 p-6',
      className
    )}>
      {/* Cover Background */}
      <div className="h-32 bg-gradient-to-r from-primary via-secondary to-accent rounded-xl mb-4 relative">
        <div className="absolute -bottom-6 left-6">
          <Avatar
            src={user.avatar}
            alt={user.displayName}
            size="xl"
            className="border-4 border-white"
          />
        </div>
      </div>

      {/* Profile Info */}
      <div className="mt-8 mb-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{user.displayName}</h1>
            <p className="text-gray-500">@{user.username}</p>
          </div>
          
          <div className="flex items-center space-x-2">
            {isCurrentUser ? (
              <Button variant="outline" onClick={onEdit}>
                <ApperIcon name="Edit" size={16} className="mr-2" />
                Edit Profile
              </Button>
) : (
              <>
                <Button
                  variant={isFollowing ? 'outline' : 'primary'}
                  onClick={handleFollowToggle}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </Button>
                {isFollowing && (
                  <Button variant="outline" onClick={() => onMessage?.(user)}>
                    <ApperIcon name="MessageCircle" size={16} className="mr-2" />
                    Message
                  </Button>
                )}
              </>
            )}
            <Button variant="ghost" size="icon">
              <ApperIcon name="MoreHorizontal" size={20} />
            </Button>
          </div>
        </div>

        {/* Bio */}
        {user.bio && (
          <p className="text-gray-700 mb-4 leading-relaxed">{user.bio}</p>
        )}

        {/* Stats */}
        <div className="flex items-center space-x-6 mb-4">
          <div className="text-center">
            <div className="text-xl font-bold text-gray-900">{user.postsCount || 0}</div>
            <div className="text-sm text-gray-500">Posts</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-gray-900">{user.followersCount || 0}</div>
            <div className="text-sm text-gray-500">Followers</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-gray-900">{user.followingCount || 0}</div>
            <div className="text-sm text-gray-500">Following</div>
          </div>
        </div>

        {/* Privacy Badge */}
        {user.isPrivate && (
          <Badge variant="outline" className="inline-flex items-center">
            <ApperIcon name="Lock" size={12} className="mr-1" />
            Private Account
          </Badge>
        )}
      </div>
    </div>
  );
};

export default UserProfile;