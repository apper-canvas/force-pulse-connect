import postsData from "@/services/mockData/posts.json";
// Simulate API delay
function delay(ms = 300) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Image validation and fallback
function validateImageUrl(imageUrl) {
  // If no image URL, return default
  if (!imageUrl) {
    return 'https://picsum.photos/500/500?random=default'
  }
  
  // If it's already a picsum URL, return as-is
  if (imageUrl.includes('picsum.photos')) {
    return imageUrl
  }
  
  // For any other URL, return a fallback
  return imageUrl.replace(/https:\/\/images\.unsplash\.com\/[^?]*/, 'https://picsum.photos/500/500')
}

class PostService {
  constructor() {
this.posts = [...postsData].map(post => ({
      ...post,
      id: post.id || post.Id, // Ensure consistent lowercase id
      imageUrl: validateImageUrl(post.imageUrl)
    }))
  }

  async getAll() {
    await delay();
    // Return posts sorted by timestamp (newest first)
    return [...this.posts].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

async getById(id) {
    await delay();
    return this.posts.find(post => post.Id === id) || null;
  }

  async getByUserId(userId) {
    await delay();
    return this.posts
      .filter(post => post.userId === userId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

async create(postData) {
    await delay();
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
    await delay();
    const post = this.posts.find(p => p.Id === postId);
    if (!post) return null;

    if (!post.likes.includes(userId)) {
      post.likes.push(userId);
    }
    return post;
  }

async unlikePost(postId, userId) {
    await delay();
    const post = this.posts.find(p => p.Id === postId);
    if (!post) return null;

    post.likes = post.likes.filter(id => id !== userId);
    return post;
  }

async addComment(postId, commentData) {
    await delay();
    const post = this.posts.find(p => p.Id === postId);
    if (!post) return null;

    // Ensure comments array exists
    if (!post.comments) {
      post.comments = [];
    }

    // Get next comment ID
    const existingCommentIds = post.comments.map(c => c.Id || 0);
    const nextId = existingCommentIds.length > 0 ? Math.max(...existingCommentIds) + 1 : 1;

    const newComment = {
      Id: nextId,
      postId: postId,
      userId: commentData.userId,
      content: commentData.content,
      timestamp: new Date().toISOString()
    };

    post.comments.push(newComment);
    return post;
  }

  async getComments(postId) {
    await delay();
    const post = this.posts.find(p => p.Id === postId);
    if (!post) return [];
    
    // Ensure comments have proper Id field and return sorted by timestamp
    const comments = (post.comments || []).map(comment => ({
      ...comment,
      Id: comment.Id || comment.id || Date.now() + Math.random()
    }));
    
    return comments.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  }

async getFeedPosts(userId, limit = 10) {
    await delay();
    // For demo purposes, return all posts as feed
    // In a real app, this would filter by followed users
    return this.posts
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  }

async searchPosts(query) {
    await delay();
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
    await delay();
    const index = this.posts.findIndex(post => post.Id === id);
    if (index === -1) return false;

    this.posts.splice(index, 1);
    return true;
  }
}

export default new PostService();