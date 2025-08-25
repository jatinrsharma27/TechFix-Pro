import { supabase } from './supabaseClient';
import { sendMail } from './mailer';

interface NotificationData {
  type: string;
  title: string;
  message: string;
  requestId?: string;
  adminId?: string;
  userId?: string;
  employeeId?: string;
  priority?: 'low' | 'normal' | 'high';
  userEmail?: string;
  employeeEmail?: string;
  adminEmail?: string;
}

// Step 1: User Creates Request
export async function notifyRequestCreated(requestId: string, userId: string, userEmail: string, adminId: string = 'admin') {
  // User confirmation
  await sendNotification({
    type: 'request_created',
    title: 'Request Submitted Successfully',
    message: 'Your repair request has been submitted and is being reviewed by our team.',
    requestId,
    userId,
    userEmail,
    priority: 'normal'
  });

  // Admin notification
  await sendNotification({
    type: 'new_request',
    title: 'New Service Request',
    message: `New repair request submitted by customer. Request ID: ${requestId}`,
    requestId,
    adminId,
    priority: 'high'
  });
}

// Step 2: Admin Assigns Request to Employee
export async function notifyRequestAssigned(requestId: string, userId: string, userEmail: string, employeeId: string, employeeEmail: string, adminId: string = 'admin') {
  // Employee notification
  await sendNotification({
    type: 'engineer_assigned',
    title: 'New Work Request Assigned',
    message: `You have been assigned a new repair request. Please review and accept/reject.`,
    requestId,
    employeeId,
    employeeEmail,
    priority: 'high'
  });

  // User notification
  await sendNotification({
    type: 'status_update',
    title: 'Request Assigned to Technician',
    message: 'Your repair request has been assigned to a qualified technician.',
    requestId,
    userId,
    userEmail,
    priority: 'normal'
  });
}

// Step 2: Admin Cancels Request
export async function notifyRequestCancelled(requestId: string, userId: string, userEmail: string, reason: string) {
  await sendNotification({
    type: 'status_update',
    title: 'Request Cancelled',
    message: `Your repair request has been cancelled. Reason: ${reason}`,
    requestId,
    userId,
    userEmail,
    priority: 'high'
  });
}

// Step 3: Employee Accepts Work
export async function notifyWorkAccepted(requestId: string, userId: string, userEmail: string, employeeId: string, adminId: string = 'admin') {
  // Admin notification
  await sendNotification({
    type: 'status_update',
    title: 'Employee Accepted Request',
    message: `Technician has accepted the repair request and will begin work soon.`,
    requestId,
    adminId,
    priority: 'normal'
  });

  // User notification
  await sendNotification({
    type: 'status_update',
    title: 'Work Accepted',
    message: 'Great news! Your technician has accepted the work and will start the repair process.',
    requestId,
    userId,
    userEmail,
    priority: 'normal'
  });
}

// Step 3: Employee Rejects Work
export async function notifyWorkRejected(requestId: string, employeeId: string, adminId: string = 'admin', reason?: string) {
  await sendNotification({
    type: 'status_update',
    title: 'Employee Rejected Request',
    message: `Technician rejected the repair request${reason ? `. Reason: ${reason}` : ''}. Reassignment needed.`,
    requestId,
    adminId,
    priority: 'high'
  });
}

// Step 3: Admin Reassigns Request
export async function notifyRequestReassigned(requestId: string, userId: string, userEmail: string, newEmployeeId: string, newEmployeeEmail: string) {
  // New employee notification
  await sendNotification({
    type: 'engineer_assigned',
    title: 'New Work Request Assigned',
    message: 'You have been assigned a repair request that was reassigned from another technician.',
    requestId,
    employeeId: newEmployeeId,
    employeeEmail: newEmployeeEmail,
    priority: 'high'
  });

  // User notification
  await sendNotification({
    type: 'status_update',
    title: 'Request Reassigned',
    message: 'Your repair request has been reassigned to another qualified technician.',
    requestId,
    userId,
    userEmail,
    priority: 'normal'
  });
}

// Step 4: Employee Starts Work
export async function notifyWorkStarted(requestId: string, userId: string, userEmail: string, employeeId: string, adminId: string = 'admin') {
  // Admin notification
  await sendNotification({
    type: 'status_update',
    title: 'Work Started',
    message: 'Technician has started working on the repair request.',
    requestId,
    adminId,
    priority: 'normal'
  });

  // User notification
  await sendNotification({
    type: 'status_update',
    title: 'Work Started',
    message: 'Your technician has started working on your device repair.',
    requestId,
    userId,
    userEmail,
    priority: 'normal'
  });
}

