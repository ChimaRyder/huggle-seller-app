const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export type SellerNotificationType = 
  | "NewOrder"
  | "OrderPickedUp"
  | "NewReport"
  | "NewVerificationRequest";

export interface SellerNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  relatedEntityId?: string;
  relatedEntityType?: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Since the backend only has buyer endpoints currently, we'll need to create seller-specific endpoints
// For now, I'll create the API structure that would work once the backend is updated

export const getSellerNotifications = async (
  token: string | null,
  unreadOnly = false
) => {
  const url = `${API_BASE_URL}/api/notifications/seller?unreadOnly=${unreadOnly}`;
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
  });
  if (!response.ok) throw new Error("Failed to fetch notifications");
  return response.json();
};

export const getSellerUnreadNotificationCount = async (
  token: string | null
) => {
  const url = `${API_BASE_URL}/api/notifications/seller/unread-count`;
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
  });
  if (!response.ok) throw new Error("Failed to fetch unread count");
  return response.json();
};

export const markSellerNotificationAsRead = async (
  notificationId: string,
  token: string | null
) => {
  const url = `${API_BASE_URL}/api/notifications/seller/${notificationId}/read`;
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
  });
  if (!response.ok) throw new Error("Failed to mark notification as read");
  return response.json();
};

export const markAllSellerNotificationsAsRead = async (
  token: string | null
) => {
  const url = `${API_BASE_URL}/api/notifications/seller/mark-all-read`;
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
  });
  if (!response.ok) throw new Error("Failed to mark all as read");
  return response.json();
};

export const deleteSellerNotification = async (
  notificationId: string,
  token: string | null
) => {
  const url = `${API_BASE_URL}/api/notifications/seller/${notificationId}`;
  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
  });
  if (!response.ok) throw new Error("Failed to delete notification");
  return response.json();
};

export const storeSellerPushToken = async (
  pushToken: string,
  token: string | null
) => {
  const url = `${API_BASE_URL}/api/notifications/seller/push-token`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify({ token: pushToken }),
  });
  if (!response.ok) throw new Error("Failed to store push token");
  return response.json();
};
