import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: NextRequest) {
  try {
    console.log('=== TESTING DIRECT NOTIFICATION INSERT ===');
    
    const testNotifications = [
      {
        recipient_type: 'user',
        recipient_id: '01645668-8c07-491b-9485-717483a206d4',
        request_id: '93a5be33-7c3d-4d7e-b545-9462ea9db1ab',
        type: 'status_update',
        title: 'Your Request Status Updated',
        message: 'Your tablet repair request has been accepted by our technician',
        priority: 'normal'
      },
      {
        recipient_type: 'admin',
        recipient_id: '00000000-0000-0000-0000-000000000001',
        request_id: '93a5be33-7c3d-4d7e-b545-9462ea9db1ab',
        type: 'new_request',
        title: 'New Service Request',
        message: 'A new repair request requires your attention',
        priority: 'high'
      },
      {
        recipient_type: 'employee',
        recipient_id: '00000000-0000-0000-0000-000000000002',
        request_id: '93a5be33-7c3d-4d7e-b545-9462ea9db1ab',
        type: 'engineer_assigned',
        title: 'New Assignment',
        message: 'You have been assigned a new repair request',
        priority: 'normal'
      }
    ];
    
    console.log('Inserting:', testNotifications);
    
    const { data, error } = await supabaseAdmin
      .from('notifications')
      .insert(testNotifications)
      .select();

    console.log('Insert result:', { data, error });

    if (error) {
      console.error('Insert failed:', error);
      return NextResponse.json({ 
        success: false,
        error: error.message, 
        code: error.code,
        details: error.details,
        hint: error.hint
      });
    }

    console.log('Insert successful!');
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ success: false, error: 'Server error' });
  }
}