import React, { forwardRef } from 'react';
import { cn } from '@/utils/cn';

const Button = forwardRef(({ 
  className, 
  variant = 'primary', 
  size = 'md', 
  children, 
  ...props 
}, ref) => {
  const variants = {
    primary: 'btn-gradient text-white font-medium hover:shadow-lg',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 font-medium',
    ghost: 'text-gray-700 hover:bg-gray-100 font-medium',
    outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white font-medium',
    danger: 'bg-red-500 text-white hover:bg-red-600 font-medium',
    link: 'text-primary hover:underline font-medium'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm rounded-lg',
    md: 'px-4 py-2 text-sm rounded-lg',
    lg: 'px-6 py-3 text-base rounded-xl',
    icon: 'p-2 rounded-lg'
  };

  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center transition-all duration-200',
        'focus-ring disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;