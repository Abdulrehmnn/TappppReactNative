// NotificationService.js
import PushNotification from 'react-native-push-notification';

export const initializePushNotifications = () => {
  PushNotification.configure({
    onNotification: function (notification) {
      console.log('LOCAL NOTIFICATION ==>', notification);
    },

    popInitialNotification: true,
    requestPermissions: true,
  });

  // Android requires channels for sound/vibration
  PushNotification.createChannel(
    {
      channelId: 'order-channel', // Must match channelId used when sending
      channelName: 'Order Notifications',
      soundName: 'default',
      importance: 4, // Max importance to ensure sound
      vibrate: true,
    },
    (created) => console.log(`createChannel returned '${created}'`)
  );
};
