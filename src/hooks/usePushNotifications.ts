import { useCallback } from 'react';

export const usePushNotifications = () => {
  const requestPermission = useCallback(async () => {
    if ('Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          console.log('Notification permission granted.');
        } else {
          console.log('Notification permission denied.');
        }
        return permission;
      } catch (error) {
        console.error('Error requesting notification permission:', error);
        return 'default';
      }
    }
    return 'unsupported';
  }, []);

  return { requestPermission };
};
