import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import Avatar from "@/components/atoms/Avatar";
import Button from "@/components/atoms/Button";
import TextArea from "@/components/atoms/TextArea";
import Loading from "@/components/ui/Loading";
import userService from "@/services/api/userService";
import postService from "@/services/api/postService";

const CommentModal = ({ isOpen, onClose, post }) => {
  const [comments, setComments] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Memoized unique comments to prevent duplicate key issues
  const uniqueComments = useMemo(() => {
    if (!Array.isArray(comments)) return []
    
    // Create a Map to track unique comments by ID
    const uniqueMap = new Map()
    
    comments.forEach((comment, index) => {
      if (!comment || typeof comment !== 'object') return
      
      // Generate unique identifier with multiple fallback strategies
      const id = comment.id || comment._id || `comment-${index}-${Date.now()}`
      
      // Only add if not already in map (first occurrence wins)
      if (!uniqueMap.has(id)) {
        uniqueMap.set(id, {
          ...comment,
          id, // Ensure consistent ID
          createdAt: comment.createdAt || new Date().toISOString(),
          content: comment.content || '',
          userId: comment.userId || 1
        })
      }
    })
    
    return Array.from(uniqueMap.values())
  }, [comments])

  useEffect(() => {
    if (isOpen && post) {
      fetchComments()
      fetchUsers()
    }
  }, [isOpen, post])

  const fetchComments = async () => {
    if (!post?.id) {
      console.error('Post ID is missing')
      return
    }

    try {
      setLoading(true)
      const commentsData = await postService.getComments(post.id)
      
      // Validate and sanitize comments data
      const sanitizedComments = Array.isArray(commentsData) ? commentsData : []
      setComments(sanitizedComments)
    } catch (error) {
      console.error('Failed to load comments:', error)
      toast.error('Failed to load comments')
      setComments([]) // Set empty array on error
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const usersData = await userService.getAll()
      setUsers(Array.isArray(usersData) ? usersData : [])
    } catch (error) {
      console.error('Failed to load users:', error)
      setUsers([]) // Set empty array on error
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!newComment.trim() || !post?.id) return

    try {
      setIsSubmitting(true)
      const commentData = {
        userId: 1,
        content: newComment.trim(),
        createdAt: new Date().toISOString()
      }
      
      await postService.addComment(post.id, commentData)
      setNewComment('')
      await fetchComments()
      toast.success('Comment added successfully!')
    } catch (error) {
      console.error('Failed to add comment:', error)
      toast.error('Failed to add comment')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const getUserById = (userId) => {
    if (!Array.isArray(users) || !userId) return null
    return users.find(user => user?.id === userId)
  }

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={handleOverlayClick}>
      <div className="bg-white rounded-2xl w-full max-w-md comment-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold">Comments</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close comments"
          >
            <ApperIcon name="X" size={20} />
          </button>
        </div>

        {/* Comments List */}
        <div className="comment-list max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loading size="md" />
            </div>
          ) : uniqueComments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
              <ApperIcon name="MessageCircle" size={48} className="mb-2 opacity-50" />
              <p>No comments yet</p>
              <p className="text-sm">Be the first to comment!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {uniqueComments.map((comment) => {
                const user = getUserById(comment.userId)
                // Generate unique key with multiple fallback strategies
                const uniqueKey = `comment-${comment.id}-${comment.createdAt}-${comment.userId}`
                
                return (
                  <div key={uniqueKey} className="flex items-start space-x-3">
                    <div className="comment-avatar">
                      <Avatar
                        src={user?.avatar}
                        alt={user?.name || 'Unknown User'}
                        size="sm"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="comment-bubble">
                        <div className="comment-meta">
                          <span className="comment-author">{user?.name || 'Unknown User'}</span>
                          <span className="comment-time">
                            {comment.createdAt ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true }) : 'Just now'}
                          </span>
                        </div>
                        <div className="comment-content text-sm text-gray-700">
                          {comment.content || 'No content'}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Comment Form */}
        <div className="comment-form">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex space-x-3">
              <div className="flex-shrink-0">
                <Avatar
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e"
                  alt="You"
                  size="sm"
                />
              </div>
              <div className="flex-1">
                <TextArea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Write a comment..."
                  className="comment-textarea resize-none"
                  rows={2}
                  maxLength={500}
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="comment-char-count">
                    {newComment.length}/500
                  </span>
                  <Button
                    type="submit"
                    disabled={!newComment.trim() || isSubmitting}
                    className="comment-submit-btn"
                    size="sm"
                  >
                    {isSubmitting ? (
                      <>
                        <Loading size="xs" />
                        <span>Posting...</span>
                      </>
                    ) : (
                      <>
                        <ApperIcon name="Send" size={16} />
                        <span>Post</span>
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
  )
}

export default CommentModal