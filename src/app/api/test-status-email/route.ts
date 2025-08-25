import { NextRequest, NextResponse } from 'next/server';
import { createNotificationWithEmail, getAllAdmins } from '@/lib/notificationEmailHelper';

export async function POST(request: NextRequest) {
  try {
    const { requestId } = await request.json();
    
    if (!requestId) {
      return NextResponse.json({ error: 'Request ID is required' }, { status: 400 });
    }

    console.log('Testing status update email for request:', requestId);

    // Get all admins
    const admins = await getAllAdmins();
    console.log('Found admins:', admins);

    // Test recipients
    const recipients = {
      users: [requestId],
      admins: admins,
      employees: [] // Add employee ID if needed for testing
    };

    // Test status update notification with email
    const result = await createNotificationWithEmail(
      'status_updated',
      {
        requestId,
        customerName: 'Test Customer',
        serviceType: 'Test Service',
        status: 'in-progress'
      },
      recipients
    );

    console.log('Notification result:', result);

    return NextResponse.json({
      success: true,
      message: 'Test status update email sent',
      result
    });

  } catch (error) {
    console.error('Test status email error:', error);
    return NextResponse.json({ 
      error: 'Failed to send test email',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}