import postsData from '@/services/mockData/posts.json';

class PostService {
  constructor() {
    this.posts = [...postsData];
  }

  // Simulate API delay
  delay(ms = 300) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getAll() {
    await this.delay();
    // Return posts sorted by timestamp (newest first)
    return [...this.posts].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  async getById(id) {
    await this.delay();
    return this.posts.find(post => post.Id === id) || null;
  }

  async getByUserId(userId) {
    await this.delay();
    return this.posts
      .filter(post => post.userId === userId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  async create(postData) {
    await this.delay();
    const newPost = {
      Id: Math.max(...this.posts.map(p => p.Id)) + 1,
      userId: 1, // Current user ID
      content: postData.content,
      imageUrl: postData.imageUrl || null,
      likes: [],
      comments: [],
      timestamp: new Date().toISOString(),
      hashtags: this.extractHashtags(postData.content)
    };

    this.posts.unshift(newPost);
    return newPost;
  }

  async likePost(postId, userId) {
    await this.delay();
    const post = this.posts.find(p => p.Id === postId);
    if (!post) return null;

    if (!post.likes.includes(userId)) {
      post.likes.push(userId);
    }
    return post;
  }

  async unlikePost(postId, userId) {
    await this.delay();
    const post = this.posts.find(p => p.Id === postId);
    if (!post) return null;

    post.likes = post.likes.filter(id => id !== userId);
    return post;
  }

  async addComment(postId, commentData) {
    await this.delay();
    const post = this.posts.find(p => p.Id === postId);
    if (!post) return null;

    const newComment = {
      id: Date.now(),
      postId: postId,
      userId: commentData.userId,
      content: commentData.content,
      timestamp: new Date().toISOString()
    };

    post.comments.push(newComment);
    return post;
  }

  async getFeedPosts(userId, limit = 10) {
    await this.delay();
    // For demo purposes, return all posts as feed
    // In a real app, this would filter by followed users
    return this.posts
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  }

  async searchPosts(query) {
    await this.delay();
    if (!query.trim()) return [];
    
    const searchTerm = query.toLowerCase();
    return this.posts.filter(post => 
      post.content.toLowerCase().includes(searchTerm) ||
      post.hashtags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  }

  extractHashtags(content) {
    const hashtags = content.match(/#\w+/g) || [];
    return hashtags.map(tag => tag.substring(1));
  }

  async delete(id) {
    await this.delay();
    const index = this.posts.findIndex(post => post.Id === id);
    if (index === -1) return false;

    this.posts.splice(index, 1);
    return true;
  }
}

export default new PostService();