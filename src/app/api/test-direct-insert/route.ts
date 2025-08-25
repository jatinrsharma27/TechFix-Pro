import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: NextRequest) {
  try {
    console.log('=== DIRECT INSERT TEST ===');
    
    const testData = {
      recipient_type: 'user',
      recipient_id: '01645668-8c07-491b-9485-717483a206d4',
      request_id: null,
      type: 'request_created',
      title: 'Direct Test Notification',
      message: 'This is a direct test to verify table insertion works',
      priority: 'normal'
    };

    console.log('Inserting data:', testData);

    const { data, error } = await supabaseAdmin
      .from('notifications')
      .insert(testData)
      .select();

    console.log('Insert result:', { data, error });

    if (error) {
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        code: error.code,
        details: error.details 
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Direct insert successful',
      data 
    });

  } catch (error) {
    console.error('Direct insert error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Server error' 
    });
  }
}