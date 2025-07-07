import React, { useState } from "react";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";

function PostGrid({ posts, onPostClick, className }) {
  const [imageErrors, setImageErrors] = useState({})
  const [imageLoading, setImageLoading] = useState({})

  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-12">
        <ApperIcon name="ImageOff" className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-500 text-lg">No posts to display</p>
      </div>
    )
  }

  const handleImageLoad = (postId) => {
    setImageLoading(prev => ({ ...prev, [postId]: false }))
    setImageErrors(prev => ({ ...prev, [postId]: false }))
  }

  const handleImageError = (postId) => {
    setImageLoading(prev => ({ ...prev, [postId]: false }))
    setImageErrors(prev => ({ ...prev, [postId]: true }))
  }

  const getImageUrl = (post) => {
    if (imageErrors[post.Id]) {
      return `https://picsum.photos/400/400?random=grid-${post.Id}`
    }
    return post.imageUrl || `https://picsum.photos/400/400?random=${post.Id}`
  }

return (
    <div className={cn("grid grid-cols-3 gap-1 md:gap-2", className)}>
      {posts.map((post) => (
        <div
          key={post.Id}
          className="aspect-square overflow-hidden rounded-2xl bg-gray-100 relative cursor-pointer group"
          onClick={() => onPostClick?.(post.Id)}
        >
          {imageLoading[post.Id] !== false && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          )}
          {post.imageUrl || imageErrors[post.Id] ? (
            <img
              src={getImageUrl(post)}
              alt="Post content"
              className={cn(
                "w-full h-full object-cover transition-all duration-300",
                imageLoading[post.Id] !== false ? "opacity-0" : "opacity-100 group-hover:scale-105",
                imageErrors[post.Id] ? "filter grayscale" : ""
              )}
              loading="lazy"
              onLoad={() => handleImageLoad(post.Id)}
              onError={() => handleImageError(post.Id)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <ApperIcon name="Image" className="w-12 h-12 text-gray-400" />
            </div>
          )}
          {imageErrors[post.Id] && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="text-center text-white">
                <ApperIcon name="ImageOff" className="w-6 h-6 mx-auto mb-1" />
                <p className="text-xs">Image unavailable</p>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
export default PostGrid;