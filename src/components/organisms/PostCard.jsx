import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import Avatar from "@/components/atoms/Avatar";
import Button from "@/components/atoms/Button";
import PostActions from "@/components/molecules/PostActions";

function PostCard({ post, user, onLike, onComment, onShare, className }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)
  const [imageError, setImageError] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  if (!post || !user) {
    return null
  }

  const handleImageLoad = () => {
    setImageLoading(false)
    setImageError(false)
  }

  const handleImageError = () => {
    setImageLoading(false)
    if (retryCount < 2) {
      // Retry with a different image
      setRetryCount(prev => prev + 1)
      setImageError(false)
      setImageLoading(true)
      return
    }
    setImageError(true)
  }

  const getImageUrl = () => {
    if (imageError) {
      return `https://picsum.photos/500/500?random=fallback-${post.Id}`
    }
    if (retryCount > 0) {
      return `https://picsum.photos/500/500?random=retry-${post.Id}-${retryCount}`
    }
return post.imageUrl || `https://picsum.photos/500/500?random=${post.Id}`
  }

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

  const isLiked = post.likes?.some(like => like.userId === user?.id) || false;
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
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm">
          <ApperIcon name="MoreHorizontal" className="w-4 h-4" />
        </Button>
      </div>

      {/* Post Content */}
      <div className="mb-4">
        <div className={cn(
          "text-gray-900 leading-relaxed",
          !isExpanded && post.content?.length > 200 ? "line-clamp-3" : ""
        )}>
          {formatContent(post.content || '')}
        </div>
        {post.content?.length > 200 && (
          <Button 
            variant="link" 
            size="sm" 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-primary p-0 h-auto font-normal"
          >
            {isExpanded ? 'Show less' : 'Read more'}
          </Button>
        )}
      </div>

      {/* Post Image */}
      {(post.imageUrl || imageError) && (
        <div className="mb-4 rounded-2xl overflow-hidden bg-gray-100 relative">
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            )}
            <img
              src={getImageUrl()}
              alt="Post content"
              className={cn(
                "w-full h-auto object-cover transition-all duration-300",
                imageLoading ? "opacity-0" : "opacity-100 hover:scale-105",
                imageError ? "filter grayscale" : ""
              )}
              loading="lazy"
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
            {imageError && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <div className="text-center text-gray-500">
                  <ApperIcon name="ImageOff" className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">Image unavailable</p>
                </div>
              </div>
            )}
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