interface NotificationData {
  recipient_type: 'admin' | 'employee' | 'user';
  recipient_id: string;
  request_id?: string;
  type: 'new_request' | 'pending_requests' | 'daily_summary' | 'request_created' | 'status_update' | 'engineer_assigned' | 'request_completed' | 'system';
  title: string;
  message: string;
  priority?: 'low' | 'normal' | 'high';
}

export async function sendNotification(data: NotificationData) {
  try {
    const response = await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.ok;
  } catch (error) {
    console.error('Failed to send notification:', error);
    return false;
  }
}

export async function getNotifications(userType: 'admin' | 'employee' | 'user', userId: string) {
  try {
    const response = await fetch(`/api/notifications?userType=${userType}&userId=${userId}`);
    if (response.ok) {
      const data = await response.json();
      return data;
    }
    return { notifications: [] };
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    return { notifications: [] };
  }
}

export async function markNotificationAsRead(notificationId: string) {
  try {
    const response = await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notificationId }),
    });
    return response.ok;
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
    return false;
  }
}

export async function deleteNotification(notificationId: string) {
  try {
    const response = await fetch('/api/notifications', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notificationId }),
    });
    return response.ok;
  } catch (error) {
    console.error('Failed to delete notification:', error);
    return false;
  }
}