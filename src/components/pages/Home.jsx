import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useLocation, useNavigate } from 'react-router-dom';
import PostCard from '@/components/organisms/PostCard';
import CreatePostModal from '@/components/organisms/CreatePostModal';
import CommentModal from '@/components/organisms/CommentModal';
import TrendingHashtags from '@/components/organisms/TrendingHashtags';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import postService from '@/services/api/postService';
import userService from '@/services/api/userService';
const Home = () => {
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [highlightedPostId, setHighlightedPostId] = useState(null);
  
  const location = useLocation();
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [postsData, usersData, currentUserData] = await Promise.all([
        postService.getAll(),
        userService.getAll(),
        userService.getCurrentUser()
      ]);
      
      setPosts(postsData);
      setUsers(usersData);
      setCurrentUser(currentUserData);
    } catch (err) {
      setError(err.message || 'Failed to load content');
    } finally {
      setLoading(false);
    }
  };
useEffect(() => {
    fetchData();
  }, []);

  // Handle postId parameter from notification navigation
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const postId = urlParams.get('postId');
    
    if (postId) {
      const postIdNumber = parseInt(postId, 10);
      if (!isNaN(postIdNumber)) {
        setHighlightedPostId(postIdNumber);
        
        // Scroll to the post after a brief delay to ensure posts are rendered
        setTimeout(() => {
          const postElement = document.getElementById(`post-${postIdNumber}`);
          if (postElement) {
            postElement.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center' 
            });
          }
        }, 100);
        
        // Remove highlight after 3 seconds
        setTimeout(() => {
          setHighlightedPostId(null);
        }, 3000);
        
        // Clean up URL parameter
        navigate(location.pathname, { replace: true });
      }
    }
  }, [location.search, navigate, location.pathname]);

  const handleLike = async (postId) => {
    try {
      const isLiked = likedPosts.has(postId);
      
      if (isLiked) {
        await postService.unlikePost(postId, currentUser.Id);
        setLikedPosts(prev => {
          const newSet = new Set(prev);
          newSet.delete(postId);
          return newSet;
        });
      } else {
        await postService.likePost(postId, currentUser.Id);
        setLikedPosts(prev => new Set(prev).add(postId));
      }

      // Update the post in the posts array
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.Id === postId 
            ? {
                ...post,
                likes: isLiked 
                  ? post.likes.filter(id => id !== currentUser.Id)
                  : [...post.likes, currentUser.Id]
              }
            : post
        )
      );
    } catch (err) {
      toast.error('Failed to update like');
    }
  };

const handleComment = (postId) => {
    const post = posts.find(p => p.Id === postId);
    if (post) {
      setSelectedPost(post);
      setIsCommentModalOpen(true);
    }
  };

  const handleCommentAdded = (postId) => {
    // Update the post's comment count in the posts array
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.Id === postId
          ? { ...post, comments: [...(post.comments || []), { id: Date.now() }] }
          : post
      )
    );
  };

  const handleShare = (postId) => {
    // In a real app, this would open a share modal
    toast.success('Post shared successfully!');
  };

  const handleCreatePost = async (postData) => {
    try {
      const newPost = await postService.create(postData);
      setPosts(prevPosts => [newPost, ...prevPosts]);
      toast.success('Post created successfully!');
    } catch (err) {
      toast.error('Failed to create post');
    }
  };

  const getUserById = (userId) => {
    return users.find(user => user.Id === userId);
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <Loading type="posts" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <Error message={error} onRetry={fetchData} />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <Empty
          icon="MessageSquare"
          title="No posts yet"
          description="Be the first to share something amazing with the community!"
          actionLabel="Create Your First Post"
          onAction={() => setIsCreateModalOpen(true)}
        />
      </div>
    );
  }

return (
    <div className="max-w-6xl mx-auto p-4 pb-20 md:pb-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
      <div className="space-y-4">
        {posts.map((post) => {
          const user = getUserById(post.userId);
          const isLiked = likedPosts.has(post.Id) || post.likes.includes(currentUser?.Id);
          const isHighlighted = highlightedPostId === post.Id;
          
          return (
            <div
              key={post.Id}
              id={`post-${post.Id}`}
              className={`transition-all duration-300 ${
                isHighlighted ? 'ring-2 ring-blue-500 ring-opacity-50 shadow-lg' : ''
              }`}
            >
              <PostCard
                post={post}
                user={user}
                onLike={handleLike}
                onComment={handleComment}
                onShare={handleShare}
                isLiked={isLiked}
              />
            </div>
          );
})}
        </div>
        
<CreatePostModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreatePost}
          currentUser={currentUser}
        />
        
        <CommentModal
          isOpen={isCommentModalOpen}
          onClose={() => {
            setIsCommentModalOpen(false);
            setSelectedPost(null);
          }}
          post={selectedPost}
          currentUser={currentUser}
          onCommentAdded={handleCommentAdded}
        />
      </div>
      
      {/* Sidebar */}
      <div className="lg:col-span-1">
        <div className="sticky top-4 space-y-4">
          <TrendingHashtags limit={8} />
        </div>
      </div>
    </div>
  </div>
  );
};

export default Home;