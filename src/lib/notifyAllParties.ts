import { createNotification } from './createNotification';

interface NotifyAllPartiesParams {
  requestId: string;
  employeeId?: string;
  type: 'new_request' | 'status_update' | 'engineer_assigned' | 'request_completed';
  userTitle: string;
  userMessage: string;
  adminTitle: string;
  adminMessage: string;
  employeeTitle?: string;
  employeeMessage?: string;
  priority?: 'low' | 'normal' | 'high';
}

export async function notifyAllParties(params: NotifyAllPartiesParams) {
  const notifications = [];

  // User notification
  notifications.push(createNotification({
    recipient_type: 'user',
    recipient_id: params.requestId,
    request_id: params.requestId,
    type: params.type,
    title: params.userTitle,
    message: params.userMessage,
    priority: params.priority || 'normal'
  }));

  // Admin notification
  notifications.push(createNotification({
    recipient_type: 'admin',
    recipient_id: '00000000-0000-0000-0000-000000000001',
    request_id: params.requestId,
    type: params.type,
    title: params.adminTitle,
    message: params.adminMessage,
    priority: params.priority || 'normal'
  }));

  // Employee notification (if employee exists and message provided)
  if (params.employeeId && params.employeeTitle && params.employeeMessage) {
    notifications.push(createNotification({
      recipient_type: 'employee',
      recipient_id: params.employeeId,
      request_id: params.requestId,
      type: params.type,
      title: params.employeeTitle,
      message: params.employeeMessage,
      priority: params.priority || 'normal'
    }));
  }

  // Execute all notifications
  await Promise.all(notifications);
}