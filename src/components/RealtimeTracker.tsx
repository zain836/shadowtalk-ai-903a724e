
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import { trackUserPresence, trackUserNavigation } from '@/lib/activityTracker';

const RealtimeTracker = () => {
  const { user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (user) {
      trackUserPresence(user.uid, user.email);
    } 
  }, [user]);

  useEffect(() => {
    if (user) {
        trackUserNavigation(user.uid, location.pathname);
    }
  }, [user, location]);

  return null;
};

export default RealtimeTracker;
