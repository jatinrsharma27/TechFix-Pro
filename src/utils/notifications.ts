// Notification utility functions
export const createNotification = async (data: {
  type: string;
  requestId?: string;
  userId?: string;
  title: string;
  message: string;
  priority?: 'low' | 'normal' | 'high';
}) => {
  try {
    const response = await fetch('/api/notifications/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create notification');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Notification types and templates
export const NotificationTemplates = {
  NEW_REQUEST: (customerName: string, deviceType: string) => ({
    type: 'new_request',
    title: 'New Service Request',
    message: `${customerName} has submitted a new ${deviceType} repair request`,
    priority: 'normal' as const,
  }),

  STATUS_UPDATE: (requestId: string, status: string, customerName: string) => ({
    type: 'status_update',
    title: 'Request Status Updated',
    message: `Request #${requestId.slice(-8)} for ${customerName} is now ${status}`,
    priority: 'normal' as const,
  }),

  ENGINEER_ASSIGNED: (engineerName: string, customerName: string) => ({
    type: 'engineer_assigned',
    title: 'Engineer Assigned',
    message: `${engineerName} has been assigned to ${customerName}'s request`,
    priority: 'normal' as const,
  }),

  REQUEST_COMPLETED: (customerName: string, deviceType: string) => ({
    type: 'request_completed',
    title: 'Request Completed',
    message: `${customerName}'s ${deviceType} repair has been completed`,
    priority: 'high' as const,
  }),
};