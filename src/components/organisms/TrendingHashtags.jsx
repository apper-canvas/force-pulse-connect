import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import hashtagService from '@/services/api/hashtagService';

const TrendingHashtags = ({ limit = 8, className = '' }) => {
  const [hashtags, setHashtags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTrendingHashtags = async () => {
    try {
      setLoading(true);
      setError(null);
      const trendingData = await hashtagService.getTrending(limit);
      setHashtags(trendingData);
    } catch (err) {
      setError(err.message || 'Failed to load trending hashtags');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrendingHashtags();
  }, [limit]);

  const handleHashtagClick = (hashtagName) => {
    // Future implementation: navigate to hashtag search results
    toast.info(`Searching for #${hashtagName}...`);
  };

  const handleRefresh = () => {
    hashtagService.clearCache();
    fetchTrendingHashtags();
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-4 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Trending Hashtags</h3>
          <ApperIcon name="TrendingUp" size={20} className="text-primary" />
        </div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
              <div className="h-3 bg-gray-200 rounded animate-pulse w-8"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-4 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Trending Hashtags</h3>
          <button
            onClick={handleRefresh}
            className="text-primary hover:text-primary/80 transition-colors"
          >
            <ApperIcon name="RefreshCw" size={16} />
          </button>
        </div>
        <Error message={error} onRetry={fetchTrendingHashtags} />
      </div>
    );
  }

  if (hashtags.length === 0) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-4 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Trending Hashtags</h3>
          <ApperIcon name="TrendingUp" size={20} className="text-gray-400" />
        </div>
        <div className="text-center py-4">
          <ApperIcon name="Hash" size={32} className="text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">No trending hashtags yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover-lift transition-all duration-200 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Trending Hashtags</h3>
        <div className="flex items-center space-x-2">
          <ApperIcon name="TrendingUp" size={20} className="text-primary" />
          <button
            onClick={handleRefresh}
            className="text-gray-400 hover:text-primary transition-colors p-1 rounded-full hover:bg-gray-50"
            title="Refresh hashtags"
          >
            <ApperIcon name="RefreshCw" size={14} />
          </button>
        </div>
      </div>
      
      <div className="space-y-2">
        {hashtags.map((hashtag, index) => (
          <div
            key={hashtag.Id}
            onClick={() => handleHashtagClick(hashtag.name)}
            className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group"
          >
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-6 h-6 bg-gradient-to-r from-primary to-secondary rounded-full text-white text-xs font-medium">
                {index + 1}
              </div>
              <div className="flex items-center space-x-1">
                <ApperIcon name="Hash" size={14} className="text-gray-400" />
                <span className="font-medium text-gray-900 group-hover:text-primary transition-colors">
                  {hashtag.name}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                {hashtag.count} post{hashtag.count !== 1 ? 's' : ''}
              </span>
              <ApperIcon 
                name="ChevronRight" 
                size={12} 
                className="text-gray-400 group-hover:text-primary transition-colors" 
              />
            </div>
          </div>
        ))}
      </div>
      
      {hashtags.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-100">
          <button
            onClick={handleRefresh}
            className="w-full text-sm text-primary hover:text-primary/80 font-medium transition-colors text-center"
          >
            Refresh trends
          </button>
        </div>
      )}
    </div>
  );
};

export default TrendingHashtags;