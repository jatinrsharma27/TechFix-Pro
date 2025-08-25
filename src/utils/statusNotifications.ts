import { sendNotification } from '@/lib/notifications';

interface RequestStatusUpdate {
  requestId: string;
  userId: string;
  employeeId?: string;
  adminId?: string;
  oldStatus: string;
  newStatus: string;
  customerName: string;
  serviceType: string;
}

export async function sendStatusUpdateNotifications({
  requestId,
  userId,
  employeeId,
  adminId,
  oldStatus,
  newStatus,
  customerName,
  serviceType
}: RequestStatusUpdate) {
  const notifications = [];

  // Notification to customer
  notifications.push(sendNotification({
    recipient_type: 'user',
    recipient_id: userId,
    request_id: requestId,
    type: 'status_update',
    title: 'Request Status Updated',
    message: `Your ${serviceType} request status changed from "${oldStatus}" to "${newStatus}"`,
    priority: newStatus === 'completed' ? 'high' : 'normal'
  }));

  // Notification to assigned employee (if exists and status relevant)
  if (employeeId && ['in_progress', 'completed', 'cancelled'].includes(newStatus)) {
    notifications.push(sendNotification({
      recipient_type: 'employee',
      recipient_id: employeeId,
      request_id: requestId,
      type: 'status_update',
      title: 'Request Status Updated',
      message: `Request for ${customerName} (${serviceType}) status changed to "${newStatus}"`,
      priority: newStatus === 'cancelled' ? 'high' : 'normal'
    }));
  }

  // Notification to admin for important status changes
  if (adminId && ['completed', 'cancelled'].includes(newStatus)) {
    notifications.push(sendNotification({
      recipient_type: 'admin',
      recipient_id: adminId,
      request_id: requestId,
      type: 'status_update',
      title: 'Request Status Updated',
      message: `Request from ${customerName} (${serviceType}) has been ${newStatus}`,
      priority: 'normal'
    }));
  }

  // Wait for all notifications to be sent
  await Promise.all(notifications);
}

export async function sendNewRequestNotification({
  requestId,
  userId,
  adminId,
  customerName,
  serviceType,
  priority = 'normal'
}: {
  requestId: string;
  userId: string;
  adminId: string;
  customerName: string;
  serviceType: string;
  priority?: 'low' | 'normal' | 'high';
}) {
  const notifications = [];

  // Notification to customer
  notifications.push(sendNotification({
    recipient_type: 'user',
    recipient_id: userId,
    request_id: requestId,
    type: 'request_created',
    title: 'Service Request Created',
    message: `Your ${serviceType} request has been submitted and is being reviewed`,
    priority
  }));

  // Notification to admin
  notifications.push(sendNotification({
    recipient_type: 'admin',
    recipient_id: adminId,
    request_id: requestId,
    type: 'new_request',
    title: 'New Service Request',
    message: `New ${serviceType} request from ${customerName} requires assignment`,
    priority: 'high'
  }));

  await Promise.all(notifications);
}

export async function sendEngineerAssignedNotification({
  requestId,
  userId,
  employeeId,
  customerName,
  employeeName,
  serviceType
}: {
  requestId: string;
  userId: string;
  employeeId: string;
  customerName: string;
  employeeName: string;
  serviceType: string;
}) {
  const notifications = [];

  // Notification to customer
  notifications.push(sendNotification({
    recipient_type: 'user',
    recipient_id: userId,
    request_id: requestId,
    type: 'engineer_assigned',
    title: 'Engineer Assigned',
    message: `${employeeName} has been assigned to your ${serviceType} request`,
    priority: 'normal'
  }));

  // Notification to employee
  notifications.push(sendNotification({
    recipient_type: 'employee',
    recipient_id: employeeId,
    request_id: requestId,
    type: 'engineer_assigned',
    title: 'New Request Assigned',
    message: `You have been assigned a ${serviceType} request from ${customerName}`,
    priority: 'high'
  }));

  await Promise.all(notifications);
}

export async function sendRequestCompletedNotification({
  requestId,
  userId,
  adminId,
  customerName,
  serviceType,
  completionNotes
}: {
  requestId: string;
  userId: string;
  adminId: string;
  customerName: string;
  serviceType: string;
  completionNotes?: string;
}) {
  const notifications = [];

  // Notification to customer
  notifications.push(sendNotification({
    recipient_type: 'user',
    recipient_id: userId,
    request_id: requestId,
    type: 'request_completed',
    title: 'Service Request Completed',
    message: `Your ${serviceType} request has been completed${completionNotes ? ': ' + completionNotes : ''}`,
    priority: 'high'
  }));

  // Notification to admin
  notifications.push(sendNotification({
    recipient_type: 'admin',
    recipient_id: adminId,
    request_id: requestId,
    type: 'request_completed',
    title: 'Request Completed',
    message: `${serviceType} request for ${customerName} has been completed`,
    priority: 'normal'
  }));

  await Promise.all(notifications);
}