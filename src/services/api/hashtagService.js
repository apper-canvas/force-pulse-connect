import postService from './postService';

class HashtagService {
  constructor() {
    this.cache = new Map();
    this.lastCacheUpdate = null;
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
  }

  async getAll() {
    return new Promise((resolve) => {
      setTimeout(async () => {
        try {
          const posts = await postService.getAll();
          const hashtagMap = new Map();
          
          posts.forEach(post => {
            if (post.hashtags && Array.isArray(post.hashtags)) {
              post.hashtags.forEach(hashtag => {
                const cleanTag = hashtag.replace('#', '');
                if (hashtagMap.has(cleanTag)) {
                  hashtagMap.get(cleanTag).count += 1;
                  hashtagMap.get(cleanTag).posts.push(post.Id);
                } else {
                  hashtagMap.set(cleanTag, {
                    Id: this.generateId(),
                    name: cleanTag,
                    count: 1,
                    posts: [post.Id]
                  });
                }
              });
            }
          });

          const hashtags = Array.from(hashtagMap.values()).sort((a, b) => b.count - a.count);
          resolve(hashtags);
        } catch (error) {
          throw new Error('Failed to fetch hashtags');
        }
      }, 300);
    });
  }

  async getTrending(limit = 10) {
    return new Promise((resolve) => {
      setTimeout(async () => {
        try {
          const now = Date.now();
          
          // Check cache first
          if (this.cache.has('trending') && 
              this.lastCacheUpdate && 
              (now - this.lastCacheUpdate) < this.cacheExpiry) {
            resolve(this.cache.get('trending'));
            return;
          }

          const hashtags = await this.getAll();
          const trending = hashtags.slice(0, limit);
          
          // Update cache
          this.cache.set('trending', trending);
          this.lastCacheUpdate = now;
          
          resolve(trending);
        } catch (error) {
          throw new Error('Failed to fetch trending hashtags');
        }
      }, 250);
    });
  }

  async getById(id) {
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          const hashtags = await this.getAll();
          const hashtag = hashtags.find(h => h.Id === parseInt(id));
          
          if (!hashtag) {
            reject(new Error('Hashtag not found'));
            return;
          }
          
          resolve(hashtag);
        } catch (error) {
          reject(new Error('Failed to fetch hashtag'));
        }
      }, 200);
    });
  }

  async getPopularityScore(hashtagName) {
    return new Promise((resolve) => {
      setTimeout(async () => {
        try {
          const hashtags = await this.getAll();
          const hashtag = hashtags.find(h => h.name.toLowerCase() === hashtagName.toLowerCase());
          
          if (!hashtag) {
            resolve(0);
            return;
          }
          
          // Calculate popularity score based on count and recency
          const maxCount = Math.max(...hashtags.map(h => h.count));
          const normalizedCount = hashtag.count / maxCount;
          
          resolve(Math.round(normalizedCount * 100));
        } catch (error) {
          resolve(0);
        }
      }, 200);
    });
  }

  generateId() {
    return Math.floor(Math.random() * 1000000) + 1;
  }

  // Clear cache method for testing or force refresh
  clearCache() {
    this.cache.clear();
    this.lastCacheUpdate = null;
  }
}

const hashtagService = new HashtagService();
export default hashtagService;