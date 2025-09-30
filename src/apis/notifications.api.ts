import { http } from './http';

export interface Notification {
  _id: string;
  userId: string;
  message: string;
  type:
    | 'NEW_APPLICATION'
    | 'APPLICATION_VIEWED'
    | 'APPLICATION_PASSED'
    | 'APPLICATION_REJECTED'
    | 'INTERVIEW_INVITED'
    | 'INTERVIEW_RESULT'
    | 'OFFER_SENT'
    | 'OFFER_RESPONSE'
    | 'HIRED'
    | 'SYSTEM'
    | 'MESSAGE'
    | 'OTHER';
  isRead: boolean;
  readAt?: string;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateNotificationDto {
  isRead?: boolean;
  message?: string;
}

export const notificationsApi = {
  getNotifications: async (userId: string): Promise<Notification[]> => {
    const response = await http.get(`/notifications?userId=${userId}&audience=client`);
    return response.data;
  },

  getUnreadCount: async (userId: string): Promise<number> => {
    const response = await http.get(`/notifications/unread-count/${userId}`);
    return response.data?.unreadCount ?? 0;
  },

  updateNotification: async (id: string, data: UpdateNotificationDto): Promise<Notification> => {
    const response = await http.patch(`/notifications/${id}`, data);
    return response.data;
  },

  markAllAsRead: async (userId: string): Promise<void> => {
    await http.patch(`/notifications/mark-all-read/${userId}`, {});
  },

  deleteNotification: async (id: string): Promise<void> => {
    await http.delete(`/notifications/${id}`);
  },
};


