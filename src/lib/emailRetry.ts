import { supabaseAdmin } from './supabaseAdmin';
import { sendEmailNotification } from './emailService';

export async function retryFailedEmails() {
  try {
    // Get failed emails that haven't exceeded retry limit
    const { data: failedEmails, error } = await supabaseAdmin
      .from('email_notifications')
      .select('*')
      .eq('delivery_status', 'failed')
      .lt('retry_count', 3)
      .order('created_at', { ascending: true })
      .limit(10);

    if (error) {
      console.error('Error fetching failed emails:', error);
      return;
    }

    if (!failedEmails || failedEmails.length === 0) {
      console.log('No failed emails to retry');
      return;
    }

    console.log(`Retrying ${failedEmails.length} failed emails`);

    for (const emailRecord of failedEmails) {
      try {
        // Prepare email data for retry
        const emailData = {
          recipientEmail: emailRecord.recipient_email,
          recipientType: emailRecord.recipient_type,
          recipientId: emailRecord.recipient_id,
          emailType: emailRecord.email_type,
          subject: emailRecord.subject,
          content: emailRecord.email_content,
          userNotificationId: emailRecord.user_notification_id,
          adminNotificationId: emailRecord.admin_notification_id,
          employeeNotificationId: emailRecord.employee_notification_id
        };

        // Update retry count first
        await supabaseAdmin
          .from('email_notifications')
          .update({ 
            retry_count: (emailRecord.retry_count || 0) + 1,
            delivery_status: 'retrying'
          })
          .eq('id', emailRecord.id);

        // Attempt to send email
        const success = await sendEmailNotification(emailData);

        if (success) {
          console.log(`Successfully retried email to ${emailRecord.recipient_email}`);
        } else {
          console.log(`Retry failed for email to ${emailRecord.recipient_email}`);
        }

      } catch (retryError) {
        console.error(`Error retrying email ${emailRecord.id}:`, retryError);
        
        // Update with retry failure
        await supabaseAdmin
          .from('email_notifications')
          .update({ 
            delivery_status: 'failed',
            error_message: retryError instanceof Error ? retryError.message : 'Unknown error'
          })
          .eq('id', emailRecord.id);
      }
    }

  } catch (error) {
    console.error('Error in retry process:', error);
  }
}

// Function to check email delivery status
export async function getEmailDeliveryStats() {
  try {
    const { data: stats, error } = await supabaseAdmin
      .from('email_notifications')
      .select('delivery_status')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    if (error) {
      console.error('Error fetching email stats:', error);
      return null;
    }

    const statusCounts: Record<string, number> = stats.reduce((acc: Record<string, number>, email: any) => {
      acc[email.delivery_status] = (acc[email.delivery_status] || 0) + 1;
      return acc;
    }, {});

    return {
      total: stats.length,
      sent: statusCounts.sent || 0,
      failed: statusCounts.failed || 0,
      pending: statusCounts.pending || 0,
      retrying: statusCounts.retrying || 0
    };

  } catch (error) {
    console.error('Error getting email stats:', error);
    return null;
  }
}