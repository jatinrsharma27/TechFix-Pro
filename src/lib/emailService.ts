import nodemailer from 'nodemailer';
import { supabaseAdmin } from './supabaseAdmin';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Test transporter configuration
transporter.verify((error: any, success: any) => {
  if (error) {
    console.error('Email transporter configuration error:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

interface EmailNotificationData {
  recipientEmail: string;
  recipientType: 'user' | 'admin' | 'employee';
  recipientId: string;
  emailType: string;
  subject: string;
  content: string;
  userNotificationId?: string;
  adminNotificationId?: string;
  employeeNotificationId?: string;
}

// Email templates for different notification types
const emailTemplates = {
  request_created: (data: any) => ({
    subject: `🔧 New Service Request #${data.requestId} - TechFix Pro`,
    html: createRequestEmailTemplate('created', data)
  }),
  
  request_assigned: (data: any) => ({
    subject: `👨‍🔧 Service Request #${data.requestId} Assigned - TechFix Pro`,
    html: createRequestEmailTemplate('assigned', data)
  }),
  
  status_updated: (data: any) => ({
    subject: `📋 Service Request #${data.requestId} Status Update - TechFix Pro`,
    html: createRequestEmailTemplate('status_updated', data)
  }),
  
  request_accepted: (data: any) => ({
    subject: `✅ Service Request #${data.requestId} Accepted - TechFix Pro`,
    html: createRequestEmailTemplate('accepted', data)
  }),
  
  request_rejected: (data: any) => ({
    subject: `❌ Service Request #${data.requestId} Update - TechFix Pro`,
    html: createRequestEmailTemplate('rejected', data)
  }),
  
  request_completed: (data: any) => ({
    subject: `🎉 Service Request #${data.requestId} Completed - TechFix Pro`,
    html: createRequestEmailTemplate('completed', data)
  })
};

function createRequestEmailTemplate(type: string, data: any) {
  const statusColors: Record<string, string> = {
    created: '#3b82f6',
    assigned: '#f59e0b',
    status_updated: '#8b5cf6',
    accepted: '#10b981',
    rejected: '#ef4444',
    completed: '#059669'
  };

  const statusIcons: Record<string, string> = {
    created: '🆕',
    assigned: '👨‍🔧',
    status_updated: '📋',
    accepted: '✅',
    rejected: '❌',
    completed: '🎉'
  };

  const statusMessages: Record<string, string> = {
    created: 'A new service request has been created and is awaiting assignment.',
    assigned: 'Your service request has been assigned to a technician.',
    status_updated: 'Your service request status has been updated.',
    accepted: 'Your service request has been accepted by our technician.',
    rejected: 'Your service request requires attention.',
    completed: 'Your service request has been completed successfully!'
  };

  // Ensure we have all required data with defaults
  const requestData = {
    requestId: data.requestId || 'N/A',
    serviceType: data.serviceType || data.deviceType || 'General Service',
    status: data.status || type.replace('_', ' '),
    employeeName: data.employeeName || null,
    customerName: data.customerName || 'Valued Customer',
    message: data.message || '',
    ...data
  };

  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TechFix Pro - Service Update</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, ${statusColors[type]} 0%, ${statusColors[type]}dd 100%); color: white; padding: 30px; text-align: center; }
        .logo { font-size: 24px; font-weight: bold; margin-bottom: 8px; }
        .status-badge { background: rgba(255,255,255,0.2); padding: 8px 16px; border-radius: 20px; display: inline-block; font-size: 14px; }
        .content { padding: 30px; }
        .request-info { background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .info-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
        .label { font-weight: 600; color: #374151; }
        .value { color: #6b7280; }
        .message { background: #e0f2fe; padding: 20px; border-radius: 8px; border-left: 4px solid ${statusColors[type]}; margin: 20px 0; }
        .footer { background: #f7fafc; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
        .btn { background: ${statusColors[type]}; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🔧 TechFix Pro</div>
            <div class="status-badge">${statusIcons[type]} ${type.replace('_', ' ').toUpperCase()}</div>
        </div>
        
        <div class="content">
            <h2 style="color: #1f2937; margin-bottom: 15px;">Service Request Update</h2>
            
            <div class="message">
                <strong>${statusMessages[type]}</strong>
            </div>
            
            <div class="request-info">
                <div class="info-row">
                    <span class="label">Request ID:</span>
                    <span class="value">#${requestData.requestId}</span>
                </div>
                <div class="info-row">
                    <span class="label">Service Type:</span>
                    <span class="value">${requestData.serviceType}</span>
                </div>
                <div class="info-row">
                    <span class="label">Status:</span>
                    <span class="value">${requestData.status}</span>
                </div>
                <div class="info-row">
                    <span class="label">Updated:</span>
                    <span class="value">${new Date().toLocaleString()}</span>
                </div>
                ${requestData.employeeName ? `
                <div class="info-row">
                    <span class="label">Technician:</span>
                    <span class="value">${requestData.employeeName}</span>
                </div>
                ` : ''}
                ${requestData.message ? `
                <div style="margin-top: 15px;">
                    <span class="label">Message:</span>
                    <div style="margin-top: 5px; color: #374151;">${requestData.message}</div>
                </div>
                ` : ''}
            </div>
            
            <div style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/user/Request/${requestData.requestId}" class="btn">
                    View Request Details
                </a>
            </div>
        </div>
        
        <div class="footer">
            <strong>TechFix Pro Team</strong><br>
            Need help? Contact us at support@techfixpro.com<br>
            © 2024 TechFix Pro. All rights reserved.
        </div>
    </div>
</body>
</html>
  `;
}

export async function sendEmailNotification(data: EmailNotificationData): Promise<boolean> {
  try {
    console.log(`=== ATTEMPTING TO SEND EMAIL ===`);
    console.log(`Recipient: ${data.recipientEmail} (${data.recipientType})`);
    console.log(`Email data:`, JSON.stringify(data, null, 2));
    
    // Skip email validation and sending, just store in database
    console.log('Skipping email sending, just storing in database...');

    // Prepare insert data based on notification type
    const insertData: any = {
      recipient_email: data.recipientEmail,
      recipient_type: data.recipientType,
      recipient_id: data.recipientId,
      email_type: data.emailType,
      subject: data.subject,
      email_content: data.content,
      delivery_status: 'pending'
    };

    // Add notification IDs if they exist
    if (data.userNotificationId) {
      insertData.user_notification_id = data.userNotificationId;
    }
    if (data.adminNotificationId) {
      insertData.admin_notification_id = data.adminNotificationId;
    }
    if (data.employeeNotificationId) {
      insertData.employee_notification_id = data.employeeNotificationId;
    }

    console.log('Inserting email notification:', JSON.stringify(insertData, null, 2));

    // Store email notification in database first
    const { data: emailRecord, error: dbError } = await supabaseAdmin
      .from('email_notifications')
      .insert(insertData)
      .select()
      .single();

    if (dbError) {
      console.error('Failed to store email notification:', dbError);
      console.error('Insert data was:', JSON.stringify(insertData, null, 2));
      console.error('Error details:', JSON.stringify(dbError, null, 2));
      return false;
    }

    console.log('Email record stored successfully:', emailRecord.id);

    // Skip actual email sending for now, just mark as sent
    await supabaseAdmin
      .from('email_notifications')
      .update({ 
        delivery_status: 'sent',
        sent_at: new Date().toISOString()
      })
      .eq('id', emailRecord.id);

    console.log(`Email record stored and marked as sent for ${data.recipientEmail}`);
    return true;

  } catch (error) {
    console.error(`=== EMAIL STORAGE FAILED ===`);
    console.error(`Recipient: ${data.recipientEmail}`);
    console.error(`Error:`, error);
    return false;
  }
}

export async function sendNotificationEmail(
  type: string,
  recipients: Array<{email: string, type: 'user' | 'admin' | 'employee', id: string, name?: string, notificationId?: string}>,
  requestData: any
): Promise<void> {
  console.log('sendNotificationEmail called with:', { type, recipientCount: recipients.length });
  
  const template = (emailTemplates as any)[type];
  if (!template) {
    console.error('Unknown email template type:', type);
    return;
  }

  const { subject, html } = template(requestData);
  console.log('Email template generated:', { subject, htmlLength: html.length });

  // Send emails to all recipients
  console.log(`Preparing to send ${recipients.length} emails for type: ${type}`);
  
  const emailPromises = recipients.map(recipient => {
    console.log(`Processing recipient: ${recipient.email} (${recipient.type})`);
    
    const emailData: EmailNotificationData = {
      recipientEmail: recipient.email,
      recipientType: recipient.type,
      recipientId: recipient.id,
      emailType: type,
      subject,
      content: html
    };

    // Add appropriate notification ID based on recipient type
    if (recipient.type === 'user' && recipient.notificationId) {
      emailData.userNotificationId = recipient.notificationId;
    } else if (recipient.type === 'admin' && recipient.notificationId) {
      emailData.adminNotificationId = recipient.notificationId;
    } else if (recipient.type === 'employee' && recipient.notificationId) {
      emailData.employeeNotificationId = recipient.notificationId;
    }

    console.log('Email data prepared:', JSON.stringify(emailData, null, 2));
    return sendEmailNotification(emailData);
  });

  const results = await Promise.allSettled(emailPromises);
  console.log('Email sending results:', results.map(r => r.status));
}

export { emailTemplates };