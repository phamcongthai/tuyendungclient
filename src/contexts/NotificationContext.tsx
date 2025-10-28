import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { io } from 'socket.io-client';
import { notificationsApi, type Notification } from '../apis/notifications.api';
import { useUser } from './UserContext';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  isConnected: boolean;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  
  const { user } = useUser();

  // Initialize socket for client namespace
  useEffect(() => {
    if (!user?.id) return;

    const s = io(`${import.meta.env.VITE_API_URL}/notifications`, {
      transports: ['websocket'],
      autoConnect: true,
    });

    s.on('connect', async () => {
      setIsConnected(true);
      s.emit('clientJoin', { clientId: user.id });
      try {
        await refreshNotifications();
      } catch {}
    });

    s.on('disconnect', () => {
      setIsConnected(false);
    });

    s.on('newNotification', (notification: Notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    return () => {
      s.close();
    };
  }, [user?.id]);

  const refreshNotifications = async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const data = await notificationsApi.getNotifications(user.id);
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.isRead).length);
    } catch (e) {
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    await notificationsApi.updateNotification(notificationId, { isRead: true });
    setNotifications(prev => prev.map(n => n._id === notificationId ? { ...n, isRead: true, readAt: new Date().toISOString() } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    if (!user?.id) return;
    await notificationsApi.markAllAsRead(user.id);
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true, readAt: new Date().toISOString() })));
    setUnreadCount(0);
  };

  const deleteNotification = async (notificationId: string) => {
    await notificationsApi.deleteNotification(notificationId);
    setNotifications(prev => prev.filter(n => n._id !== notificationId));
  };

  const value: NotificationContextType = useMemo(() => ({
    notifications,
    unreadCount,
    isLoading,
    isConnected,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications,
  }), [notifications, unreadCount, isLoading, isConnected]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within a NotificationProvider');
  return context;
};


