import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { cn } from '@/utils/cn';
import ApperIcon from '@/components/ApperIcon';
import Avatar from '@/components/atoms/Avatar';
import Button from '@/components/atoms/Button';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import userService from '@/services/api/userService';

const FriendSuggestion = ({ currentUserId, className, limit = 3 }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [followingUsers, setFollowingUsers] = useState(new Set());
  const [expandedCard, setExpandedCard] = useState(null);

  useEffect(() => {
    fetchSuggestions();
  }, [currentUserId, limit]);

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getFriendSuggestions(currentUserId, limit);
      setSuggestions(data);
    } catch (err) {
      setError('Failed to load friend suggestions');
      toast.error('Failed to load friend suggestions');
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (userId) => {
    try {
      await userService.followUser(currentUserId, userId);
      setFollowingUsers(prev => new Set([...prev, userId]));
      toast.success('Successfully followed user');
    } catch (err) {
      toast.error('Failed to follow user');
    }
  };

  const handleUnfollow = async (userId) => {
    try {
      await userService.unfollowUser(currentUserId, userId);
      setFollowingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
      toast.success('Successfully unfollowed user');
    } catch (err) {
      toast.error('Failed to unfollow user');
    }
  };

  const toggleExpanded = (cardId) => {
    setExpandedCard(expandedCard === cardId ? null : cardId);
  };

  if (loading) {
    return (
      <div className={cn('bg-white rounded-2xl shadow-sm border border-gray-100 p-6', className)}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Friend Suggestions</h2>
          <ApperIcon name="Users" size={20} className="text-gray-400" />
        </div>
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('bg-white rounded-2xl shadow-sm border border-gray-100 p-6', className)}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Friend Suggestions</h2>
          <ApperIcon name="Users" size={20} className="text-gray-400" />
        </div>
        <Error message={error} onRetry={fetchSuggestions} />
      </div>
    );
  }

  if (suggestions.length === 0) {
    return (
      <div className={cn('bg-white rounded-2xl shadow-sm border border-gray-100 p-6', className)}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Friend Suggestions</h2>
          <ApperIcon name="Users" size={20} className="text-gray-400" />
        </div>
        <div className="text-center py-8">
          <ApperIcon name="UserPlus" size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No friend suggestions available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('bg-white rounded-2xl shadow-sm border border-gray-100 p-6', className)}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Friend Suggestions</h2>
        <ApperIcon name="Users" size={20} className="text-gray-400" />
      </div>

      <div className="space-y-4">
        {suggestions.map((suggestion) => {
          const isFollowing = followingUsers.has(suggestion.Id);
          const isExpanded = expandedCard === suggestion.Id;
          const mutualCount = suggestion.mutualFriends?.length || 0;

          return (
            <div
              key={suggestion.Id}
              className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  <Avatar
                    src={suggestion.avatar}
                    alt={suggestion.displayName}
                    size="md"
                    className="flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {suggestion.displayName}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">
                      @{suggestion.username}
                    </p>
                    {mutualCount > 0 && (
                      <button
                        onClick={() => toggleExpanded(suggestion.Id)}
                        className="text-xs text-primary hover:text-primary/80 transition-colors duration-200 mt-1 flex items-center space-x-1"
                      >
                        <ApperIcon name="Users" size={12} />
                        <span>
                          {mutualCount} mutual friend{mutualCount !== 1 ? 's' : ''}
                        </span>
                        <ApperIcon 
                          name={isExpanded ? "ChevronUp" : "ChevronDown"} 
                          size={12} 
                        />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2 flex-shrink-0">
                  <Button
                    variant={isFollowing ? 'outline' : 'primary'}
                    size="sm"
                    onClick={() => isFollowing ? handleUnfollow(suggestion.Id) : handleFollow(suggestion.Id)}
                    className="min-w-[80px]"
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2"
                  >
                    <ApperIcon name="MoreHorizontal" size={16} />
                  </Button>
                </div>
              </div>

              {/* Expanded Mutual Friends */}
              {isExpanded && mutualCount > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-2 mb-3">
                    <ApperIcon name="Users" size={14} className="text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">
                      Mutual Friends
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {suggestion.mutualFriends.slice(0, 6).map((friend) => (
                      <div
                        key={friend.Id}
                        className="flex items-center space-x-2 bg-gray-50 rounded-lg px-3 py-2"
                      >
                        <Avatar
                          src={friend.avatar}
                          alt={friend.displayName}
                          size="xs"
                        />
                        <span className="text-xs text-gray-700 font-medium">
                          {friend.displayName}
                        </span>
                      </div>
                    ))}
                    {suggestion.mutualFriends.length > 6 && (
                      <div className="flex items-center justify-center bg-gray-50 rounded-lg px-3 py-2">
                        <span className="text-xs text-gray-500">
                          +{suggestion.mutualFriends.length - 6} more
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* View All Button */}
      <div className="mt-6 text-center">
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => toast.info('View all suggestions feature coming soon')}
        >
          <ApperIcon name="Users" size={16} className="mr-2" />
          View All Suggestions
        </Button>
      </div>
    </div>
  );
};

export default FriendSuggestion;