import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    console.log('=== USER NOTIFICATIONS FETCH DEBUG ===');
    console.log('Requested userId:', userId);

    if (!userId) {
      console.log('No userId provided, returning empty array');
      return NextResponse.json({ notifications: [] });
    }

    const { data: notifications, error } = await supabaseAdmin
      .from('notifications')
      .select('*')
      .eq('recipient_type', 'user')
      .eq('recipient_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    console.log('Database query result:', { notifications, error });
    console.log('Found notifications count:', notifications?.length || 0);

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    const formattedNotifications = notifications?.map(n => ({
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      priority: n.priority,
      read: n.read,
      timestamp: n.created_at,
      request_id: n.request_id
    })) || [];
    
    console.log('Returning formatted notifications:', formattedNotifications);
    console.log('=== END USER NOTIFICATIONS DEBUG ===');

    return NextResponse.json({ notifications: formattedNotifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ notifications: [] });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { notificationId } = await request.json();

    const { error } = await supabaseAdmin
      .from('notifications')
      .update({ 
        read: true,
        read_at: new Date().toISOString()
      })
      .eq('id', notificationId)
      .eq('recipient_type', 'user');

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json({ success: false });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { notificationId } = await request.json();

    const { error } = await supabaseAdmin
      .from('notifications')
      .delete()
      .eq('id', notificationId)
      .eq('recipient_type', 'user');

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return NextResponse.json({ success: false });
  }
}