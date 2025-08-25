import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    // Test direct insert to email_notifications table
    const testData = {
      recipient_email: email || 'test@example.com',
      recipient_type: 'user',
      recipient_id: '00000000-0000-0000-0000-000000000000',
      email_type: 'test',
      subject: 'Test Email',
      email_content: '<p>Test email content</p>',
      delivery_status: 'pending'
    };

    console.log('Attempting to insert:', testData);

    const { data, error } = await supabaseAdmin
      .from('email_notifications')
      .insert(testData)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('Insert successful:', data);
    return NextResponse.json({ success: true, data });

  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}