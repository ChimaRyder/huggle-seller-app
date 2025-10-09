import React, { createContext, useContext, useEffect, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { storeSellerPushToken } from '@/utils/api/notificationApi';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

interface NotificationContextType {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
}

const NotificationContext = createContext<NotificationContextType>({
  expoPushToken: null,
  notification: null,
});

export const useNotifications = () => useContext(NotificationContext);

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const router = useRouter();
  const { getToken, isSignedIn } = useAuth();

  // Register for push notifications and get token
  const registerForPushNotificationsAsync = async () => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return null;
      }
      
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log('Seller Push Token:', token);
      
      // Store token in backend
      if (isSignedIn) {
        try {
          const authToken = await getToken({ template: "seller_app" });
          await storeSellerPushToken(token, authToken);
          console.log('Push token stored successfully for seller');
        } catch (error) {
          console.error('Failed to store push token:', error);
        }
      }
      
      return token;
    } catch (error) {
      console.error('Error getting push token:', error);
      return null;
    }
  };

  // Handle notification navigation for seller-specific types
  const handleNotificationNavigation = (data: any) => {
    const { type, relatedEntityId, relatedEntityType } = data;
    
    try {
      switch (type) {
        case 'NewOrder':
          // Navigate to orders screen
          router.push('/(main)/orders');
          break;
          
        case 'OrderPickedUp':
          // Navigate to specific order if ID provided, otherwise orders list
          if (relatedEntityId) {
            router.push(`/(main)/orders?id=${relatedEntityId}`);
          } else {
            router.push('/(main)/orders');
          }
          break;
          
        case 'NewReport':
          // Navigate to analytics or reports section
          router.push('/(main)/analytics');
          break;
          
        case 'NewVerificationRequest':
          // Navigate to verification screen
          router.push('/(main)/profile/storeVerification');
          break;
          
        default:
          // Fallback to notifications screen
          router.push('/(main)/notifications/notificationsScreen');
          break;
      }
    } catch (error) {
      console.error('Navigation error from notification:', error);
      // Fallback to notifications screen
      router.push('/(main)/notifications/notificationsScreen');
    }
  };

  useEffect(() => {
    // Register for push notifications when user is signed in
    if (isSignedIn) {
      registerForPushNotificationsAsync().then(token => {
        setExpoPushToken(token);
      });
    }

    // Listen for notifications received while app is running
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Seller notification received:', notification);
      setNotification(notification);
    });

    // Listen for notification responses (when user taps notification)
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Seller notification response:', response);
      const notificationData = response.notification.request.content.data;
      handleNotificationNavigation(notificationData);
    });

    // Cleanup
    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, [isSignedIn, getToken]);

  return (
    <NotificationContext.Provider
      value={{
        expoPushToken,
        notification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};