import { NextRequest, NextResponse } from 'next/server';
import { sendNotificationEmail } from '@/lib/emailService';

export async function POST(request: NextRequest) {
  try {
    const { email, type = 'request_created' } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Test email data
    const testData = {
      requestId: 'TEST-001',
      customerName: 'Test User',
      deviceType: 'Laptop',
      serviceType: 'Repair',
      status: 'pending',
      employeeName: 'Test Technician',
      message: 'This is a test email notification'
    };

    const testRecipients = [{
      email: email,
      type: 'user' as const,
      id: 'test-user-id',
      name: 'Test User'
    }];

    // Send test email
    await sendNotificationEmail(type, testRecipients, testData);

    return NextResponse.json({ 
      success: true, 
      message: `Test email sent to ${email}` 
    });

  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json({ 
      error: 'Failed to send test email',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}