import React, { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { useSwipeable } from "react-swipeable";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import Avatar from "@/components/atoms/Avatar";
import Button from "@/components/atoms/Button";
import PostActions from "@/components/molecules/PostActions";

// Image Gallery Component
const ImageGallery = ({ images = [], onImageClick, className }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageStates, setImageStates] = useState({});

  const hasMultipleImages = images.length > 1;

  const updateImageState = (index, state) => {
    setImageStates(prev => ({
      ...prev,
      [index]: { ...prev[index], ...state }
    }));
  };

  const getImageState = (index) => {
    return imageStates[index] || { loading: true, error: false, retryCount: 0 };
  };

  const handleImageLoad = (index) => {
    updateImageState(index, { loading: false, error: false });
  };

  const handleImageError = (index) => {
    const state = getImageState(index);
    if (state.retryCount < 2) {
      updateImageState(index, { 
        retryCount: state.retryCount + 1, 
        loading: true, 
        error: false 
      });
    } else {
      updateImageState(index, { loading: false, error: true });
    }
  };

  const getImageUrl = (image, index) => {
    const state = getImageState(index);
    if (state.error) {
      return `https://picsum.photos/500/500?random=fallback-${index}`;
    }
    if (state.retryCount > 0) {
      return `https://picsum.photos/500/500?random=retry-${index}-${state.retryCount}`;
    }
    return image || `https://picsum.photos/500/500?random=${index}`;
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToImage = (index) => {
    setCurrentIndex(index);
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: goToNext,
    onSwipedRight: goToPrevious,
    trackMouse: true,
    preventScrollOnSwipe: true,
    delta: 50
  });

  if (!images.length) return null;

  return (
    <div className={cn("image-gallery", className)}>
      <div className="gallery-container relative" {...swipeHandlers}>
        <div className="gallery-viewport overflow-hidden rounded-2xl bg-gray-100 relative">
          <div 
            className="gallery-track flex transition-transform duration-300 ease-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {images.map((image, index) => {
              const state = getImageState(index);
              return (
                <div key={index} className="gallery-slide flex-shrink-0 w-full relative">
                  {state.loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  )}
                  <img
                    src={getImageUrl(image, index)}
                    alt={`Post content ${index + 1}`}
                    className={cn(
                      "w-full h-auto object-cover cursor-pointer transition-all duration-300",
                      state.loading ? "opacity-0" : "opacity-100 hover:scale-105",
                      state.error ? "filter grayscale" : ""
                    )}
                    loading="lazy"
                    onLoad={() => handleImageLoad(index)}
                    onError={() => handleImageError(index)}
                    onClick={() => onImageClick?.(index)}
                  />
                  {state.error && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                      <div className="text-center text-gray-500">
                        <ApperIcon name="ImageOff" className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-sm">Image unavailable</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {hasMultipleImages && (
            <>
              <button
                onClick={goToPrevious}
                className="gallery-nav gallery-nav-left absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all duration-200 opacity-0 group-hover:opacity-100 z-20"
              >
                <ApperIcon name="ChevronLeft" size={20} />
              </button>
              <button
                onClick={goToNext}
                className="gallery-nav gallery-nav-right absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all duration-200 opacity-0 group-hover:opacity-100 z-20"
              >
                <ApperIcon name="ChevronRight" size={20} />
              </button>
            </>
          )}
        </div>

        {hasMultipleImages && (
          <div className="gallery-controls mt-3 flex items-center justify-between">
            <div className="gallery-dots flex items-center gap-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToImage(index)}
                  className={cn(
                    "gallery-dot w-2 h-2 rounded-full transition-all duration-200",
                    index === currentIndex 
                      ? "bg-primary scale-125" 
                      : "bg-gray-300 hover:bg-gray-400"
                  )}
                />
              ))}
            </div>
            <div className="gallery-counter text-sm text-gray-500">
              {currentIndex + 1} / {images.length}
            </div>
          </div>
        )}

        {hasMultipleImages && (
          <div className="gallery-thumbnails mt-3 flex gap-2 overflow-x-auto pb-2">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => goToImage(index)}
                className={cn(
                  "gallery-thumbnail flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200",
                  index === currentIndex 
                    ? "border-primary" 
                    : "border-gray-200 hover:border-gray-300"
                )}
              >
                <img
                  src={getImageUrl(image, index)}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Gallery Modal Component
const GalleryModal = ({ images, initialIndex, isOpen, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  React.useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: goToNext,
    onSwipedRight: goToPrevious,
    trackMouse: true,
    preventScrollOnSwipe: true,
    delta: 50
  });

  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') goToPrevious();
      if (e.key === 'ArrowRight') goToNext();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="gallery-modal fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <div className="gallery-modal-content relative max-w-4xl max-h-full w-full h-full flex items-center justify-center" {...swipeHandlers}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all duration-200 z-30"
        >
          <ApperIcon name="X" size={24} />
        </button>
        
        <img
          src={images[currentIndex]}
          alt={`Gallery image ${currentIndex + 1}`}
          className="max-w-full max-h-full object-contain"
        />
        
        {images.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 transition-all duration-200 z-30"
            >
              <ApperIcon name="ChevronLeft" size={24} />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 transition-all duration-200 z-30"
            >
              <ApperIcon name="ChevronRight" size={24} />
            </button>
            
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              {currentIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
function PostCard({ post, user, onLike, onComment, onShare, className }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [galleryModalOpen, setGalleryModalOpen] = useState(false)
  const [galleryModalIndex, setGalleryModalIndex] = useState(0)
  if (!post || !user) {
    return null
  }

const handleGalleryClick = (index) => {
    setGalleryModalIndex(index);
    setGalleryModalOpen(true);
  };

  const closeGalleryModal = () => {
    setGalleryModalOpen(false);
  };

  // Get images array from post
  const getPostImages = () => {
    if (post.images && Array.isArray(post.images)) {
      return post.images;
    }
    if (post.imageUrl) {
      return [post.imageUrl];
    }
    return [];
  };

  const postImages = getPostImages();

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
    onComment?.(post?.id);
  };

  const isLiked = post?.likes?.some(like => like.userId === user?.id) || false;
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
            <div className="flex items-center gap-2">
              <ApperIcon 
                name="Clock" 
                size="sm" 
                className="text-gray-500" 
              />
              <span className="text-sm text-gray-500">
                {(() => {
                  try {
                    if (!post?.createdAt) return "Unknown time";
                    const date = new Date(post.createdAt);
                    if (isNaN(date.getTime())) return "Unknown time";
                    return formatDistanceToNow(date, { addSuffix: true });
                  } catch (error) {
                    console.warn('Date formatting error:', error);
                    return "Unknown time";
                  }
                })()}
              </span>
            </div>
          </div>
        </div>
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

{/* Post Images Gallery */}
      {postImages.length > 0 && (
        <div className="mb-4 group">
          <ImageGallery
            images={postImages}
            onImageClick={handleGalleryClick}
          />
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

      {/* Gallery Modal */}
      {galleryModalOpen && (
        <GalleryModal
          images={postImages}
          initialIndex={galleryModalIndex}
          isOpen={galleryModalOpen}
          onClose={closeGalleryModal}
        />
      )}
    </div>
  );
};

export default PostCard;