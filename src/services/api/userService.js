/**
 * UserService - Phase 1 Implementation
 * Core functionality focused on authentication and profile retrieval
 */
class UserService {
  constructor() {
    // Initialize ApperClient
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
  }

  /**
   * Get current authenticated user profile
   * Primary method for authentication and profile retrieval
   */
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
        console.error("Error fetching current user:", response.message);
        return null;
      }

      // Transform database field names to UI-friendly format
      const user = response.data && response.data.length > 0 ? response.data[0] : null;
      if (user) {
        return {
          ...user,
          displayName: user.display_name,
          isPrivate: user.is_private,
          followersCount: user.followers_count || 0,
          followingCount: user.following_count || 0,
          postsCount: user.posts_count || 0
        };
      }

      return null;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching current user:", error?.response?.data?.message);
      } else {
        console.error("Error fetching current user:", error.message);
      }
      return null;
    }
  }

  /**
   * Get user by ID
   * Core method for profile retrieval
   */
  async getById(id) {
    try {
      if (!id) {
        console.error("User ID is required");
        return null;
      }

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
        console.error(`Error fetching user ${id}:`, response.message);
        return null;
      }

      // Transform database field names to UI-friendly format
      const user = response.data;
      if (user) {
        return {
          ...user,
          displayName: user.display_name,
          isPrivate: user.is_private,
          followersCount: user.followers_count || 0,
          followingCount: user.following_count || 0,
          postsCount: user.posts_count || 0
        };
      }

      return null;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching user with ID ${id}:`, error?.response?.data?.message);
      } else {
        console.error(`Error fetching user with ID ${id}:`, error.message);
      }
      return null;
    }
  }

  /**
   * Update user profile
   * Core method for profile management
   */
  async updateProfile(id, updates) {
    try {
      if (!id) {
        console.error("User ID is required for profile update");
        return null;
      }

      // Map UI-friendly field names to database field names
      const updateableFields = {};
      
      if (updates.username !== undefined) updateableFields.username = updates.username;
      if (updates.display_name !== undefined) updateableFields.display_name = updates.display_name;
      if (updates.displayName !== undefined) updateableFields.display_name = updates.displayName;
      if (updates.bio !== undefined) updateableFields.bio = updates.bio;
      if (updates.avatar !== undefined) updateableFields.avatar = updates.avatar;
      if (updates.is_private !== undefined) updateableFields.is_private = updates.is_private;
      if (updates.isPrivate !== undefined) updateableFields.is_private = updates.isPrivate;
      if (updates.followers_count !== undefined) updateableFields.followers_count = updates.followers_count;
      if (updates.followersCount !== undefined) updateableFields.followers_count = updates.followersCount;
      if (updates.following_count !== undefined) updateableFields.following_count = updates.following_count;
      if (updates.followingCount !== undefined) updateableFields.following_count = updates.followingCount;
      if (updates.posts_count !== undefined) updateableFields.posts_count = updates.posts_count;
      if (updates.postsCount !== undefined) updateableFields.posts_count = updates.postsCount;

      // Validate that we have at least one field to update
      if (Object.keys(updateableFields).length === 0) {
        console.error("No valid fields provided for update");
        return null;
      }

      const params = {
        records: [{
          Id: id,
          ...updateableFields
        }]
      };

      const response = await this.apperClient.updateRecord('app_User', params);

      if (!response.success) {
        console.error("Error updating profile:", response.message);
        return null;
      }

      const successfulUpdates = response.results?.filter(result => result.success) || [];
      const failedUpdates = response.results?.filter(result => !result.success) || [];

      if (failedUpdates.length > 0) {
        console.error(`Failed to update ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
      }

      // Transform response back to UI-friendly format
      if (successfulUpdates.length > 0) {
        const updatedUser = successfulUpdates[0].data;
        return {
          ...updatedUser,
          displayName: updatedUser.display_name,
          isPrivate: updatedUser.is_private,
          followersCount: updatedUser.followers_count || 0,
          followingCount: updatedUser.following_count || 0,
          postsCount: updatedUser.posts_count || 0
        };
      }

      return null;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating profile:", error?.response?.data?.message);
      } else {
        console.error("Error updating profile:", error.message);
      }
      return null;
    }
  }

  /**
   * Get all users with basic pagination
   * Supporting method for user discovery
   */
  async getAll(limit = 50, offset = 0) {
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
          limit: Math.min(limit, 100), // Cap at 100 for performance
          offset: Math.max(offset, 0)
        }
      };

      const response = await this.apperClient.fetchRecords('app_User', params);

      if (!response.success) {
        console.error("Error fetching users:", response.message);
        return [];
      }

      // Transform all users to UI-friendly format
      return (response.data || []).map(user => ({
        ...user,
        displayName: user.display_name,
        isPrivate: user.is_private,
        followersCount: user.followers_count || 0,
        followingCount: user.following_count || 0,
        postsCount: user.posts_count || 0
      }));
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching users:", error?.response?.data?.message);
      } else {
        console.error("Error fetching users:", error.message);
      }
      return [];
    }
  }

  /**
   * Search users by username or display name
   * Basic search functionality for Phase 1
   */
  async searchUsers(query, limit = 20) {
    try {
      if (!query || !query.trim()) {
        return [];
      }

      const searchTerm = query.trim();
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "username" } },
          { field: { Name: "display_name" } },
          { field: { Name: "bio" } },
          { field: { Name: "avatar" } },
          { field: { Name: "is_private" } }
        ],
        whereGroups: [{
          operator: "OR",
          subGroups: [
            {
              conditions: [{
                fieldName: "username",
                operator: "Contains",
                values: [searchTerm],
                include: true
              }],
              operator: "OR"
            },
            {
              conditions: [{
                fieldName: "display_name",
                operator: "Contains",
                values: [searchTerm],
                include: true
              }],
              operator: "OR"
            }
          ]
        }],
        pagingInfo: {
          limit: Math.min(limit, 50),
          offset: 0
        }
      };

      const response = await this.apperClient.fetchRecords('app_User', params);

      if (!response.success) {
        console.error("Error searching users:", response.message);
        return [];
      }

      // Transform search results to UI-friendly format
      return (response.data || []).map(user => ({
        ...user,
        displayName: user.display_name,
        isPrivate: user.is_private,
        followersCount: user.followers_count || 0,
        followingCount: user.following_count || 0,
        postsCount: user.posts_count || 0
      }));
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error searching users:", error?.response?.data?.message);
      } else {
        console.error("Error searching users:", error.message);
      }
      return [];
    }
  }

  // ============================================================================
  // PLACEHOLDER METHODS FOR FUTURE PHASES
  // These maintain compatibility with existing UI components
  // ============================================================================

  /**
   * Placeholder for follow functionality - Phase 2
   */
  async followUser(userId, targetUserId) {
    console.log("Follow functionality will be implemented in Phase 2");
    return { success: true, message: "Follow feature coming in Phase 2" };
  }

  /**
   * Placeholder for unfollow functionality - Phase 2
   */
  async unfollowUser(userId, targetUserId) {
    console.log("Unfollow functionality will be implemented in Phase 2");
    return { success: true, message: "Unfollow feature coming in Phase 2" };
  }

  /**
   * Placeholder for user suggestions - Phase 2
   */
  async getSuggestedUsers(userId, limit = 5) {
    console.log("User suggestions will be implemented in Phase 2");
    return [];
  }

  /**
   * Placeholder for friend suggestions - Phase 2
   */
  async getFriendSuggestions(userId, limit = 5) {
    console.log("Friend suggestions will be implemented in Phase 2");
    return [];
  }

  /**
   * Placeholder for mutual followers - Phase 2
   */
  async getMutualFollowers(userId) {
    console.log("Mutual followers will be implemented in Phase 2");
    return [];
  }

  /**
   * Placeholder for mutual friends - Phase 2
   */
  async getMutualFriends(userId1, userId2) {
    console.log("Mutual friends will be implemented in Phase 2");
    return [];
  }

  /**
   * Placeholder for online status - Phase 2
   */
  async getUserOnlineStatus(userId) {
    return false; // Default to offline for Phase 1
  }

  /**
   * Placeholder for multiple online status - Phase 2
   */
  async getMultipleOnlineStatus(userIds) {
    const statuses = {};
    userIds.forEach(id => {
      statuses[id] = false; // Default to offline for Phase 1
    });
    return statuses;
  }
}

export default new UserService();