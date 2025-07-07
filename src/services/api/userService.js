import usersData from '@/services/mockData/users.json';

class UserService {
  constructor() {
    this.users = [...usersData];
  }

  // Simulate API delay
  delay(ms = 300) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getAll() {
    await this.delay();
    return [...this.users];
  }

  async getById(id) {
    await this.delay();
    return this.users.find(user => user.Id === id) || null;
  }

  async searchUsers(query) {
    await this.delay();
    if (!query.trim()) return [];
    
    const searchTerm = query.toLowerCase();
    return this.users.filter(user => 
      user.username.toLowerCase().includes(searchTerm) ||
      user.displayName.toLowerCase().includes(searchTerm)
    );
  }

  async updateProfile(id, updates) {
    await this.delay();
    const userIndex = this.users.findIndex(user => user.Id === id);
    if (userIndex === -1) return null;

    this.users[userIndex] = { ...this.users[userIndex], ...updates };
    return this.users[userIndex];
  }

  async followUser(userId, targetUserId) {
    await this.delay();
    // In a real app, this would update the follow relationship
    // For now, just return success
    return { success: true };
  }

  async unfollowUser(userId, targetUserId) {
    await this.delay();
    // In a real app, this would remove the follow relationship
    // For now, just return success
    return { success: true };
  }

  async getSuggestedUsers(userId, limit = 5) {
    await this.delay();
    // Return random users excluding the current user
    const otherUsers = this.users.filter(user => user.Id !== userId);
    const shuffled = otherUsers.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, limit);
  }

async getCurrentUser() {
    await this.delay();
    // Return the first user as the current user for demo purposes
    return this.users[0] || null;
  }

  async getMutualFollowers(userId) {
    await this.delay();
    // In a real app, this would check mutual follow relationships
    // For demo, return users 2-4 as mutual followers
    return this.users.filter(user => user.Id !== userId && user.Id <= 4);
  }

  async getUserOnlineStatus(userId) {
    await this.delay();
    // Simulate online status - randomly return true/false
    return Math.random() > 0.3;
  }

  async getMultipleOnlineStatus(userIds) {
    await this.delay();
    // Return online status for multiple users
    const statuses = {};
    userIds.forEach(id => {
      statuses[id] = Math.random() > 0.3;
    });
    return statuses;
}

  async getFriendSuggestions(userId, limit = 5) {
    await this.delay();
    
    // Get all users except the current user
    const otherUsers = this.users.filter(user => user.Id !== userId);
    
    // Simulate mutual friends calculation
    const suggestions = otherUsers.map(user => {
      // For demo purposes, create realistic mutual friends
      const mutualFriends = this.users
        .filter(u => u.Id !== userId && u.Id !== user.Id)
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.floor(Math.random() * 4) + 1); // 1-4 mutual friends
      
      return {
        ...user,
        mutualFriends: mutualFriends.map(friend => ({
          Id: friend.Id,
          displayName: friend.displayName,
          username: friend.username,
          avatar: friend.avatar
        })),
        mutualFriendsCount: mutualFriends.length,
        suggestionReason: mutualFriends.length > 0 
          ? `${mutualFriends.length} mutual friend${mutualFriends.length !== 1 ? 's' : ''}`
          : 'Based on your interests'
      };
    });

    // Sort by mutual friends count (descending) and return limited results
    return suggestions
      .sort((a, b) => b.mutualFriendsCount - a.mutualFriendsCount)
      .slice(0, limit);
  }

  async getMutualFriends(userId1, userId2) {
    await this.delay();
    
    // Simulate getting mutual friends between two users
    const mutualFriends = this.users
      .filter(user => user.Id !== userId1 && user.Id !== userId2)
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.floor(Math.random() * 5) + 1);
    
    return mutualFriends;
  }
}

export default new UserService();