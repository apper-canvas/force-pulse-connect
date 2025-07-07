import React from 'react';
import Button from '@/components/atoms/Button';
import ApperIcon from '@/components/ApperIcon';
import { cn } from '@/utils/cn';

const PostActions = ({ 
  post, 
  onLike, 
  onComment, 
  onShare, 
  isLiked,
  className 
}) => {
  const handleLike = () => {
    onLike?.(post.Id);
  };

  const handleComment = () => {
    onComment?.(post.Id);
  };

  const handleShare = () => {
    onShare?.(post.Id);
  };

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleLike}
        className={cn(
          'rounded-full hover:bg-red-50',
          isLiked ? 'text-red-500' : 'text-gray-500'
        )}
      >
        <ApperIcon 
          name={isLiked ? 'Heart' : 'Heart'} 
          size={18}
          className={cn(
            'transition-all duration-200',
            isLiked && 'animate-like-bounce fill-current'
          )}
        />
      </Button>
      <span className="text-sm text-gray-600 mr-4">
        {post.likes?.length || 0}
      </span>

      <Button
        variant="ghost"
        size="icon"
        onClick={handleComment}
        className="rounded-full hover:bg-blue-50 text-gray-500"
      >
        <ApperIcon name="MessageCircle" size={18} />
      </Button>
      <span className="text-sm text-gray-600 mr-4">
        {post.comments?.length || 0}
      </span>

      <Button
        variant="ghost"
        size="icon"
        onClick={handleShare}
        className="rounded-full hover:bg-green-50 text-gray-500"
      >
        <ApperIcon name="Share" size={18} />
      </Button>
    </div>
  );
};

export default PostActions;