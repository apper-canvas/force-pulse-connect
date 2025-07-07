import React from 'react';
import { cn } from '@/utils/cn';

const Loading = ({ className, type = 'posts' }) => {
  const PostCardSkeleton = () => (
    <div className="bg-white rounded-2xl p-6 mb-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-gray-200 rounded-full shimmer" />
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded shimmer mb-2" style={{ width: '40%' }} />
          <div className="h-3 bg-gray-200 rounded shimmer" style={{ width: '60%' }} />
        </div>
      </div>
      
      {/* Content */}
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-gray-200 rounded shimmer" />
        <div className="h-4 bg-gray-200 rounded shimmer" style={{ width: '80%' }} />
        <div className="h-4 bg-gray-200 rounded shimmer" style={{ width: '60%' }} />
      </div>
      
      {/* Image placeholder */}
      <div className="h-64 bg-gray-200 rounded-xl shimmer mb-4" />
      
      {/* Actions */}
      <div className="flex items-center space-x-6 pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-gray-200 rounded shimmer" />
          <div className="w-8 h-4 bg-gray-200 rounded shimmer" />
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-gray-200 rounded shimmer" />
          <div className="w-8 h-4 bg-gray-200 rounded shimmer" />
        </div>
      </div>
    </div>
  );

  const UserCardSkeleton = () => (
    <div className="bg-white rounded-xl p-4 mb-3 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full shimmer" />
          <div>
            <div className="h-4 bg-gray-200 rounded shimmer mb-2" style={{ width: '80px' }} />
            <div className="h-3 bg-gray-200 rounded shimmer" style={{ width: '60px' }} />
          </div>
        </div>
        <div className="w-20 h-8 bg-gray-200 rounded-lg shimmer" />
      </div>
    </div>
  );

  const NotificationSkeleton = () => (
    <div className="p-4 border-b border-gray-100">
      <div className="flex items-start space-x-3">
        <div className="w-8 h-8 bg-gray-200 rounded-full shimmer" />
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded shimmer mb-2" style={{ width: '70%' }} />
          <div className="h-3 bg-gray-200 rounded shimmer" style={{ width: '40%' }} />
        </div>
      </div>
    </div>
  );

  const ProfileSkeleton = () => (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      {/* Cover */}
      <div className="h-32 bg-gray-200 rounded-xl mb-4 shimmer relative">
        <div className="absolute -bottom-6 left-6">
          <div className="w-16 h-16 bg-gray-300 rounded-full shimmer border-4 border-white" />
        </div>
      </div>
      
      {/* Profile Info */}
      <div className="mt-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="h-6 bg-gray-200 rounded shimmer mb-2" style={{ width: '150px' }} />
            <div className="h-4 bg-gray-200 rounded shimmer" style={{ width: '100px' }} />
          </div>
          <div className="w-24 h-8 bg-gray-200 rounded-lg shimmer" />
        </div>
        
        <div className="h-4 bg-gray-200 rounded shimmer mb-4" style={{ width: '80%' }} />
        
        {/* Stats */}
        <div className="flex space-x-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="text-center">
              <div className="h-6 bg-gray-200 rounded shimmer mb-1" style={{ width: '30px' }} />
              <div className="h-4 bg-gray-200 rounded shimmer" style={{ width: '40px' }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSkeletons = () => {
    switch (type) {
      case 'posts':
        return Array(3).fill(0).map((_, i) => <PostCardSkeleton key={i} />);
      case 'users':
        return Array(5).fill(0).map((_, i) => <UserCardSkeleton key={i} />);
      case 'notifications':
        return Array(8).fill(0).map((_, i) => <NotificationSkeleton key={i} />);
      case 'profile':
        return <ProfileSkeleton />;
      default:
        return Array(3).fill(0).map((_, i) => <PostCardSkeleton key={i} />);
    }
  };

  return (
    <div className={cn('animate-pulse', className)}>
      {renderSkeletons()}
    </div>
  );
};

export default Loading;