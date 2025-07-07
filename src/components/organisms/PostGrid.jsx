import React from 'react';
import ApperIcon from '@/components/ApperIcon';
import { cn } from '@/utils/cn';

const PostGrid = ({ 
  posts = [], 
  onPostClick,
  className 
}) => {
  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <ApperIcon name="Grid3x3" size={48} className="mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500 text-lg">No posts yet</p>
      </div>
    );
  }

  return (
    <div className={cn(
      'grid grid-cols-3 gap-1 md:gap-2',
      className
    )}>
      {posts.map((post) => (
        <div
          key={post.Id}
          className="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => onPostClick?.(post.Id)}
        >
          {post.imageUrl ? (
            <img
              src={post.imageUrl}
              alt="Post"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <ApperIcon name="FileText" size={24} className="text-gray-400" />
            </div>
          )}
          
          {/* Hover overlay with stats */}
          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center space-x-4">
            <div className="flex items-center text-white">
              <ApperIcon name="Heart" size={16} className="mr-1" />
              <span className="text-sm">{post.likes?.length || 0}</span>
            </div>
            <div className="flex items-center text-white">
              <ApperIcon name="MessageCircle" size={16} className="mr-1" />
              <span className="text-sm">{post.comments?.length || 0}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PostGrid;