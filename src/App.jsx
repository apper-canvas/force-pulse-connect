import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import NavBar from '@/components/organisms/NavBar';
import Home from '@/components/pages/Home';
import Explore from '@/components/pages/Explore';
import Notifications from '@/components/pages/Notifications';
import Profile from '@/components/pages/Profile';
import CreatePostModal from '@/components/organisms/CreatePostModal';
import { useNotifications } from '@/hooks/useNotifications';
import userService from '@/services/api/userService';
import postService from '@/services/api/postService';

function App() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const { unreadCount } = useNotifications();

  React.useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const user = await userService.getCurrentUser();
        setCurrentUser(user);
      } catch (error) {
        console.error('Failed to fetch current user:', error);
      }
    };

    fetchCurrentUser();
  }, []);

  const handleCreatePost = async (postData) => {
    try {
      await postService.create(postData);
      setIsCreateModalOpen(false);
      // Refresh the current page to show new post
      window.location.reload();
    } catch (error) {
      console.error('Failed to create post:', error);
    }
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <NavBar 
          onCreatePost={() => setIsCreateModalOpen(true)}
          notificationCount={unreadCount}
        />
        
        <main className="pt-4 md:pt-0">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>

        <CreatePostModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreatePost}
          currentUser={currentUser}
        />

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
    </Router>
  );
}

export default App;