// Step 5: Work Completed
export async function notifyWorkCompleted(requestId: string, userId: string, userEmail: string, employeeId: string, adminId: string = 'admin') {
  // Admin notification
  await sendNotification({
    type: 'request_completed',
    title: 'Work Completed Successfully',
    message: 'Repair work has been completed successfully by the technician.',
    requestId,
    adminId,
    priority: 'normal'
  });

  // User notification
  await sendNotification({
    type: 'request_completed',
    title: 'Repair Completed!',
    message: 'Great news! Your device repair has been completed successfully. Please arrange pickup.',
    requestId,
    userId,
    userEmail,
    priority: 'high'
  });
}

// Step 5: Work Cancelled by Employee/Admin
export async function notifyWorkCancelledByEmployee(requestId: string, userId: string, userEmail: string, employeeId: string, adminId: string = 'admin', reason?: string) {
  // Admin notification
  await sendNotification({
    type: 'status_update',
    title: 'Work Cancelled by Technician',
    message: `Technician cancelled the repair work${reason ? `. Reason: ${reason}` : ''}.`,
    requestId,
    adminId,
    priority: 'high'
  });

  // User notification
  await sendNotification({
    type: 'status_update',
    title: 'Work Cancelled',
    message: `Unfortunately, your repair work has been cancelled${reason ? `. Reason: ${reason}` : ''}. We will contact you soon.`,
    requestId,
    userId,
    userEmail,
    priority: 'high'
  });
}

// Step 5: Work Marked as Pending/Issue
export async function notifyWorkPending(requestId: string, userId: string, userEmail: string, employeeId: string, adminId: string = 'admin', issue?: string) {
  // Admin notification
  await sendNotification({
    type: 'status_update',
    title: 'Work Pending - Issue Reported',
    message: `Technician reported an issue with the repair${issue ? `: ${issue}` : ''}.`,
    requestId,
    adminId,
    priority: 'high'
  });

  // User notification (optional - might not want to worry user)
  await sendNotification({
    type: 'status_update',
    title: 'Repair Update',
    message: 'There is a minor delay with your repair. Our team is working to resolve it quickly.',
    requestId,
    userId,
    userEmail,
    priority: 'normal'
  });
}

// Core notification function
async function sendNotification(data: NotificationData) {
  try {
    const notifications = [];

    // Send to admin if adminId provided
    if (data.adminId) {
      notifications.push({
        recipient_type: 'admin',
        recipient_id: data.adminId,
        request_id: data.requestId || null,
        type: data.type,
        title: data.title,
        message: data.message,
        priority: data.priority || 'normal'
      });
    }

    // Send to user if userId provided
    if (data.userId) {
      notifications.push({
        recipient_type: 'user',
        recipient_id: data.userId,
        request_id: data.requestId || null,
        type: data.type,
        title: data.title,
        message: data.message,
        priority: data.priority || 'normal'
      });

      // Send email to user if email provided
      if (data.userEmail) {
        try {
          await sendMail(
            data.userEmail,
            data.title,
            `<h2>${data.title}</h2><p>${data.message}</p><p>Request ID: ${data.requestId}</p>`
          );
        } catch (emailError) {
          console.error('Failed to send user email:', emailError);
        }
      }
    }

    // Send to employee if employeeId provided
    if (data.employeeId) {
      notifications.push({
        recipient_type: 'employee',
        recipient_id: data.employeeId,
        request_id: data.requestId || null,
        type: data.type,
        title: data.title,
        message: data.message,
        priority: data.priority || 'normal'
      });

      // Send email to employee if email provided
      if (data.employeeEmail) {
        try {
          await sendMail(
            data.employeeEmail,
            data.title,
            `<h2>${data.title}</h2><p>${data.message}</p><p>Request ID: ${data.requestId}</p>`
          );
        } catch (emailError) {
          console.error('Failed to send employee email:', emailError);
        }
      }
    }

    if (notifications.length > 0) {
      const { error } = await supabase
        .from('notifications')
        .insert(notifications);

      if (error) {
        console.error('Error sending notifications:', error);
      }
    }
  } catch (error) {
    console.error('Notification error:', error);
  }
}