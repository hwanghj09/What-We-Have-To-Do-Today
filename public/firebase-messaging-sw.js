// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyDdtDNfqvrRpppbaE4cjYBD8QejI_4-3SA",
  authDomain: "what-we-have-to-do-today.firebaseapp.com",
  projectId: "what-we-have-to-do-today",
  storageBucket: "what-we-have-to-do-today.firebasestorage.app",
  messagingSenderId: "129752079783",
  appId: "1:129752079783:web:5a68510d4857e85d50ea82"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  console.log(
    '[firebase-messaging-sw.js] Received background message ',
    payload
  );

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icons/logo.png',
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});