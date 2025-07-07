import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import UserProfile from '@/components/organisms/UserProfile';
import PostGrid from '@/components/organisms/PostGrid';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import Button from '@/components/atoms/Button';
import ApperIcon from '@/components/ApperIcon';
import userService from '@/services/api/userService';
import postService from '@/services/api/postService';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('posts');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const currentUser = await userService.getCurrentUser();
      if (!currentUser) {
        throw new Error('User not found');
      }
      
      const [userPosts] = await Promise.all([
        postService.getByUserId(currentUser.Id)
      ]);
      
      setUser(currentUser);
      setPosts(userPosts);
    } catch (err) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePostClick = (postId) => {
    // In a real app, this would navigate to the post detail page
    console.log('Open post:', postId);
  };

  const handleEditProfile = () => {
    toast.info('Edit profile functionality would be implemented here');
  };

  const tabs = [
    { id: 'posts', label: 'Posts', icon: 'Grid3x3' },
    { id: 'saved', label: 'Saved', icon: 'Bookmark' },
    { id: 'tagged', label: 'Tagged', icon: 'Tag' }
  ];

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <Loading type="profile" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <Error message={error} onRetry={fetchData} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 pb-20 md:pb-4">
      {/* Profile Header */}
      <div className="mb-8">
        <UserProfile
          user={user}
          isCurrentUser={true}
          onEdit={handleEditProfile}
        />
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="flex items-center justify-center border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-3 font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'text-gray-900 border-b-2 border-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <ApperIcon name={tab.icon} size={16} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'posts' && (
          <div>
            {posts.length === 0 ? (
              <Empty
                icon="Camera"
                title="No posts yet"
                description="Share your first post to start building your profile!"
                actionLabel="Create Post"
                onAction={() => toast.info('Create post functionality would be implemented here')}
              />
            ) : (
              <PostGrid posts={posts} onPostClick={handlePostClick} />
            )}
          </div>
        )}

        {activeTab === 'saved' && (
          <Empty
            icon="Bookmark"
            title="No saved posts"
            description="Posts you save will appear here for easy access later."
            actionLabel="Explore Posts"
            onAction={() => window.location.href = '/explore'}
          />
        )}

        {activeTab === 'tagged' && (
          <Empty
            icon="Tag"
            title="No tagged posts"
            description="Posts where you've been tagged by others will appear here."
            actionLabel="Go to Home"
            onAction={() => window.location.href = '/'}
          />
        )}
      </div>

      {/* Profile Stats */}
      <div className="mt-8 grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-gray-900">{user?.postsCount || 0}</div>
          <div className="text-sm text-gray-500">Posts</div>
        </div>
        <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-gray-900">{user?.followersCount || 0}</div>
          <div className="text-sm text-gray-500">Followers</div>
        </div>
        <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-gray-900">{user?.followingCount || 0}</div>
          <div className="text-sm text-gray-500">Following</div>
        </div>
      </div>
    </div>
  );
};

export default Profile;