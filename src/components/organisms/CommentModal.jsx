import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { formatDistanceToNow } from 'date-fns';
import Button from '@/components/atoms/Button';
import Avatar from '@/components/atoms/Avatar';
import TextArea from '@/components/atoms/TextArea';
import ApperIcon from '@/components/ApperIcon';
import Loading from '@/components/ui/Loading';
import { cn } from '@/utils/cn';
import postService from '@/services/api/postService';
import userService from '@/services/api/userService';

const CommentModal = ({ 
  isOpen, 
  onClose, 
  post, 
  currentUser,
  onCommentAdded 
}) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (isOpen && post) {
      fetchComments();
      fetchUsers();
    }
  }, [isOpen, post]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const commentsData = await postService.getComments(post.Id);
      setComments(commentsData);
    } catch (error) {
      toast.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const usersData = await userService.getAll();
      setUsers(usersData);
    } catch (error) {
      console.error('Failed to load users');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    if (!currentUser) {
      toast.error('Please log in to comment');
      return;
    }

    try {
      setSubmitting(true);
      const commentData = {
        userId: currentUser.Id,
        content: newComment.trim()
      };

      await postService.addComment(post.Id, commentData);
      
      // Refresh comments
      await fetchComments();
      
      // Clear form
      setNewComment('');
      
      // Notify parent component
      if (onCommentAdded) {
        onCommentAdded(post.Id);
      }
      
      toast.success('Comment added successfully!');
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const getUserById = (userId) => {
    return users.find(user => user.Id === userId);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <ApperIcon name="MessageCircle" size={24} className="text-blue-500" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Comments</h2>
              <p className="text-sm text-gray-500">
                {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full hover:bg-gray-100"
          >
            <ApperIcon name="X" size={20} />
          </Button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loading type="spinner" />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8">
              <ApperIcon name="MessageCircle" size={48} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">No comments yet</p>
              <p className="text-gray-400 text-sm mt-1">Be the first to share your thoughts!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => {
                const user = getUserById(comment.userId);
                return (
                  <div key={comment.Id} className="flex gap-3">
                    <Avatar
                      src={user?.avatar}
                      alt={user?.name || 'User'}
                      size="sm"
                      className="flex-shrink-0"
                    />
                    <div className="flex-1">
                      <div className="bg-gray-50 rounded-2xl px-4 py-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900">
                            {user?.name || 'Unknown User'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(comment.timestamp), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Comment Form */}
        <div className="p-6 border-t border-gray-100">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <Avatar
              src={currentUser?.avatar}
              alt={currentUser?.name || 'You'}
              size="sm"
              className="flex-shrink-0"
            />
            <div className="flex-1">
              <TextArea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                rows={2}
                className="resize-none border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={submitting}
              />
              <div className="flex justify-between items-center mt-3">
                <span className="text-xs text-gray-400">
                  {newComment.length}/500 characters
                </span>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!newComment.trim() || submitting || newComment.length > 500}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    {submitting ? (
                      <>
                        <ApperIcon name="Loader2" size={16} className="animate-spin mr-2" />
                        Posting...
                      </>
                    ) : (
                      <>
                        <ApperIcon name="Send" size={16} className="mr-2" />
                        Post
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CommentModal;