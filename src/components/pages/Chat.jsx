import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Avatar from '@/components/atoms/Avatar';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Badge from '@/components/atoms/Badge';
import ApperIcon from '@/components/ApperIcon';
import { cn } from '@/utils/cn';
import chatService from '@/services/api/chatService';
import userService from '@/services/api/userService';
import { toast } from 'react-toastify';

const Chat = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [onlineUsers, setOnlineUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const initializeChat = async () => {
      try {
        setLoading(true);
        const user = await userService.getCurrentUser();
        setCurrentUser(user);
        
        if (user) {
          const mutualFollowers = await userService.getMutualFollowers(user.Id);
          const userIds = mutualFollowers.map(u => u.Id);
          const onlineStatuses = await userService.getMultipleOnlineStatus(userIds);
          
          setOnlineUsers(onlineStatuses);
          
          // Create conversation objects
          const convos = mutualFollowers.map(follower => ({
            Id: follower.Id,
            user: follower,
            lastMessage: null,
            unreadCount: 0,
            isOnline: onlineStatuses[follower.Id] || false
          }));
          
          setConversations(convos);
          
          // Load messages for all conversations
          const allMessages = await chatService.getAllMessages(user.Id);
          
          // Update conversations with last messages
          const updatedConvos = convos.map(convo => {
            const convoMessages = allMessages.filter(msg => 
              (msg.sender_id === user.Id && msg.receiver_id === convo.Id) ||
              (msg.sender_id === convo.Id && msg.receiver_id === user.Id)
            );
            
            const lastMessage = convoMessages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
            const unreadCount = convoMessages.filter(msg => 
              msg.sender_id === convo.Id && !msg.is_read
            ).length;
            
            return {
              ...convo,
              lastMessage,
              unreadCount
            };
          });
          
          setConversations(updatedConvos);
        }
      } catch (error) {
        console.error('Failed to initialize chat:', error);
        toast.error('Failed to load chat');
      } finally {
        setLoading(false);
      }
    };

    initializeChat();
  }, []);

  // Real-time updates simulation
  useEffect(() => {
    const interval = setInterval(async () => {
      if (currentUser) {
        // Update online status
        const userIds = conversations.map(c => c.Id);
        if (userIds.length > 0) {
          const statuses = await userService.getMultipleOnlineStatus(userIds);
          setOnlineUsers(statuses);
        }

        // Check for new messages
        if (activeConversation) {
          const newMessages = await chatService.getMessages(currentUser.Id, activeConversation.Id);
          setMessages(newMessages);
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [currentUser, conversations, activeConversation]);

  const handleConversationClick = async (conversation) => {
    setActiveConversation(conversation);
    
    try {
      const conversationMessages = await chatService.getMessages(currentUser.Id, conversation.Id);
      setMessages(conversationMessages);
      
      // Mark messages as read
      await chatService.markMessagesAsRead(currentUser.Id, conversation.Id);
      
      // Update conversation unread count
      setConversations(prev => 
        prev.map(c => 
          c.Id === conversation.Id 
            ? { ...c, unreadCount: 0 }
            : c
        )
      );
    } catch (error) {
      console.error('Failed to load messages:', error);
      toast.error('Failed to load messages');
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeConversation) return;

    try {
      const messageData = {
        senderId: currentUser.Id,
        receiverId: activeConversation.Id,
        content: newMessage.trim(),
        timestamp: new Date().toISOString()
      };

      const sentMessage = await chatService.sendMessage(messageData);
      if (sentMessage) {
        setMessages(prev => [...prev, sentMessage]);
        setNewMessage('');
        
        // Update conversation last message
        setConversations(prev => 
          prev.map(c => 
            c.Id === activeConversation.Id 
              ? { ...c, lastMessage: sentMessage }
              : c
          )
        );
        
        toast.success('Message sent!');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatLastMessageTime = (timestamp) => {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInHours = (now - messageTime) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return messageTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return messageTime.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex h-[calc(100vh-8rem)] bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          
          {/* Conversations Sidebar */}
          <div className="w-full md:w-1/3 lg:w-1/4 border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-bold text-gray-900">Messages</h1>
                <Button variant="ghost" size="icon" onClick={() => navigate('/explore')}>
                  <ApperIcon name="UserPlus" size={20} />
                </Button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <ApperIcon name="MessageCircle" size={48} className="mx-auto mb-2 text-gray-300" />
                  <p>No conversations yet</p>
                  <p className="text-sm">Start following people to chat!</p>
                </div>
              ) : (
                conversations.map((conversation) => (
                  <div
                    key={conversation.Id}
                    onClick={() => handleConversationClick(conversation)}
                    className={cn(
                      'flex items-center p-4 cursor-pointer hover:bg-gray-50 transition-colors',
                      activeConversation?.Id === conversation.Id && 'bg-primary bg-opacity-10'
                    )}
                  >
                    <div className="relative">
                      <Avatar
                        src={conversation.user.avatar}
                        alt={conversation.user.display_name}
                        size="md"
                      />
                      {onlineUsers[conversation.Id] && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    
                    <div className="flex-1 ml-3 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {conversation.user.display_name}
                        </h3>
                        {conversation.lastMessage && (
                          <span className="text-xs text-gray-500">
                            {formatLastMessageTime(conversation.lastMessage.timestamp)}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-sm text-gray-500 truncate">
                          {conversation.lastMessage 
                            ? conversation.lastMessage.content
                            : 'Start a conversation...'
                          }
                        </p>
                        {conversation.unreadCount > 0 && (
                          <Badge className="bg-primary text-white text-xs min-w-[20px] h-5 flex items-center justify-center">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {activeConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-100 bg-white">
                  <div className="flex items-center">
                    <div className="relative">
                      <Avatar
                        src={activeConversation.user.avatar}
                        alt={activeConversation.user.display_name}
                        size="md"
                      />
                      {onlineUsers[activeConversation.Id] && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div className="ml-3">
                      <h2 className="font-semibold text-gray-900">
                        {activeConversation.user.display_name}
                      </h2>
                      <p className="text-sm text-gray-500">
                        {onlineUsers[activeConversation.Id] ? 'Online' : 'Offline'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => {
                    const isCurrentUser = message.sender_id === currentUser.Id;
                    return (
                      <div
                        key={message.Id}
                        className={cn(
                          'flex',
                          isCurrentUser ? 'justify-end' : 'justify-start'
                        )}
                      >
                        <div
                          className={cn(
                            'max-w-xs lg:max-w-md px-4 py-2 rounded-2xl',
                            isCurrentUser
                              ? 'bg-primary text-white'
                              : 'bg-gray-100 text-gray-900'
                          )}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className={cn(
                            'text-xs mt-1',
                            isCurrentUser ? 'text-purple-100' : 'text-gray-500'
                          )}>
                            {formatTime(message.timestamp)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-100 bg-white">
                  <div className="flex items-center space-x-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type a message..."
                      className="flex-1"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      size="icon"
                      className="shrink-0"
                    >
                      <ApperIcon name="Send" size={20} />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <ApperIcon name="MessageCircle" size={64} className="mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                  <p className="text-gray-500">Choose a conversation to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;