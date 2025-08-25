import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request: NextRequest) {
  try {
    const employeeId = '00000000-0000-0000-0000-000000000002'; // Default employee ID

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
        created_at: n.created_at
      })) || [] 
    });
  } catch (error) {
    console.error('Error fetching employee notifications:', error);
    return NextResponse.json({ notifications: [] });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { notificationId } = await request.json();
    const employeeId = '00000000-0000-0000-0000-000000000002';

    const { error } = await supabaseAdmin
      .from('notifications')
      .update({ 
        read: true,
        read_at: new Date().toISOString()
      })
      .eq('id', notificationId)
      .eq('recipient_type', 'employee')
      .eq('recipient_id', employeeId);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { notificationId } = await request.json();
    const employeeId = '00000000-0000-0000-0000-000000000002';

    const { error } = await supabaseAdmin
      .from('notifications')
      .delete()
      .eq('id', notificationId)
      .eq('recipient_type', 'employee')
      .eq('recipient_id', employeeId);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false });
  }
}