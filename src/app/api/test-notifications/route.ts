import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: NextRequest) {
  try {
    const { userType, userId } = await request.json();

    if (!userType || !userId) {
      return NextResponse.json({ error: 'userType and userId are required' }, { status: 400 });
    }

    // Create notifications for all user types if 'all' is specified
    const userTypes = userType === 'all' ? ['admin', 'employee', 'user'] : [userType];
    const sampleNotifications = [];

    for (const type of userTypes) {
      const notifications = [
        {
          recipient_type: type,
          recipient_id: type === 'admin' ? '00000000-0000-0000-0000-000000000001' : userId,
          type: 'new_request',
          title: 'New Service Request',
          message: 'A new laptop repair request has been submitted and requires attention',
          priority: 'high'
        },
        {
          recipient_type: type,
          recipient_id: type === 'admin' ? '00000000-0000-0000-0000-000000000001' : userId,
          type: 'status_update',
          title: 'Request Status Updated',
          message: 'Request status has been changed to "in progress"',
          priority: 'normal'
        },
        {
          recipient_type: type,
          recipient_id: type === 'admin' ? '00000000-0000-0000-0000-000000000001' : userId,
          type: 'request_completed',
          title: 'Service Completed',
          message: 'A repair service has been completed successfully',
          priority: 'high'
        }
      ];
      sampleNotifications.push(...notifications);
    }

    // Insert sample notifications
    const { data, error } = await supabaseAdmin
      .from('notifications')
      .insert(sampleNotifications)
      .select();

    if (error) {
      console.error('Error creating test notifications:', error);
      return NextResponse.json({ error: 'Failed to create test notifications' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Created ${data.length} test notifications for ${userType}`,
      notifications: data 
    });

  } catch (error) {
    console.error('Test notifications API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}