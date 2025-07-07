import React from 'react';
import { cn } from '@/utils/cn';

const Avatar = ({ 
  src, 
  alt, 
  size = 'md', 
  className,
  hasStory = false,
  ...props 
}) => {
  const sizes = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
    '2xl': 'w-20 h-20'
  };

  return (
    <div className={cn(
      'relative flex-shrink-0',
      hasStory && 'p-0.5 bg-gradient-to-r from-primary via-secondary to-accent rounded-full',
      className
    )}>
      <img
        src={src}
        alt={alt}
        className={cn(
          'rounded-full object-cover',
          sizes[size],
          hasStory && 'border-2 border-white'
        )}
        {...props}
      />
    </div>
  );
};

export default Avatar;