
import { ref, runTransaction } from "firebase/database";
import { db } from '@/lib/firebase';

export const trackTotalMessages = () => {
    const totalMessagesRef = ref(db, '/stats/totalMessages');
    runTransaction(totalMessagesRef, (currentValue) => {
        return (currentValue || 0) + 1;
    });
};

export const trackNewSignUp = () => {
    const newSignupsRef = ref(db, '/stats/newSignups');
    runTransaction(newSignupsRef, (currentValue) => {
        return (currentValue || 0) + 1;
    });
};
