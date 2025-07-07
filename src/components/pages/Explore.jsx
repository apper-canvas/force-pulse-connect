import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import SearchBar from '@/components/molecules/SearchBar';
import UserCard from '@/components/molecules/UserCard';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import ApperIcon from '@/components/ApperIcon';
import userService from '@/services/api/userService';

const Explore = () => {
  const [users, setUsers] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);
  const [followedUsers, setFollowedUsers] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  const fetchSuggestedUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getSuggestedUsers(1, 10); // Current user ID = 1
      setUsers(data);
    } catch (err) {
      setError(err.message || 'Failed to load suggested users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestedUsers();
  }, []);

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setSearchQuery('');
      return;
    }

    try {
      setSearching(true);
      setSearchQuery(query);
      const results = await userService.searchUsers(query);
      setSearchResults(results);
    } catch (err) {
      toast.error('Failed to search users');
    } finally {
      setSearching(false);
    }
  };

  const handleFollow = async (userId) => {
    try {
      await userService.followUser(1, userId); // Current user ID = 1
      setFollowedUsers(prev => new Set(prev).add(userId));
      toast.success('User followed successfully!');
    } catch (err) {
      toast.error('Failed to follow user');
    }
  };

  const handleUnfollow = async (userId) => {
    try {
      await userService.unfollowUser(1, userId); // Current user ID = 1
      setFollowedUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
      toast.success('User unfollowed successfully!');
    } catch (err) {
      toast.error('Failed to unfollow user');
    }
  };

  const displayUsers = searchQuery ? searchResults : users;
  const isSearching = searching;
  const showEmpty = !isSearching && displayUsers.length === 0;

  return (
    <div className="max-w-2xl mx-auto p-4 pb-20 md:pb-4">
      {/* Search Section */}
      <div className="mb-6">
        <SearchBar
          placeholder="Search users..."
          onSearch={handleSearch}
          className="w-full"
        />
      </div>

      {/* Trending Section */}
      {!searchQuery && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Trending Topics</h2>
          <div className="flex flex-wrap gap-2">
            {[
              '#DigitalArt', '#Travel', '#FitnessMotivation', '#BookLovers',
              '#KoreanFusion', '#Nature', '#Music', '#Watercolor'
            ].map((tag) => (
              <div
                key={tag}
                className="px-3 py-1.5 bg-gradient-to-r from-primary to-secondary text-white rounded-full text-sm font-medium cursor-pointer hover:shadow-lg transition-all duration-200"
              >
                {tag}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results Section */}
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          {searchQuery ? `Search Results for "${searchQuery}"` : 'Suggested Users'}
        </h2>
      </div>

      {loading && !isSearching ? (
        <Loading type="users" />
      ) : error ? (
        <Error message={error} onRetry={fetchSuggestedUsers} />
      ) : isSearching ? (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center space-x-2 text-gray-500">
            <ApperIcon name="Search" size={20} className="animate-spin" />
            <span>Searching...</span>
          </div>
        </div>
      ) : showEmpty ? (
        <Empty
          icon="Users"
          title={searchQuery ? 'No users found' : 'No suggested users'}
          description={
            searchQuery 
              ? 'Try searching with different keywords or usernames.'
              : 'Check back later for new user suggestions!'
          }
          actionLabel="Clear Search"
          onAction={() => {
            setSearchQuery('');
            setSearchResults([]);
          }}
        />
      ) : (
        <div className="space-y-3">
          {displayUsers.map((user) => (
            <UserCard
              key={user.Id}
              user={user}
              onFollow={handleFollow}
              onUnfollow={handleUnfollow}
              isFollowing={followedUsers.has(user.Id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Explore;