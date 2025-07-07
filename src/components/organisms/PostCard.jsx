import React, { useState } from 'react';
import Avatar from '@/components/atoms/Avatar';
import Button from '@/components/atoms/Button';
import PostActions from '@/components/molecules/PostActions';
import ApperIcon from '@/components/ApperIcon';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/utils/cn';

const PostCard = ({ 
  post, 
  user, 
  onLike, 
  onComment, 
  onShare,
  isLiked,
  className 
}) => {
  const [showComments, setShowComments] = useState(false);

  const formatContent = (content) => {
    return content.split(' ').map((word, index) => {
      if (word.startsWith('#')) {
        return (
          <span key={index} className="hashtag">
            {word}{' '}
          </span>
        );
      }
      return word + ' ';
    });
  };

  const handleComment = () => {
    setShowComments(!showComments);
    onComment?.(post.Id);
  };

  return (
    <div className={cn('post-card p-6 mb-4', className)}>
      {/* Post Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Avatar
            src={user?.avatar}
            alt={user?.displayName}
            size="md"
          />
          <div>
            <h3 className="font-semibold text-gray-900">{user?.displayName}</h3>
            <p className="text-sm text-gray-500">
              @{user?.username} • {formatDistanceToNow(new Date(post.timestamp))} ago
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="text-gray-400">
          <ApperIcon name="MoreHorizontal" size={20} />
        </Button>
      </div>

      {/* Post Content */}
      <div className="mb-4">
        <p className="text-gray-900 leading-relaxed">
          {formatContent(post.content)}
        </p>
      </div>

      {/* Post Image */}
      {post.imageUrl && (
        <div className="mb-4">
          <img
            src={post.imageUrl}
            alt="Post content"
            className="w-full h-auto rounded-xl object-cover max-h-96"
          />
        </div>
      )}

      {/* Post Actions */}
      <PostActions
        post={post}
        onLike={onLike}
        onComment={handleComment}
        onShare={onShare}
        isLiked={isLiked}
        className="pt-4 border-t border-gray-100"
      />

      {/* Comments Section */}
      {showComments && post.comments && post.comments.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <h4 className="font-semibold text-gray-900 mb-3">Comments</h4>
          <div className="space-y-3">
            {post.comments.slice(0, 3).map((comment, index) => (
              <div key={index} className="flex items-start space-x-3">
                <Avatar
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.userId}`}
                  alt="Commenter"
                  size="sm"
                />
                <div className="flex-1 bg-gray-50 rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-900">User {comment.userId}</p>
                  <p className="text-sm text-gray-700 mt-1">{comment.content}</p>
                </div>
              </div>
            ))}
            {post.comments.length > 3 && (
              <Button variant="link" size="sm" className="text-primary">
                View all {post.comments.length} comments
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;