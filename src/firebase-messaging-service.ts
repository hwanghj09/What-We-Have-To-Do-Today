import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { app } from './firebase'; // Make sure to export 'app' from firebase.ts

const messaging = getMessaging(app);

// Replace with your actual VAPID key from the Firebase Console
const VAPID_KEY = 'BNT_dwz_j6MVXsVR79Kn5mVNOlk3Y-rekjdoHeHq2y0A8zm2DZ9JQijW9qsB68cCHuMy9ukT4oSnv9RxDX2KNlc';

export const requestForToken = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const currentToken = await getToken(messaging, { vapidKey: VAPID_KEY });
      if (currentToken) {
        console.log('FCM registration token:', currentToken);
        return currentToken;
      } else {
        console.log(
          'No registration token available. Request permission to generate one.'
        );
        return null;
      }
    } else {
      console.log('Notification permission denied.');
      return null;
    }
  } catch (err) {
    console.error('An error occurred while retrieving token:', err);
    return null;
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log('Foreground message received:', payload);
      resolve(payload);
    });
  });
