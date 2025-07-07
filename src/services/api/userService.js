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
}

export default new UserService();