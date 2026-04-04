import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMyNotificationsApi } from '../api/notificationsApi';

export function useNotifications(pollInterval = 60000) {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    const fetchCount = () => {
      getMyNotificationsApi({ limit: 1 })
        .then((res) => setUnreadCount(res.data.unread_count ?? 0))
        .catch(() => {});
    };

    fetchCount();
    const interval = setInterval(fetchCount, pollInterval);
    return () => clearInterval(interval);
  }, [user, pollInterval]);

  return { unreadCount, setUnreadCount };
}
