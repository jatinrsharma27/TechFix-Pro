import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: NextRequest) {
  try {
    // Create sample notifications for all user types
    const notifications = [
      // Admin notifications
      {
        recipient_type: 'admin',
        recipient_id: '00000000-0000-0000-0000-000000000001',
        type: 'new_request',
        title: 'New Service Request',
        message: 'A new laptop repair request requires assignment',
        priority: 'high'
      },
      // Employee notifications (using a sample employee ID)
      {
        recipient_type: 'employee',
        recipient_id: '00000000-0000-0000-0000-000000000002',
        type: 'engineer_assigned',
        title: 'New Assignment',
        message: 'You have been assigned a new repair request',
        priority: 'normal'
      },
      // User notifications (using a sample user ID)
      {
        recipient_type: 'user',
        recipient_id: '00000000-0000-0000-0000-000000000003',
        type: 'request_created',
        title: 'Request Created',
        message: 'Your repair request has been submitted successfully',
        priority: 'normal'
      }
    ];

    console.log('Attempting to create notifications:', notifications);
    
    const { data, error } = await supabaseAdmin
      .from('notifications')
      .insert(notifications)
      .select();

    if (error) {
      console.error('Error creating notifications:', error);
      return NextResponse.json({ 
        error: 'Failed to create notifications', 
        details: error.message,
        code: error.code 
      }, { status: 500 });
    }

    console.log('Successfully created notifications:', data);

    return NextResponse.json({ 
      success: true, 
      message: `Created ${data.length} sample notifications`,
      notifications: data 
    });

  } catch (error) {
    console.error('Sample notifications API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}