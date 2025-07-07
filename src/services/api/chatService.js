class ChatService {
  constructor() {
    // Initialize ApperClient
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
  }

  async getAllMessages(userId) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "content" } },
          { field: { Name: "timestamp" } },
          { field: { Name: "is_read" } },
          { 
            field: { Name: "sender_id" },
            referenceField: { field: { Name: "display_name" } }
          },
          { 
            field: { Name: "receiver_id" },
            referenceField: { field: { Name: "display_name" } }
          }
        ],
        whereGroups: [{
          operator: "OR",
          subGroups: [
            {
              conditions: [{
                fieldName: "sender_id",
                operator: "EqualTo",
                values: [userId]
              }],
              operator: "OR"
            },
            {
              conditions: [{
                fieldName: "receiver_id",
                operator: "EqualTo",
                values: [userId]
              }],
              operator: "OR"
            }
          ]
        }],
        orderBy: [
          {
            fieldName: "timestamp",
            sorttype: "ASC"
          }
        ],
        pagingInfo: {
          limit: 100,
          offset: 0
        }
      };

      const response = await this.apperClient.fetchRecords('message', params);

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching all messages:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return [];
    }
  }

  async getMessages(userId, otherUserId) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "content" } },
          { field: { Name: "timestamp" } },
          { field: { Name: "is_read" } },
          { 
            field: { Name: "sender_id" },
            referenceField: { field: { Name: "display_name" } }
          },
          { 
            field: { Name: "receiver_id" },
            referenceField: { field: { Name: "display_name" } }
          }
        ],
        whereGroups: [{
          operator: "OR",
          subGroups: [
            {
              operator: "AND",
              conditions: [
                {
                  fieldName: "sender_id",
                  operator: "EqualTo",
                  values: [userId]
                },
                {
                  fieldName: "receiver_id",
                  operator: "EqualTo",
                  values: [otherUserId]
                }
              ]
            },
            {
              operator: "AND",
              conditions: [
                {
                  fieldName: "sender_id",
                  operator: "EqualTo",
                  values: [otherUserId]
                },
                {
                  fieldName: "receiver_id",
                  operator: "EqualTo",
                  values: [userId]
                }
              ]
            }
          ]
        }],
        orderBy: [
          {
            fieldName: "timestamp",
            sorttype: "ASC"
          }
        ],
        pagingInfo: {
          limit: 50,
          offset: 0
        }
      };

      const response = await this.apperClient.fetchRecords('message', params);

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching messages:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return [];
    }
  }

  async sendMessage(messageData) {
    try {
      const params = {
        records: [{
          Name: messageData.content.substring(0, 50) + '...', // Generate name from content
          content: messageData.content,
          timestamp: new Date().toISOString(),
          is_read: false,
          sender_id: messageData.senderId,
          receiver_id: messageData.receiverId
        }]
      };

      const response = await this.apperClient.createRecord('message', params);

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
        console.error("Error sending message:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return null;
    }
  }

  async markMessagesAsRead(userId, otherUserId) {
    try {
      // First, get unread messages from otherUserId to userId
      const params = {
        fields: [
          { field: { Name: "Name" } }
        ],
        whereGroups: [{
          operator: "AND",
          subGroups: [
            {
              conditions: [{
                fieldName: "sender_id",
                operator: "EqualTo",
                values: [otherUserId]
              }]
            },
            {
              conditions: [{
                fieldName: "receiver_id",
                operator: "EqualTo",
                values: [userId]
              }]
            },
            {
              conditions: [{
                fieldName: "is_read",
                operator: "EqualTo",
                values: [false]
              }]
            }
          ]
        }],
        pagingInfo: {
          limit: 50,
          offset: 0
        }
      };

      const response = await this.apperClient.fetchRecords('message', params);

      if (!response.success) {
        console.error(response.message);
        return { success: false };
      }

      // Update all unread messages to read
      if (response.data && response.data.length > 0) {
        const updateParams = {
          records: response.data.map(msg => ({
            Id: msg.Id,
            is_read: true
          }))
        };

        const updateResponse = await this.apperClient.updateRecord('message', updateParams);

        if (!updateResponse.success) {
          console.error(updateResponse.message);
          return { success: false };
        }
      }

      return { success: true };
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error marking messages as read:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return { success: false };
    }
  }

  async getUnreadCount(userId) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } }
        ],
        whereGroups: [{
          operator: "AND",
          subGroups: [
            {
              conditions: [{
                fieldName: "receiver_id",
                operator: "EqualTo",
                values: [userId]
              }]
            },
            {
              conditions: [{
                fieldName: "is_read",
                operator: "EqualTo",
                values: [false]
              }]
            }
          ]
        }],
        pagingInfo: {
          limit: 100,
          offset: 0
        }
      };

      const response = await this.apperClient.fetchRecords('message', params);

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

  async deleteMessage(messageId) {
    try {
      const params = {
        RecordIds: [messageId]
      };

      const response = await this.apperClient.deleteRecord('message', params);

      if (!response.success) {
        console.error(response.message);
        return { success: false };
      }

      return { success: true };
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting message:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return { success: false };
    }
  }

  async getConversations(userId) {
    try {
      const userMessages = await this.getAllMessages(userId);
      
      const conversations = {};
      userMessages.forEach(msg => {
        const otherUserId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
        if (!conversations[otherUserId]) {
          conversations[otherUserId] = {
            otherUserId,
            messages: [],
            lastMessage: null,
            unreadCount: 0
          };
        }
        
        conversations[otherUserId].messages.push(msg);
        
        if (!conversations[otherUserId].lastMessage || 
            new Date(msg.timestamp) > new Date(conversations[otherUserId].lastMessage.timestamp)) {
          conversations[otherUserId].lastMessage = msg;
        }
        
        if (msg.receiver_id === userId && !msg.is_read) {
          conversations[otherUserId].unreadCount++;
        }
      });
      
      return Object.values(conversations);
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching conversations:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return [];
    }
  }
}

export default new ChatService();