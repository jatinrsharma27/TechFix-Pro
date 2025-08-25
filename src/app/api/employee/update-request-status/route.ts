import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { notifyAllParties } from '@/lib/notifyAllParties';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    if (!token.startsWith('employee_')) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    // Extract employee ID from token format: employee_<uuid>_<timestamp>
    const employeeId = token.replace('employee_', '').split('_')[0];
    const { requestId, action } = await request.json();

    let newStatus: string;
    console.log('=== EMPLOYEE STATUS UPDATE ===');
    
    // Get request details for notifications
    const { data: requestData } = await supabaseAdmin
      .from('contacts')
      .select('user_id, full_name, service')
      .eq('id', requestId)
      .single();

    switch (action) {
      case 'accept':
        newStatus = 'assigned';
        await supabaseAdmin.from('contacts').update({ status: newStatus }).eq('id', requestId);
        await supabaseAdmin.from('employee_requests').update({ status: 'assigned', assigned_at: new Date().toISOString() }).eq('request_id', requestId).eq('employee_id', employeeId);
        
        await notifyAllParties({
          requestId,
          employeeId,
          type: 'status_update',
          userTitle: 'Request Accepted',
          userMessage: `Your ${requestData?.service || 'service'} request has been accepted`,
          adminTitle: 'Request Accepted',
          adminMessage: `Employee accepted ${requestData?.full_name || 'customer'}'s ${requestData?.service || 'service'} request`,
          priority: 'normal'
        });
        break;
        
      case 'start':
        newStatus = 'in-progress';
        await supabaseAdmin.from('contacts').update({ status: newStatus }).eq('id', requestId);
        await supabaseAdmin.from('employee_requests').update({ status: 'in-progress', started_at: new Date().toISOString() }).eq('request_id', requestId).eq('employee_id', employeeId);
        
        await notifyAllParties({
          requestId,
          employeeId,
          type: 'status_update',
          userTitle: 'Work Started',
          userMessage: `Work has started on your ${requestData?.service || 'service'} request`,
          adminTitle: 'Work Started',
          adminMessage: `Employee started work on ${requestData?.full_name || 'customer'}'s ${requestData?.service || 'service'} request`,
          priority: 'normal'
        });
        break;
        
      case 'complete':
        newStatus = 'completed';
        await supabaseAdmin.from('contacts').update({ status: newStatus }).eq('id', requestId);
        await supabaseAdmin.from('employee_requests').update({ status: 'completed', completed_at: new Date().toISOString() }).eq('request_id', requestId).eq('employee_id', employeeId);
        
        await notifyAllParties({
          requestId,
          employeeId,
          type: 'request_completed',
          userTitle: 'Service Completed',
          userMessage: `Your ${requestData?.service || 'service'} request has been completed`,
          adminTitle: 'Service Completed',
          adminMessage: `Employee completed ${requestData?.full_name || 'customer'}'s ${requestData?.service || 'service'} request`,
          priority: 'high'
        });
        break;
        
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: `Request ${action}ed successfully`, status: newStatus });
  } catch (error) {
    console.error('Error in update-request-status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}