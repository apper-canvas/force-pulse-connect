class UserService {
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
          { field: { Name: "username" } },
          { field: { Name: "display_name" } },
          { field: { Name: "bio" } },
          { field: { Name: "avatar" } },
          { field: { Name: "is_private" } },
          { field: { Name: "followers_count" } },
          { field: { Name: "following_count" } },
          { field: { Name: "posts_count" } }
        ],
        pagingInfo: {
          limit: 100,
          offset: 0
        }
      };

      const response = await this.apperClient.fetchRecords('app_User', params);

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching users:", error?.response?.data?.message);
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
          { field: { Name: "username" } },
          { field: { Name: "display_name" } },
          { field: { Name: "bio" } },
          { field: { Name: "avatar" } },
          { field: { Name: "is_private" } },
          { field: { Name: "followers_count" } },
          { field: { Name: "following_count" } },
          { field: { Name: "posts_count" } }
        ]
      };

      const response = await this.apperClient.getRecordById('app_User', id, params);

      if (!response.success) {
        console.error(response.message);
        return null;
      }

      return response.data || null;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching user with ID ${id}:`, error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return null;
    }
  }

  async searchUsers(query) {
    try {
      if (!query.trim()) return [];

      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "username" } },
          { field: { Name: "display_name" } },
          { field: { Name: "bio" } },
          { field: { Name: "avatar" } },
          { field: { Name: "is_private" } },
          { field: { Name: "followers_count" } },
          { field: { Name: "following_count" } },
          { field: { Name: "posts_count" } }
        ],
        whereGroups: [{
          operator: "OR",
          subGroups: [
            {
              conditions: [{
                fieldName: "username",
                operator: "Contains",
                values: [query]
              }],
              operator: "OR"
            },
            {
              conditions: [{
                fieldName: "display_name",
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

      const response = await this.apperClient.fetchRecords('app_User', params);

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error searching users:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return [];
    }
  }

  async updateProfile(id, updates) {
    try {
      // Only include updateable fields
      const updateableFields = {
        username: updates.username,
        display_name: updates.display_name || updates.displayName,
        bio: updates.bio,
        avatar: updates.avatar,
        is_private: updates.is_private || updates.isPrivate,
        followers_count: updates.followers_count || updates.followersCount,
        following_count: updates.following_count || updates.followingCount,
        posts_count: updates.posts_count || updates.postsCount
      };

      // Remove undefined fields
      Object.keys(updateableFields).forEach(key => {
        if (updateableFields[key] === undefined) {
          delete updateableFields[key];
        }
      });

      const params = {
        records: [{
          Id: id,
          ...updateableFields
        }]
      };

      const response = await this.apperClient.updateRecord('app_User', params);

      if (!response.success) {
        console.error(response.message);
        return null;
      }

      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);

        if (failedUpdates.length > 0) {
          console.error(`Failed to update ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
        }

        return successfulUpdates.length > 0 ? successfulUpdates[0].data : null;
      }

      return null;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating profile:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return null;
    }
  }

  async followUser(userId, targetUserId) {
    try {
      // In a real implementation, this would create a follow relationship
      // For now, just return success
      return { success: true };
    } catch (error) {
      console.error("Error following user:", error.message);
      return { success: false };
    }
  }

  async unfollowUser(userId, targetUserId) {
    try {
      // In a real implementation, this would remove a follow relationship
      // For now, just return success
      return { success: true };
    } catch (error) {
      console.error("Error unfollowing user:", error.message);
      return { success: false };
    }
  }

  async getSuggestedUsers(userId, limit = 5) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "username" } },
          { field: { Name: "display_name" } },
          { field: { Name: "bio" } },
          { field: { Name: "avatar" } },
          { field: { Name: "is_private" } },
          { field: { Name: "followers_count" } },
          { field: { Name: "following_count" } },
          { field: { Name: "posts_count" } }
        ],
        pagingInfo: {
          limit: limit,
          offset: 0
        }
      };

      const response = await this.apperClient.fetchRecords('app_User', params);

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      // Filter out current user and return suggested users
      const users = (response.data || []).filter(user => user.Id !== userId);
      return users.slice(0, limit);
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching suggested users:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return [];
    }
  }

  async getCurrentUser() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "username" } },
          { field: { Name: "display_name" } },
          { field: { Name: "bio" } },
          { field: { Name: "avatar" } },
          { field: { Name: "is_private" } },
          { field: { Name: "followers_count" } },
          { field: { Name: "following_count" } },
          { field: { Name: "posts_count" } }
        ],
        pagingInfo: {
          limit: 1,
          offset: 0
        }
      };

      const response = await this.apperClient.fetchRecords('app_User', params);

      if (!response.success) {
        console.error(response.message);
        return null;
      }

      // Return first user as current user for demo
      return response.data && response.data.length > 0 ? response.data[0] : null;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching current user:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return null;
    }
  }

  async getMutualFollowers(userId) {
    try {
      // For demo purposes, return a subset of users as mutual followers
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "username" } },
          { field: { Name: "display_name" } },
          { field: { Name: "bio" } },
          { field: { Name: "avatar" } },
          { field: { Name: "is_private" } },
          { field: { Name: "followers_count" } },
          { field: { Name: "following_count" } },
          { field: { Name: "posts_count" } }
        ],
        pagingInfo: {
          limit: 10,
          offset: 0
        }
      };

      const response = await this.apperClient.fetchRecords('app_User', params);

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      // Filter out current user and return first few as mutual followers
      const users = (response.data || []).filter(user => user.Id !== userId);
      return users.slice(0, 4);
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching mutual followers:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return [];
    }
  }

  async getUserOnlineStatus(userId) {
    // Simulate online status - randomly return true/false
    return Math.random() > 0.3;
  }

  async getMultipleOnlineStatus(userIds) {
    // Return online status for multiple users
    const statuses = {};
    userIds.forEach(id => {
      statuses[id] = Math.random() > 0.3;
    });
    return statuses;
  }

  async getFriendSuggestions(userId, limit = 5) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "username" } },
          { field: { Name: "display_name" } },
          { field: { Name: "bio" } },
          { field: { Name: "avatar" } },
          { field: { Name: "is_private" } },
          { field: { Name: "followers_count" } },
          { field: { Name: "following_count" } },
          { field: { Name: "posts_count" } }
        ],
        pagingInfo: {
          limit: limit + 5, // Get more than needed to filter current user
          offset: 0
        }
      };

      const response = await this.apperClient.fetchRecords('app_User', params);

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      // Filter out current user and add suggestion metadata
      const users = (response.data || []).filter(user => user.Id !== userId);
      
      const suggestions = users.map(user => ({
        ...user,
        mutualFriends: [],
        mutualFriendsCount: Math.floor(Math.random() * 4) + 1,
        suggestionReason: 'Based on your interests'
      }));

      return suggestions.slice(0, limit);
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching friend suggestions:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return [];
    }
  }

  async getMutualFriends(userId1, userId2) {
    try {
      // For demo purposes, return a subset of users as mutual friends
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "username" } },
          { field: { Name: "display_name" } },
          { field: { Name: "avatar" } }
        ],
        pagingInfo: {
          limit: 5,
          offset: 0
        }
      };

      const response = await this.apperClient.fetchRecords('app_User', params);

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      // Filter out the two users and return the rest as mutual friends
      const users = (response.data || []).filter(user => user.Id !== userId1 && user.Id !== userId2);
      return users.slice(0, Math.floor(Math.random() * 5) + 1);
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching mutual friends:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return [];
    }
  }
}

export default new UserService();