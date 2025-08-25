import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: NextRequest) {
  try {
    console.log('Testing direct email_notifications insert...');

    // Test direct insert
    const testData = {
      recipient_email: 'test@example.com',
      recipient_type: 'user',
      recipient_id: '123e4567-e89b-12d3-a456-426614174000',
      email_type: 'status_updated',
      subject: 'Test Email',
      email_content: 'Test content',
      delivery_status: 'pending'
    };

    console.log('Test data:', JSON.stringify(testData, null, 2));

    const { data, error } = await supabaseAdmin
      .from('email_notifications')
      .insert(testData)
      .select()
      .single();

    if (error) {
      console.error('Insert error:', JSON.stringify(error, null, 2));
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        details: error 
      });
    }

    console.log('Insert successful:', data);

    return NextResponse.json({
      success: true,
      message: 'Test insert successful',
      data
    });

  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json({ 
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}