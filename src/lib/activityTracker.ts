
import { ref, set, onDisconnect, serverTimestamp } from "firebase/database";
import { db } from './firebase';

export const trackUserPresence = (userId: string, email: string) => {
  const userStatusDatabaseRef = ref(db, '/status/' + userId);

  const isOfflineForDatabase = {
      state: 'offline',
      last_changed: serverTimestamp(),
      email: email,
  };

  const isOnlineForDatabase = {
      state: 'online',
      last_changed: serverTimestamp(),
      email: email,
  };

  // You can use the onValue listener to keep track of the user's online status in real time
  onDisconnect(userStatusDatabaseRef).set(isOfflineForDatabase).then(() => {
      set(userStatusDatabaseRef, isOnlineForDatabase);
  });
};

export const trackUserNavigation = (userId: string, path: string) => {
    const userCurrentPageRef = ref(db, '/activity/' + userId + '/currentPage');
    set(userCurrentPageRef, path);
};
