import messagesData from '@/services/mockData/messages.json';

class ChatService {
  constructor() {
    this.messages = [...messagesData];
    this.nextId = Math.max(...this.messages.map(m => m.Id), 0) + 1;
  }

  // Simulate API delay
  delay(ms = 300) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getAllMessages(userId) {
    await this.delay();
    return this.messages.filter(msg => 
      msg.senderId === userId || msg.receiverId === userId
    );
  }

  async getMessages(userId, otherUserId) {
    await this.delay();
    return this.messages
      .filter(msg => 
        (msg.senderId === userId && msg.receiverId === otherUserId) ||
        (msg.senderId === otherUserId && msg.receiverId === userId)
      )
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  }

  async sendMessage(messageData) {
    await this.delay();
    const newMessage = {
      Id: this.nextId++,
      ...messageData,
      isRead: false,
      timestamp: new Date().toISOString()
    };
    
    this.messages.push(newMessage);
    return newMessage;
  }

  async markMessagesAsRead(userId, otherUserId) {
    await this.delay();
    this.messages = this.messages.map(msg => 
      msg.senderId === otherUserId && msg.receiverId === userId
        ? { ...msg, isRead: true }
        : msg
    );
    return { success: true };
  }

  async getUnreadCount(userId) {
    await this.delay();
    return this.messages.filter(msg => 
      msg.receiverId === userId && !msg.isRead
    ).length;
  }

  async deleteMessage(messageId) {
    await this.delay();
    this.messages = this.messages.filter(msg => msg.Id !== messageId);
    return { success: true };
  }

  async getConversations(userId) {
    await this.delay();
    const userMessages = this.messages.filter(msg => 
      msg.senderId === userId || msg.receiverId === userId
    );
    
    const conversations = {};
    userMessages.forEach(msg => {
      const otherUserId = msg.senderId === userId ? msg.receiverId : msg.senderId;
      if (!conversations[otherUserId]) {
        conversations[otherUserId] = {
          otherUserId,
          messages: [],
          lastMessage: null,
          unreadCount: 0
        };
      }
      
      conversations[otherUserId].messages.push(msg);
      
      if (!conversations[otherUserId].lastMessage || 
          new Date(msg.timestamp) > new Date(conversations[otherUserId].lastMessage.timestamp)) {
        conversations[otherUserId].lastMessage = msg;
      }
      
      if (msg.receiverId === userId && !msg.isRead) {
        conversations[otherUserId].unreadCount++;
      }
    });
    
    return Object.values(conversations);
  }
}

export default new ChatService();