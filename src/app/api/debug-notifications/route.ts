import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request: NextRequest) {
  try {
    // Check if notifications table exists and get its structure
    const { data: tableInfo, error: tableError } = await supabaseAdmin
      .from('notifications')
      .select('*')
      .limit(1);

    if (tableError) {
      return NextResponse.json({ 
        error: 'Table access error', 
        details: tableError.message,
        code: tableError.code 
      });
    }

    // Get count of existing notifications
    const { count, error: countError } = await supabaseAdmin
      .from('notifications')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({ 
      tableExists: true,
      notificationCount: count,
      sampleData: tableInfo
    });

  } catch (error) {
    console.error('Debug notifications error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Test direct insertion with valid schema types
    const testNotification = {
      recipient_type: 'admin',
      recipient_id: '00000000-0000-0000-0000-000000000001',
      type: 'system',
      title: 'Test Notification',
      message: 'This is a test notification to verify database insertion',
      priority: 'normal'
    };

    console.log('Inserting test notification:', testNotification);

    const { data, error } = await supabaseAdmin
      .from('notifications')
      .insert(testNotification)
      .select();

    if (error) {
      console.error('Insert error:', error);
      return NextResponse.json({ 
        success: false,
        error: error.message,
        code: error.code,
        details: error.details
      });
    }

    console.log('Insert successful:', data);

    return NextResponse.json({ 
      success: true,
      data: data[0]
    });

  } catch (error) {
    console.error('Debug insert error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}