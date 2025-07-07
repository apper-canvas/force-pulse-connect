import React, { useState } from 'react';
import Button from '@/components/atoms/Button';
import TextArea from '@/components/atoms/TextArea';
import Avatar from '@/components/atoms/Avatar';
import ApperIcon from '@/components/ApperIcon';
import { cn } from '@/utils/cn';

const CreatePostModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  currentUser,
  className 
}) => {
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    onSubmit?.({
      content: content.trim(),
      imageUrl: imagePreview // In a real app, this would be uploaded to a server
    });

    // Reset form
    setContent('');
    setImage(null);
    setImagePreview(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={cn(
        'bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto',
        className
      )}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Create Post</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <ApperIcon name="X" size={20} />
            </Button>
          </div>

          {/* User Info */}
          <div className="flex items-center space-x-3 mb-4">
            <Avatar
              src={currentUser?.avatar}
              alt={currentUser?.displayName}
              size="md"
            />
            <div>
              <h3 className="font-semibold text-gray-900">{currentUser?.displayName}</h3>
              <p className="text-sm text-gray-500">@{currentUser?.username}</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <TextArea
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="border-none resize-none text-lg placeholder-gray-400"
              maxLength={280}
            />

            {/* Character Count */}
            <div className="flex justify-between items-center">
              <span className={cn(
                'text-sm',
                content.length > 250 ? 'text-red-500' : 'text-gray-500'
              )}>
                {content.length}/280
              </span>
            </div>

            {/* Image Preview */}
            {imagePreview && (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-64 object-cover rounded-xl"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setImage(null);
                    setImagePreview(null);
                  }}
                  className="absolute top-2 right-2 bg-black bg-opacity-50 text-white hover:bg-opacity-70"
                >
                  <ApperIcon name="X" size={16} />
                </Button>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center space-x-2">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-primary hover:bg-primary hover:bg-opacity-10"
                  >
                    <ApperIcon name="Image" size={20} />
                  </Button>
                </label>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-primary hover:bg-primary hover:bg-opacity-10"
                >
                  <ApperIcon name="Smile" size={20} />
                </Button>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!content.trim()}
                  className="disabled:opacity-50"
                >
                  Post
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePostModal;