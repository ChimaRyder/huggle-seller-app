import { 
  getSellerNotifications, 
  getSellerUnreadNotificationCount, 
  markAllSellerNotificationsAsRead,
  SellerNotification 
} from '../api/notificationApi';

interface Notification {
    id: string,
    userId: string,
    title: string,
    message: string,
    createdAt: string,
    isRead: boolean,
    type: number,
    relatedEntityId: string
}

// Helper function to map backend notification type to numeric type for UI
const mapNotificationTypeToNumber = (type: string): number => {
  switch (type) {
    case 'NewOrder':
      return 1; // Order notification
    case 'OrderPickedUp':
      return 1; // Order notification
    case 'NewReport':
      return 2; // Review/Report notification
    case 'NewVerificationRequest':
      return 5; // Verification notification
    default:
      return 0; // Unknown
  }
};

// Helper function to map backend notification to UI notification format
const mapSellerNotificationToUI = (notification: SellerNotification): Notification => {
  return {
    id: notification.id,
    userId: notification.userId,
    title: notification.title,
    message: notification.message,
    createdAt: notification.createdAt,
    isRead: notification.isRead,
    type: mapNotificationTypeToNumber(notification.type),
    relatedEntityId: notification.relatedEntityId || ""
  };
};

const getNotifications = async (token: string, id: string) => {
  try {
    const response = await getSellerNotifications(token);
    const notifications = response.data.map(mapSellerNotificationToUI);
    
    return {
      data: notifications,
      status: 200
    };
  } catch (error) {
    console.error('Error fetching seller notifications:', error);
    // Fallback to empty array if API fails
    return {
      data: [],
      status: 500
    };
  }
};

const getUnreadCount = async (token: string, id: string) => {
  try {
    const response = await getSellerUnreadNotificationCount(token);
    
    return {
      data: { count: response.data.UnreadCount || 0 },
      status: 200
    };
  } catch (error) {
    console.error('Error fetching seller unread count:', error);
    return {
      data: { count: 0 },
      status: 500
    };
  }
};

const markRead = async (token: string, id: string) => {
  try {
    const response = await markAllSellerNotificationsAsRead(token);
    
    return {
      data: { message: "All notifications marked as read" },
      status: 200
    };
  } catch (error) {
    console.error('Error marking seller notifications as read:', error);
    return {
      data: { message: "Error marking notifications as read" },
      status: 500
    };
  }
};

export { Notification, getNotifications, getUnreadCount, markRead };