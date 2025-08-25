import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { sessionManager } from '@/lib/sessionManager';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    const { requestId, title, reason, details } = await request.json();

    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    // Extract employee ID from token
    if (!token.startsWith('employee_')) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    const employeeId = token.replace('employee_', '').split('_')[0];

    // Store in employee status forms for non-completed work
    if (reason !== 'work_completed') {
      const { data: formData, error: formError } = await supabase
        .from('employee_status_forms')
        .insert({
          request_id: requestId,
          employee_id: employeeId,
          form_type: reason,
          title,
          reason: title,
          details,
          submitted_by: employeeId
        })
        .select()
        .single();

      if (formError) {
        console.error('Form storage error:', formError);
        return NextResponse.json({ error: 'Failed to store status form' }, { status: 500 });
      }

      return NextResponse.json({ success: true, formId: formData.id });
    }

    // For completed work, we need payment info - return form ID for payment step
    return NextResponse.json({ success: true, needsPayment: true, requestId });

  } catch (error) {
    console.error('Error completing work:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}