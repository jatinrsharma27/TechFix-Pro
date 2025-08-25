import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const requestId = searchParams.get('requestId');

    if (!requestId) {
      return NextResponse.json({ error: 'Request ID is required' }, { status: 400 });
    }

    // Get request details
    const { data: requestData, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', requestId)
      .single();

    if (error || !requestData) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    return NextResponse.json({ request: requestData });

  } catch (error) {
    console.error('Error fetching completion details:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    const { requestId, title, workDetails, customerName, customerEmail, totalAmount } = await request.json();

    if (!token || !token.startsWith('employee_')) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    const employeeId = token.replace('employee_', '').split('_')[0];

    // Store work completion with payment
    const { data: completionData, error: completionError } = await supabase
      .from('work_completion_payments')
      .insert({
        request_id: requestId,
        employee_id: employeeId,
        title,
        work_details: workDetails,
        customer_name: customerName,
        customer_email: customerEmail,
        total_payment_amount: totalAmount,
        submitted_by: employeeId
      })
      .select()
      .single();

    if (completionError) {
      console.error('Completion storage error:', completionError);
      return NextResponse.json({ error: 'Failed to store completion data' }, { status: 500 });
    }

    // Update request status to completed
    const { error: updateError } = await supabase
      .from('contacts')
      .update({ 
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', requestId);

    if (updateError) {
      console.error('Status update error:', updateError);
      return NextResponse.json({ error: 'Failed to update request status' }, { status: 500 });
    }

    return NextResponse.json({ success: true, completionId: completionData.id });

  } catch (error) {
    console.error('Error storing completion details:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}