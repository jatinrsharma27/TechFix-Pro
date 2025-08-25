import { supabaseAdmin } from './supabaseAdmin';
import { sendNotificationEmail } from './emailService';

interface NotificationRecipient {
  id: string;
  email: string;
  name?: string;
  type: 'user' | 'admin' | 'employee';
  notificationId?: string;
}

export async function createNotificationWithEmail(
  type: 'request_created' | 'request_assigned' | 'status_updated' | 'request_accepted' | 'request_rejected' | 'request_completed',
  requestData: any,
  recipients: {
    users?: string[];
    admins?: string[];
    employees?: string[];
  }
) {
  try {
    console.log(`=== CREATE NOTIFICATION WITH EMAIL CALLED ===`);
    console.log(`Type: ${type}`);
    console.log(`Recipients:`, JSON.stringify(recipients, null, 2));
    console.log(`Request data:`, JSON.stringify(requestData, null, 2));
    const allRecipients: NotificationRecipient[] = [];

    // Create user notifications and collect recipients
    if (recipients.users?.length) {
      console.log(`Processing ${recipients.users.length} user recipients`);
      for (const userId of recipients.users) {
        // Get user details
        const { data: user, error: userError } = await supabaseAdmin
          .from('contacts')
          .select('email, full_name')
          .eq('id', userId)
          .single();

        if (userError) {
          console.error(`Failed to get user ${userId}:`, userError);
          continue;
        }

        if (user && user.email) {
          // Create notification in user_notifications table
          const { data: notification, error } = await supabaseAdmin
            .from('user_notifications')
            .insert({
              user_id: userId,
              type,
              title: getNotificationTitle(type, requestData),
              message: getNotificationMessage(type, requestData),
              request_id: requestData.requestId,
              priority: 'normal',
              read: false
            })
            .select()
            .single();

          if (!error && notification) {
            allRecipients.push({
              id: userId,
              email: user.email,
              name: user.full_name,
              type: 'user',
              notificationId: notification.id
            });
            console.log(`Added user recipient: ${user.email}`);
          } else {
            console.error(`Failed to create user notification for ${userId}:`, error);
          }
        } else {
          console.error(`User ${userId} not found or missing email`);
        }
      }
    }

    // Create admin notifications and collect recipients
    if (recipients.admins?.length) {
      console.log(`Processing ${recipients.admins.length} admin recipients`);
      for (const adminId of recipients.admins) {
        // Get admin details
        const { data: admin, error: adminError } = await supabaseAdmin
          .from('admin')
          .select('email, name')
          .eq('id', adminId)
          .single();

        if (adminError) {
          console.error(`Failed to get admin ${adminId}:`, adminError);
          continue;
        }

        if (admin && admin.email) {
          // Create notification in admin_notifications table
          const { data: notification, error } = await supabaseAdmin
            .from('admin_notifications')
            .insert({
              admin_id: adminId,
              contact_id: requestData.requestId,
              type: 'new_request',
              title: getNotificationTitle(type, requestData),
              message: getNotificationMessage(type, requestData),
              priority: 'normal',
              read: false
            })
            .select()
            .single();

          if (!error && notification) {
            allRecipients.push({
              id: adminId,
              email: admin.email,
              name: admin.name,
              type: 'admin',
              notificationId: notification.id
            });
            console.log(`Added admin recipient: ${admin.email}`);
          } else {
            console.error(`Failed to create admin notification for ${adminId}:`, error);
          }
        } else {
          console.error(`Admin ${adminId} not found or missing email`);
        }
      }
    }

    // Create employee notifications and collect recipients
    if (recipients.employees?.length) {
      console.log(`Processing ${recipients.employees.length} employee recipients`);
      for (const employeeId of recipients.employees) {
        // Get employee details
        const { data: employee, error: employeeError } = await supabaseAdmin
          .from('employees')
          .select('email, full_name')
          .eq('id', employeeId)
          .single();

        if (employeeError) {
          console.error(`Failed to get employee ${employeeId}:`, employeeError);
          continue;
        }

        if (employee && employee.email) {
          // Create notification in employee_notifications table
          const { data: notification, error } = await supabaseAdmin
            .from('employee_notifications')
            .insert({
              employee_id: employeeId,
              type,
              title: getNotificationTitle(type, requestData),
              message: getNotificationMessage(type, requestData),
              priority: 'normal',
              read: false
            })
            .select()
            .single();

          if (!error && notification) {
            allRecipients.push({
              id: employeeId,
              email: employee.email,
              name: employee.full_name,
              type: 'employee',
              notificationId: notification.id
            });
            console.log(`Added employee recipient: ${employee.email}`);
          } else {
            console.error(`Failed to create employee notification for ${employeeId}:`, error);
          }
        } else {
          console.error(`Employee ${employeeId} not found or missing email`);
        }
      }
    }

    // Send emails to all recipients
    console.log(`=== EMAIL SENDING SECTION ===`);
    console.log(`All recipients count: ${allRecipients.length}`);
    if (allRecipients.length > 0) {
      console.log(`Sending emails to ${allRecipients.length} recipients:`, allRecipients.map(r => r.email));
      console.log('Recipients data:', JSON.stringify(allRecipients, null, 2));
      console.log('About to call sendNotificationEmail...');
      await sendNotificationEmail(type, allRecipients, requestData);
      console.log('sendNotificationEmail completed');
    } else {
      console.log('No recipients found for email notifications');
    }

    return { success: true, recipientCount: allRecipients.length };

  } catch (error) {
    console.error('Error creating notifications with email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

function getNotificationTitle(type: string, data: any): string {
  const titles: Record<string, string> = {
    request_created: `New Service Request #${data.requestId}`,
    request_assigned: `Request #${data.requestId} Assigned`,
    status_updated: `Request #${data.requestId} Status Updated`,
    request_accepted: `Request #${data.requestId} Accepted`,
    request_rejected: `Request #${data.requestId} Needs Attention`,
    request_completed: `Request #${data.requestId} Completed`
  };
  return titles[type] || `Request #${data.requestId} Update`;
}

function getNotificationMessage(type: string, data: any): string {
  const messages: Record<string, string> = {
    request_created: `A new service request has been created and is awaiting assignment.`,
    request_assigned: `Your service request has been assigned to ${data.employeeName || 'a technician'}.`,
    status_updated: `Your service request status has been updated to: ${data.status}`,
    request_accepted: `Your service request has been accepted by ${data.employeeName || 'our technician'}.`,
    request_rejected: `Your service request requires attention. ${data.message || ''}`,
    request_completed: `Your service request has been completed successfully!`
  };
  return messages[type] || `Your service request has been updated.`;
}

// Helper function to get all admins
export async function getAllAdmins(): Promise<string[]> {
  const { data: admins } = await supabaseAdmin
    .from('admin')
    .select('id');
  
  return admins?.map(admin => admin.id) || [];
}

// Helper function to get available employees
export async function getAvailableEmployees(): Promise<string[]> {
  const { data: employees } = await supabaseAdmin
    .from('employees')
    .select('id')
    .eq('status', 'available');
  
  return employees?.map(emp => emp.id) || [];
}