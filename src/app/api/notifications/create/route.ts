import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { 
      type, 
      requestId, 
      userId, 
      title, 
      message, 
      priority = 'normal' 
    } = await request.json();

    // Create notifications for all relevant parties
    const notifications = [];

    // 1. Notify all admins
    const { data: admins } = await supabase
      .from('admin')
      .select('id');

    if (admins && admins.length > 0) {
      for (const admin of admins) {
        notifications.push(
          supabase
            .from('admin_notifications')
            .insert({
              admin_id: admin.id,
              contact_id: userId,
              type: type === 'request_created' ? 'new_request' : 'pending_requests',
              title,
              message,
              priority
            })
        );
      }
    } else {
      // Skip admin notifications if no admins found
      console.log('No admins found, skipping admin notifications');
    }

    // 2. Notify user if userId provided
    if (userId) {
      notifications.push(
        supabase
          .from('user_notifications')
          .insert({
            user_id: userId,
            request_id: requestId,
            type,
            title,
            message,
            priority
          })
      );
    }

    // 3. Notify assigned employee if request has assignment
    if (requestId) {
      const { data: request } = await supabase
        .from('service_requests')
        .select('assigned_to')
        .eq('id', requestId)
        .single();

      if (request?.assigned_to) {
        notifications.push(
          supabase
            .from('employee_notifications')
            .insert({
              employee_id: request.assigned_to,
              title,
              message,
              type,
              priority
            })
        );
      }
    }

    // Execute all notifications
    await Promise.all(notifications);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Notification creation error:', error);
    return NextResponse.json({ error: 'Failed to create notifications' }, { status: 500 });
  }
}