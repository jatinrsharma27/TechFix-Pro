import { NextRequest, NextResponse } from 'next/server';
import { createNotificationWithEmail, getAllAdmins } from '@/lib/notificationEmailHelper';

export async function POST(request: NextRequest) {
  try {
    const { requestId } = await request.json();

    if (!requestId) {
      return NextResponse.json({ error: 'Request ID is required' }, { status: 400 });
    }

    // Test data
    const testRequestData = {
      requestId: requestId,
      customerName: 'Test Customer',
      deviceType: 'Laptop',
      serviceType: 'Screen Repair',
      status: 'pending'
    };

    // Get admins
    const admins = await getAllAdmins();

    // Send test notification with email
    const result = await createNotificationWithEmail(
      'request_created',
      testRequestData,
      {
        users: [requestId],
        admins: admins.slice(0, 1)
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully',
      result
    });

  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json({ 
      error: 'Failed to send test email',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}