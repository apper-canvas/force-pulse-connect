class NotificationService {
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
          { field: { Name: "type" } },
          { field: { Name: "target_id" } },
          { field: { Name: "timestamp" } },
          { field: { Name: "is_read" } },
          { 
            field: { Name: "from_user_id" },
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

      const response = await this.apperClient.fetchRecords('app_Notification', params);

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching notifications:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return [];
    }
  }

  async getUnreadCount() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } }
        ],
        where: [
          {
            FieldName: "is_read",
            Operator: "EqualTo",
            Values: [false]
          }
        ],
        pagingInfo: {
          limit: 100,
          offset: 0
        }
      };

      const response = await this.apperClient.fetchRecords('app_Notification', params);

      if (!response.success) {
        console.error(response.message);
        return 0;
      }

      return response.data ? response.data.length : 0;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching unread count:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return 0;
    }
  }

  async markAsRead(id) {
    try {
      const params = {
        records: [{
          Id: id,
          is_read: true
        }]
      };

      const response = await this.apperClient.updateRecord('app_Notification', params);

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
        console.error("Error marking notification as read:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return null;
    }
  }

  async markAllAsRead() {
    try {
      // First get all unread notifications
      const params = {
        fields: [
          { field: { Name: "Name" } }
        ],
        where: [
          {
            FieldName: "is_read",
            Operator: "EqualTo",
            Values: [false]
          }
        ],
        pagingInfo: {
          limit: 100,
          offset: 0
        }
      };

      const response = await this.apperClient.fetchRecords('app_Notification', params);

      if (!response.success) {
        console.error(response.message);
        return false;
      }

      // Update all unread notifications to read
      if (response.data && response.data.length > 0) {
        const updateParams = {
          records: response.data.map(notification => ({
            Id: notification.Id,
            is_read: true
          }))
        };

        const updateResponse = await this.apperClient.updateRecord('app_Notification', updateParams);

        if (!updateResponse.success) {
          console.error(updateResponse.message);
          return false;
        }

        if (updateResponse.results) {
          const failedUpdates = updateResponse.results.filter(result => !result.success);

          if (failedUpdates.length > 0) {
            console.error(`Failed to update ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          }
        }
      }

      return true;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error marking all notifications as read:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return false;
    }
  }

  async create(notificationData) {
    try {
      const params = {
        records: [{
          Name: `${notificationData.type} notification`, // Generate name from type
          type: notificationData.type,
          from_user_id: notificationData.fromUserId,
          target_id: notificationData.targetId,
          timestamp: new Date().toISOString(),
          is_read: false
        }]
      };

      const response = await this.apperClient.createRecord('app_Notification', params);

      if (!response.success) {
        console.error(response.message);
        return null;
      }

      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);

        if (failedRecords.length > 0) {
          console.error(`Failed to create ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
        }

        return successfulRecords.length > 0 ? successfulRecords[0].data : null;
      }

      return null;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating notification:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return null;
    }
  }

  async delete(id) {
    try {
      const params = {
        RecordIds: [id]
      };

      const response = await this.apperClient.deleteRecord('app_Notification', params);

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

      return false;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting notification:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return false;
    }
  }
}

export default new NotificationService();