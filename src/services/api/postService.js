/**
 * PostService - Handles all post-related operations with Apper backend
 * Provides CRUD operations, likes management, search, and feed functionality
 */
class PostService {
  constructor() {
    // Initialize ApperClient with environment variables
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    
    // Table name from the database schema
    this.tableName = 'post';
  }

  /**
   * Get all posts with pagination and sorting
   * @param {Object} options - Query options
   * @returns {Array} Array of post records
   */
  async getAll(options = {}) {
    try {
      const { limit = 50, offset = 0, orderBy = 'timestamp', sortType = 'DESC' } = options;
      
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "content" } },
          { field: { Name: "image_url" } },
          { field: { Name: "timestamp" } },
          { field: { Name: "hashtags" } },
          { field: { Name: "likes" } },
          { field: { Name: "Tags" } },
          { field: { Name: "Owner" } },
          { field: { Name: "CreatedOn" } },
          { field: { Name: "CreatedBy" } },
          { field: { Name: "ModifiedOn" } },
          { field: { Name: "ModifiedBy" } },
          { 
            field: { Name: "user_id" },
            referenceField: { field: { Name: "display_name" } }
          }
        ],
        orderBy: [
          {
            fieldName: orderBy,
            sorttype: sortType
          }
        ],
        pagingInfo: {
          limit,
          offset
        }
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);

      if (!response.success) {
        console.error(`Failed to fetch posts: ${response.message}`);
        return [];
      }

      // Transform and validate response data
      return this.transformPostsData(response.data || []);
    } catch (error) {
      this.handleError('Error fetching posts', error);
      return [];
    }
  }

  /**
   * Get a single post by ID
   * @param {number} id - Post ID
   * @returns {Object|null} Post record or null
   */
  async getById(id) {
    try {
      if (!id || !Number.isInteger(Number(id))) {
        console.error('Invalid post ID provided');
        return null;
      }

      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "content" } },
          { field: { Name: "image_url" } },
          { field: { Name: "timestamp" } },
          { field: { Name: "hashtags" } },
          { field: { Name: "likes" } },
          { field: { Name: "Tags" } },
          { field: { Name: "Owner" } },
          { field: { Name: "CreatedOn" } },
          { field: { Name: "CreatedBy" } },
          { field: { Name: "ModifiedOn" } },
          { field: { Name: "ModifiedBy" } },
          { 
            field: { Name: "user_id" },
            referenceField: { field: { Name: "display_name" } }
          }
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, Number(id), params);

      if (!response.success) {
        console.error(`Failed to fetch post ${id}: ${response.message}`);
        return null;
      }

      return this.transformPostData(response.data);
    } catch (error) {
      this.handleError(`Error fetching post with ID ${id}`, error);
      return null;
    }
  }

  /**
   * Get posts by user ID
   * @param {number} userId - User ID
   * @param {Object} options - Query options
   * @returns {Array} Array of user's posts
   */
  async getByUserId(userId, options = {}) {
    try {
      if (!userId || !Number.isInteger(Number(userId))) {
        console.error('Invalid user ID provided');
        return [];
      }

      const { limit = 20, offset = 0 } = options;

      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "content" } },
          { field: { Name: "image_url" } },
          { field: { Name: "timestamp" } },
          { field: { Name: "hashtags" } },
          { field: { Name: "likes" } },
          { field: { Name: "Tags" } },
          { 
            field: { Name: "user_id" },
            referenceField: { field: { Name: "display_name" } }
          }
        ],
        where: [
          {
            FieldName: "user_id",
            Operator: "EqualTo",
            Values: [Number(userId)]
          }
        ],
        orderBy: [
          {
            fieldName: "timestamp",
            sorttype: "DESC"
          }
        ],
        pagingInfo: {
          limit,
          offset
        }
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);

      if (!response.success) {
        console.error(`Failed to fetch posts for user ${userId}: ${response.message}`);
        return [];
      }

      return this.transformPostsData(response.data || []);
    } catch (error) {
      this.handleError(`Error fetching posts by user ID ${userId}`, error);
      return [];
    }
  }

  /**
   * Create a new post
   * @param {Object} postData - Post data
   * @returns {Object|null} Created post or null
   */
  async create(postData) {
    try {
      if (!postData || !postData.content) {
        console.error('Post content is required');
        return null;
      }

      // Extract hashtags from content
      const hashtags = this.extractHashtags(postData.content);
      
      // Prepare record data with only updateable fields
      const recordData = {
        Name: this.generatePostName(postData.content),
        content: postData.content,
        image_url: postData.imageUrl || postData.image_url || '',
        timestamp: new Date().toISOString(),
        hashtags: hashtags.join(','),
        likes: '', // Empty string for new posts
        user_id: Number(postData.userId) || 1
      };

      // Add optional fields if provided
      if (postData.Tags) recordData.Tags = postData.Tags;
      if (postData.Owner) recordData.Owner = Number(postData.Owner);

      const params = {
        records: [recordData]
      };

      const response = await this.apperClient.createRecord(this.tableName, params);

      if (!response.success) {
        console.error(`Failed to create post: ${response.message}`);
        return null;
      }

      const successfulRecords = response.results.filter(result => result.success);
      const failedRecords = response.results.filter(result => !result.success);

      if (failedRecords.length > 0) {
        console.error(`Failed to create ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
        
        // Show individual error messages
        failedRecords.forEach(record => {
          if (record.errors) {
            record.errors.forEach(error => {
              console.error(`Field ${error.fieldLabel}: ${error.message}`);
            });
          }
          if (record.message) {
            console.error(record.message);
          }
        });
      }

      if (successfulRecords.length > 0) {
        return this.transformPostData(successfulRecords[0].data);
      }

      return null;
    } catch (error) {
      this.handleError('Error creating post', error);
      return null;
    }
  }

  /**
   * Update an existing post
   * @param {number} id - Post ID
   * @param {Object} updateData - Updated post data
   * @returns {Object|null} Updated post or null
   */
  async update(id, updateData) {
    try {
      if (!id || !Number.isInteger(Number(id))) {
        console.error('Invalid post ID provided');
        return null;
      }

      if (!updateData || Object.keys(updateData).length === 0) {
        console.error('Update data is required');
        return null;
      }

      // Prepare update record with only updateable fields
      const recordData = {
        Id: Number(id)
      };

      // Add updateable fields if provided
      if (updateData.Name !== undefined) recordData.Name = updateData.Name;
      if (updateData.content !== undefined) recordData.content = updateData.content;
      if (updateData.image_url !== undefined) recordData.image_url = updateData.image_url;
      if (updateData.timestamp !== undefined) recordData.timestamp = updateData.timestamp;
      if (updateData.hashtags !== undefined) recordData.hashtags = updateData.hashtags;
      if (updateData.likes !== undefined) recordData.likes = updateData.likes;
      if (updateData.user_id !== undefined) recordData.user_id = Number(updateData.user_id);
      if (updateData.Tags !== undefined) recordData.Tags = updateData.Tags;
      if (updateData.Owner !== undefined) recordData.Owner = Number(updateData.Owner);

      // Update hashtags if content changed
      if (updateData.content) {
        recordData.hashtags = this.extractHashtags(updateData.content).join(',');
      }

      const params = {
        records: [recordData]
      };

      const response = await this.apperClient.updateRecord(this.tableName, params);

      if (!response.success) {
        console.error(`Failed to update post: ${response.message}`);
        return null;
      }

      const successfulUpdates = response.results.filter(result => result.success);
      const failedUpdates = response.results.filter(result => !result.success);

      if (failedUpdates.length > 0) {
        console.error(`Failed to update ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
        
        failedUpdates.forEach(record => {
          if (record.errors) {
            record.errors.forEach(error => {
              console.error(`Field ${error.fieldLabel}: ${error.message}`);
            });
          }
          if (record.message) {
            console.error(record.message);
          }
        });
      }

      if (successfulUpdates.length > 0) {
        return this.transformPostData(successfulUpdates[0].data);
      }

      return null;
    } catch (error) {
      this.handleError(`Error updating post ${id}`, error);
      return null;
    }
  }

  /**
   * Like a post
   * @param {number} postId - Post ID
   * @param {number} userId - User ID
   * @returns {Object|null} Updated post or null
   */
  async likePost(postId, userId) {
    try {
      if (!postId || !userId) {
        console.error('Post ID and User ID are required');
        return null;
      }

      // Get current post to check existing likes
      const post = await this.getById(postId);
      if (!post) {
        console.error('Post not found');
        return null;
      }

      // Parse existing likes (MultiPicklist format: comma-separated string)
      const currentLikes = post.likes ? post.likes.split(',').filter(id => id.trim()) : [];
      
      // Add userId if not already present
      const userIdStr = userId.toString();
      if (!currentLikes.includes(userIdStr)) {
        currentLikes.push(userIdStr);
      }

      // Update the post with new likes
      return await this.update(postId, {
        likes: currentLikes.join(',')
      });
    } catch (error) {
      this.handleError(`Error liking post ${postId}`, error);
      return null;
    }
  }

  /**
   * Unlike a post
   * @param {number} postId - Post ID
   * @param {number} userId - User ID
   * @returns {Object|null} Updated post or null
   */
  async unlikePost(postId, userId) {
    try {
      if (!postId || !userId) {
        console.error('Post ID and User ID are required');
        return null;
      }

      // Get current post to check existing likes
      const post = await this.getById(postId);
      if (!post) {
        console.error('Post not found');
        return null;
      }

      // Parse existing likes and remove userId
      const currentLikes = post.likes ? post.likes.split(',').filter(id => id.trim()) : [];
      const userIdStr = userId.toString();
      const updatedLikes = currentLikes.filter(id => id !== userIdStr);

      // Update the post with remaining likes
      return await this.update(postId, {
        likes: updatedLikes.join(',')
      });
    } catch (error) {
      this.handleError(`Error unliking post ${postId}`, error);
      return null;
    }
  }

  /**
   * Delete a post
   * @param {number} id - Post ID
   * @returns {boolean} Success status
   */
  async delete(id) {
    try {
      if (!id || !Number.isInteger(Number(id))) {
        console.error('Invalid post ID provided');
        return false;
      }

      const params = {
        RecordIds: [Number(id)]
};

      const response = await this.apperClient.deleteRecord(this.tableName, params);

      if (!response.success) {
        console.error(`Failed to delete post: ${response.message}`);
        return false;
      }

      if (response.results) {
        const successfulDeletions = response.results.filter(result => result.success);
        const failedDeletions = response.results.filter(result => !result.success);

        if (failedDeletions.length > 0) {
          console.error(`Failed to delete ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
          
          failedDeletions.forEach(record => {
if (record.message) {
              console.error(record.message);
            }
          });
        }

        return successfulDeletions.length > 0;
      }
      
      return true;
    } catch (error) {
      this.handleError(`Error deleting post ${id}`, error);
      return false;
    }
  }

  /**
   * Search posts by content or hashtags
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Array} Array of matching posts
   */
  async searchPosts(query, options = {}) {
    try {
      if (!query || !query.trim()) {
        return [];
      }

      const { limit = 20, offset = 0 } = options;
      const searchTerm = query.trim();

      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "content" } },
          { field: { Name: "image_url" } },
          { field: { Name: "timestamp" } },
          { field: { Name: "hashtags" } },
          { field: { Name: "likes" } },
          { field: { Name: "Tags" } },
          { 
            field: { Name: "user_id" },
            referenceField: { field: { Name: "display_name" } }
          }
        ],
        whereGroups: [{
          operator: "OR",
          subGroups: [
            {
              conditions: [{
                fieldName: "content",
                operator: "Contains",
                values: [searchTerm],
                include: true
              }],
              operator: "OR"
            },
            {
              conditions: [{
                fieldName: "hashtags",
                operator: "Contains",
                values: [searchTerm],
                include: true
              }],
              operator: "OR"
            },
            {
              conditions: [{
                fieldName: "Name",
                operator: "Contains",
                values: [searchTerm],
                include: true
              }],
              operator: "OR"
            }
          ]
        }],
        orderBy: [
          {
            fieldName: "timestamp",
            sorttype: "DESC"
          }
        ],
        pagingInfo: {
          limit,
          offset
        }
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);

      if (!response.success) {
        console.error(`Failed to search posts: ${response.message}`);
        return [];
      }

      return this.transformPostsData(response.data || []);
    } catch (error) {
      this.handleError(`Error searching posts with query "${query}"`, error);
      return [];
    }
  }

  /**
   * Get feed posts (same as getAll for now, but can be enhanced with personalization)
   * @param {number} userId - User ID for personalized feed
   * @param {number} limit - Number of posts to fetch
   * @returns {Array} Array of feed posts
   */
  async getFeedPosts(userId, limit = 20) {
    try {
      return await this.getAll({ 
        limit, 
        offset: 0, 
        orderBy: 'timestamp', 
        sortType: 'DESC' 
      });
    } catch (error) {
      this.handleError('Error fetching feed posts', error);
      return [];
    }
  }

  /**
   * Add a comment to a post (placeholder - would need separate comment table)
   * @param {number} postId - Post ID
   * @param {Object} commentData - Comment data
   * @returns {Object} Success response
   */
  async addComment(postId, commentData) {
    try {
      // For now, return a mock success response
      // In a real implementation, this would create a record in a comments table
      return { 
        success: true, 
        Id: Date.now(),
        message: 'Comment functionality requires separate comment table implementation'
      };
    } catch (error) {
      this.handleError('Error adding comment', error);
      return null;
    }
  }

  /**
   * Get comments for a post (placeholder - would need separate comment table)
   * @param {number} postId - Post ID
   * @returns {Array} Array of comments
   */
  async getComments(postId) {
    try {
      // For now, return empty array
      // In a real implementation, this would fetch from a comments table
      return [];
    } catch (error) {
      this.handleError('Error fetching comments', error);
      return [];
    }
  }

  /**
   * Extract hashtags from content
   * @param {string} content - Post content
   * @returns {Array} Array of hashtags (without # symbol)
   */
  extractHashtags(content) {
    if (!content || typeof content !== 'string') {
      return [];
    }
    
    const hashtags = content.match(/#\w+/g) || [];
    return hashtags.map(tag => tag.substring(1)); // Remove # symbol
  }

  /**
   * Generate post name from content
   * @param {string} content - Post content
   * @returns {string} Generated post name
   */
  generatePostName(content) {
    if (!content || typeof content !== 'string') {
      return 'Untitled Post';
    }
    
    // Remove hashtags and excessive whitespace
    const cleanContent = content.replace(/#\w+/g, '').trim();
    
    if (cleanContent.length === 0) {
      return 'Untitled Post';
    }
    
    // Take first 50 characters and add ellipsis if needed
    return cleanContent.length > 47 
      ? cleanContent.substring(0, 47) + '...'
      : cleanContent;
  }

  /**
   * Transform single post data
   * @param {Object} post - Raw post data
   * @returns {Object} Transformed post data
   */
  transformPostData(post) {
    if (!post) return null;
    
    return {
      ...post,
      // Ensure numeric fields are properly typed
      Id: Number(post.Id),
      user_id: post.user_id ? Number(post.user_id) : null,
      
      // Ensure string fields are properly handled
      content: post.content || '',
      image_url: post.image_url || '',
      hashtags: post.hashtags || '',
      likes: post.likes || '',
      
      // Transform timestamp to ensure proper format
      timestamp: post.timestamp || new Date().toISOString(),
      
      // Add convenience properties
      likesArray: post.likes ? post.likes.split(',').filter(id => id.trim()) : [],
      hashtagsArray: post.hashtags ? post.hashtags.split(',').filter(tag => tag.trim()) : []
    };
  }

  /**
   * Transform array of posts data
   * @param {Array} posts - Array of raw post data
   * @returns {Array} Array of transformed post data
   */
  transformPostsData(posts) {
    if (!Array.isArray(posts)) return [];
    
    return posts.map(post => this.transformPostData(post)).filter(Boolean);
  }

  /**
   * Handle errors consistently
   * @param {string} message - Error message
   * @param {Error} error - Error object
   */
  handleError(message, error) {
    if (error?.response?.data?.message) {
      console.error(`${message}:`, error.response.data.message);
    } else if (error?.message) {
      console.error(`${message}:`, error.message);
    } else {
      console.error(message, error);
    }
  }
}

export default new PostService();