import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import Button from '@/components/atoms/Button';
import ApperIcon from '@/components/ApperIcon';
import { cn } from '@/utils/cn';

const NavBar = ({ 
  onCreatePost, 
  notificationCount = 0,
  className 
}) => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', icon: 'Home', label: 'Home' },
    { path: '/explore', icon: 'Search', label: 'Explore' },
    { path: '/notifications', icon: 'Bell', label: 'Notifications' },
    { path: '/profile', icon: 'User', label: 'Profile' }
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <nav className={cn(
        'hidden md:flex items-center justify-between p-4 bg-white border-b border-gray-200',
        className
      )}>
        <div className="flex items-center space-x-8">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
              <ApperIcon name="Zap" size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">Pulse Connect</span>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => cn(
                  'flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200',
                  'hover:bg-gray-100 font-medium',
                  isActive ? 'text-primary bg-primary bg-opacity-10' : 'text-gray-700'
                )}
              >
                <div className="relative">
                  <ApperIcon name={item.icon} size={20} />
                  {item.icon === 'Bell' && notificationCount > 0 && (
                    <span className="notification-dot" />
                  )}
                </div>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </div>

        {/* Create Post Button */}
        <Button onClick={onCreatePost} className="px-6">
          <ApperIcon name="Plus" size={16} className="mr-2" />
          Create Post
        </Button>
      </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 mobile-nav z-40">
        <div className="flex items-center justify-around p-3">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                'flex flex-col items-center space-y-1 p-2 rounded-lg transition-all duration-200',
                isActive ? 'text-primary' : 'text-gray-500'
              )}
            >
              <div className="relative">
                <ApperIcon name={item.icon} size={20} />
                {item.icon === 'Bell' && notificationCount > 0 && (
                  <span className="notification-dot" />
                )}
              </div>
              <span className="text-xs font-medium">{item.label}</span>
            </NavLink>
          ))}
        </div>

        {/* Floating Create Button */}
        <Button
          onClick={onCreatePost}
          className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full shadow-lg"
          size="icon"
        >
          <ApperIcon name="Plus" size={24} />
        </Button>
      </nav>
    </>
  );
};

export default NavBar;