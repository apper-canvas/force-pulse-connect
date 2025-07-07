import notificationsData from '@/services/mockData/notifications.json';

class NotificationService {
  constructor() {
    this.notifications = [...notificationsData];
  }

  // Simulate API delay
  delay(ms = 300) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getAll() {
    await this.delay();
    return [...this.notifications].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  async getUnreadCount() {
    await this.delay();
    return this.notifications.filter(notification => !notification.isRead).length;
  }

  async markAsRead(id) {
    await this.delay();
    const notification = this.notifications.find(n => n.Id === id);
    if (notification) {
      notification.isRead = true;
    }
    return notification;
  }

  async markAllAsRead() {
    await this.delay();
    this.notifications.forEach(notification => {
      notification.isRead = true;
    });
    return true;
  }

  async create(notificationData) {
    await this.delay();
    const newNotification = {
      Id: Math.max(...this.notifications.map(n => n.Id)) + 1,
      type: notificationData.type,
      fromUserId: notificationData.fromUserId,
      targetId: notificationData.targetId,
      timestamp: new Date().toISOString(),
      isRead: false
    };

    this.notifications.unshift(newNotification);
    return newNotification;
  }

  async delete(id) {
    await this.delay();
    const index = this.notifications.findIndex(notification => notification.Id === id);
    if (index === -1) return false;

    this.notifications.splice(index, 1);
    return true;
  }
}

export default new NotificationService();