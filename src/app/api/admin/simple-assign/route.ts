import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: NextRequest) {
  try {
    const { requestId, employeeId } = await request.json();
    
    if (!requestId || !employeeId) {
      return NextResponse.json({ error: 'Missing requestId or employeeId' }, { status: 400 });
    }

    // Update contacts table
    const { data: contactData, error: contactError } = await supabaseAdmin
      .from('contacts')
      .update({ 
        assigned_to: employeeId,
        status: 'pending-confirmation'
      })
      .eq('id', requestId)
      .select()
      .single();

    if (contactError) {
      return NextResponse.json({ error: contactError.message }, { status: 500 });
    }

    // Create employee_requests record with expiration
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
    const { data: empReqData, error: empReqError } = await supabaseAdmin
      .from('employee_requests')
      .insert({
        employee_id: employeeId,
        request_id: requestId,
        status: 'pending-confirmation',
        expires_at: expiresAt.toISOString()
      })
      .select()
      .single();

    if (empReqError) {
      return NextResponse.json({ error: empReqError.message }, { status: 500 });
    }

    // Create notifications for assignment
    try {
      // Create employee notification
      await supabaseAdmin.from('employee_notifications').insert({
        employee_id: employeeId,
        request_id: requestId,
        type: 'request_assigned',
        title: 'New Request Assigned',
        message: 'You have been assigned a new repair request',
        priority: 'normal'
      });
      
      // Create user notification
      await supabaseAdmin.from('user_notifications').insert({
        user_id: requestId,
        request_id: requestId,
        type: 'request_assigned',
        title: 'Request Assigned',
        message: 'Your request has been assigned to a technician',
        priority: 'normal',
        read: false
      });
    } catch (notifError) {
      console.error('Notification failed:', notifError);
    }

    return NextResponse.json({ 
      success: true,
      request: contactData,
      employeeRequest: empReqData
    });

  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}