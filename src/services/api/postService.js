class PostService {
  constructor() {
    // Initialize ApperClient
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
  }

  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "content" } },
          { field: { Name: "image_url" } },
          { field: { Name: "timestamp" } },
          { field: { Name: "hashtags" } },
          { field: { Name: "likes" } },
          { 
            field: { Name: "user_id" },
            referenceField: { field: { Name: "display_name" } }
          }
        ],
        orderBy: [
          {
            fieldName: "timestamp",
            sorttype: "DESC"
          }
        ],
        pagingInfo: {
          limit: 50,
          offset: 0
        }
      };

      const response = await this.apperClient.fetchRecords('post', params);

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching posts:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return [];
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "content" } },
          { field: { Name: "image_url" } },
          { field: { Name: "timestamp" } },
          { field: { Name: "hashtags" } },
          { field: { Name: "likes" } },
          { 
            field: { Name: "user_id" },
            referenceField: { field: { Name: "display_name" } }
          }
        ]
      };

      const response = await this.apperClient.getRecordById('post', id, params);

      if (!response.success) {
        console.error(response.message);
        return null;
      }

      return response.data || null;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching post with ID ${id}:`, error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return null;
    }
  }

  async getByUserId(userId) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "content" } },
          { field: { Name: "image_url" } },
          { field: { Name: "timestamp" } },
          { field: { Name: "hashtags" } },
          { field: { Name: "likes" } },
          { 
            field: { Name: "user_id" },
            referenceField: { field: { Name: "display_name" } }
          }
        ],
        where: [
          {
            FieldName: "user_id",
            Operator: "EqualTo",
            Values: [userId]
          }
        ],
        orderBy: [
          {
            fieldName: "timestamp",
            sorttype: "DESC"
          }
        ],
        pagingInfo: {
          limit: 20,
          offset: 0
        }
      };

      const response = await this.apperClient.fetchRecords('post', params);

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching posts by user ID:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return [];
    }
  }

  async create(postData) {
    try {
      const params = {
        records: [{
          Name: postData.content.substring(0, 50) + '...', // Generate name from content
          content: postData.content,
          image_url: postData.imageUrl || null,
          timestamp: new Date().toISOString(),
          hashtags: this.extractHashtags(postData.content).join(','),
          likes: '', // Empty MultiPicklist for likes
          user_id: postData.userId || 1 // Default to user 1
        }]
      };

      const response = await this.apperClient.createRecord('post', params);

if (!response.success) {
        console.error(response.message);
        return null;
}

      const successfulRecords = response.results.filter(result => result.success);
      const failedRecords = response.results.filter(result => !result.success);

      if (failedRecords.length > 0) {
        console.error(`Failed to create ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
      }

      return successfulRecords.length > 0 ? successfulRecords[0].data : null;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating post:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return null;
    }
  }

  async likePost(postId, userId) {
    try {
      // First get the current post to check existing likes
      const post = await this.getById(postId);
      if (!post) return null;

      // Parse existing likes (comma-separated string to array)
      const currentLikes = post.likes ? post.likes.split(',').filter(id => id.trim()) : [];
      
      // Add userId if not already present
      if (!currentLikes.includes(userId.toString())) {
        currentLikes.push(userId.toString());
      }

      const params = {
        records: [{
          Id: postId,
          likes: currentLikes.join(',')
        }]
      };

      const response = await this.apperClient.updateRecord('post', params);

if (!response.success) {
        console.error(response.message);
        return null;
}

      const successfulUpdates = response.results.filter(result => result.success);
      const failedUpdates = response.results.filter(result => !result.success);

      if (failedUpdates.length > 0) {
        console.error(`Failed to update ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
      }

      return successfulUpdates.length > 0 ? successfulUpdates[0].data : null;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error liking post:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return null;
    }
  }

  async unlikePost(postId, userId) {
    try {
      // First get the current post to check existing likes
      const post = await this.getById(postId);
      if (!post) return null;

      // Parse existing likes and remove userId
      const currentLikes = post.likes ? post.likes.split(',').filter(id => id.trim()) : [];
      const updatedLikes = currentLikes.filter(id => id !== userId.toString());

      const params = {
        records: [{
          Id: postId,
          likes: updatedLikes.join(',')
        }]
      };

      const response = await this.apperClient.updateRecord('post', params);

if (!response.success) {
        console.error(response.message);
        return null;
}

      const successfulUpdates = response.results.filter(result => result.success);
      const failedUpdates = response.results.filter(result => !result.success);

      if (failedUpdates.length > 0) {
        console.error(`Failed to update ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
      }

      return successfulUpdates.length > 0 ? successfulUpdates[0].data : null;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error unliking post:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return null;
    }
  }

async addComment(postId, commentData) {
    try {
      // For comments, we would typically create a separate comment record
      // For this demo, we'll return success without actual comment storage
      return { success: true, Id: Date.now() };
    } catch (error) {
      console.error("Error adding comment:", error.message);
      return null;
    }
  }

  async getComments(postId) {
    try {
      // For comments, we would typically fetch from a comments table
      // For this demo, return empty array
      return [];
    } catch (error) {
      console.error("Error fetching comments:", error.message);
      return [];
    }
  }

  async getFeedPosts(userId, limit = 10) {
    try {
      // Return all posts as feed for demo
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "content" } },
          { field: { Name: "image_url" } },
          { field: { Name: "timestamp" } },
          { field: { Name: "hashtags" } },
          { field: { Name: "likes" } },
          { 
            field: { Name: "user_id" },
            referenceField: { field: { Name: "display_name" } }
          }
        ],
        orderBy: [
          {
            fieldName: "timestamp",
            sorttype: "DESC"
          }
        ],
        pagingInfo: {
          limit: limit,
          offset: 0
        }
      };

      const response = await this.apperClient.fetchRecords('post', params);

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching feed posts:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return [];
    }
  }

  async searchPosts(query) {
    try {
      if (!query.trim()) return [];

      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "content" } },
          { field: { Name: "image_url" } },
          { field: { Name: "timestamp" } },
          { field: { Name: "hashtags" } },
          { field: { Name: "likes" } },
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
                values: [query]
              }],
              operator: "OR"
            },
            {
              conditions: [{
                fieldName: "hashtags",
                operator: "Contains",
                values: [query]
              }],
              operator: "OR"
            }
          ]
        }],
        pagingInfo: {
          limit: 20,
          offset: 0
        }
      };

      const response = await this.apperClient.fetchRecords('post', params);

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error searching posts:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return [];
    }
  }

  extractHashtags(content) {
    const hashtags = content.match(/#\w+/g) || [];
    return hashtags.map(tag => tag.substring(1));
  }

  async delete(id) {
    try {
      const params = {
        RecordIds: [id]
      };

      const response = await this.apperClient.deleteRecord('post', params);

if (!response.success) {
        console.error(response.message);
        return false;
      }

if (response.results) {
        const successfulDeletions = response.results.filter(result => result.success);
        const failedDeletions = response.results.filter(result => !result.success);

        if (failedDeletions.length > 0) {
          console.error(`Failed to delete ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
        }

        return successfulDeletions.length > 0;
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting post:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return false;
    }
  }
}

export default new PostService();