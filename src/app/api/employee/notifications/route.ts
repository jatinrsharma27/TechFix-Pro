import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');

    if (!employeeId) {
      return NextResponse.json({ error: 'Missing employeeId parameter' }, { status: 400 });
    }

    const { data: notifications, error } = await supabaseAdmin
      .from('notifications')
      .select('*')
      .eq('recipient_type', 'employee')
      .eq('recipient_id', employeeId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    return NextResponse.json({ 
      notifications: notifications?.map(n => ({
        id: n.id,
        type: n.type,
        title: n.title,
        message: n.message,
        priority: n.priority,
        read: n.read,
        timestamp: n.created_at,
        request_id: n.request_id
      })) || [] 
    });
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
      .eq('recipient_type', 'employee');

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
      .eq('recipient_type', 'employee');

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return NextResponse.json({ success: false });
  }
}