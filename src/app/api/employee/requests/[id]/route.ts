import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: requestId } = await params;

    // Get contact details directly
    const { data: contact, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', requestId)
      .single();

    if (error || !contact) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    // Fetch work completion and payment details
    const { data: workCompletion, error: workError } = await supabase
      .from('work_completion_payments')
      .select('*')
      .eq('request_id', requestId)
      .single();

    return NextResponse.json({ 
      request: {
        ...contact,
        work_completion: workCompletion || null
      }
    });

  } catch (error) {
    console.error('Error fetching request details:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}