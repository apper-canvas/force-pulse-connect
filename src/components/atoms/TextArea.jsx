import React, { forwardRef } from 'react';
import { cn } from '@/utils/cn';

const TextArea = forwardRef(({ 
  className, 
  ...props 
}, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        'custom-input w-full resize-none',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  );
});

TextArea.displayName = 'TextArea';

export default TextArea;