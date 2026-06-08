import { create } from 'zustand';
import api from '@/services/api';
import { Notification } from '@/types';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  addRealtimeNotification: (notification: Notification) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,

  fetchNotifications: async () => {
    set({ loading: true });
    try {
      const res = await api.get('/notifications');
      set({ 
        notifications: res.data.notifications, 
        unreadCount: res.data.unreadCount,
        loading: false 
      });
    } catch (err) {
      console.error('Failed to fetch notifications');
      set({ loading: false });
    }
  },

  markAsRead: async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      set({
        notifications: get().notifications.map(n => n.id === id ? { ...n, isRead: true } : n),
        unreadCount: Math.max(0, get().unreadCount - 1)
      });
    } catch (err) {
      console.error('Failed to mark notification as read');
    }
  },

  markAllAsRead: async () => {
    try {
      await api.put('/notifications/mark-all-read');
      set({
        notifications: get().notifications.map(n => ({ ...n, isRead: true })),
        unreadCount: 0
      });
    } catch (err) {
      console.error('Failed to mark all notifications as read');
    }
  },

  deleteNotification: async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      const wasUnread = !get().notifications.find(n => n.id === id)?.isRead;
      set({
        notifications: get().notifications.filter(n => n.id !== id),
        unreadCount: wasUnread ? Math.max(0, get().unreadCount - 1) : get().unreadCount
      });
    } catch (err) {
      console.error('Failed to delete notification');
    }
  },

  addRealtimeNotification: (notification) => {
    set({
      notifications: [notification, ...get().notifications],
      unreadCount: get().unreadCount + 1
    });
  }
}));
