import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { notifyAllParties } from '@/lib/notifyAllParties';

export async function POST(request: NextRequest) {
  try {
    console.log('Update status API called');
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Unauthorized request');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { requestId, status } = await request.json();
    console.log('Request data:', { requestId, status });

    // Validate required fields
    if (!requestId || !status) {
      console.log('Missing required fields');
      return NextResponse.json({ error: 'Request ID and status are required' }, { status: 400 });
    }

    // Validate status
    const validStatuses = ['pending', 'in-progress', 'completed', 'cancelled', 'assigned', 'pending-confirmation'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Update request status in contacts table
    const updateData: any = { status };
    
    // If status is cancelled, also remove the assignment
    if (status === 'cancelled') {
      updateData.assigned_to = null;
    }

    const { data, error } = await supabaseAdmin
      .from('contacts')
      .update(updateData)
      .eq('id', requestId)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating request status:', error);
      return NextResponse.json({ 
        error: 'Failed to update request status',
        details: error.message 
      }, { status: 500 });
    }

    console.log('Status updated successfully:', data);
    
    // Send notifications using the new system
    try {
        // Get request details for notifications
      const { data: requestData } = await supabaseAdmin
        .from('contacts')
        .select('full_name, service, assigned_to')
        .eq('id', requestId)
        .single();

      // Notify all parties about status update
      await notifyAllParties({
        requestId,
        employeeId: requestData?.assigned_to,
        type: status === 'completed' ? 'request_completed' : 'status_update',
        userTitle: status === 'completed' ? 'Service Completed' : 'Status Updated',
        userMessage: `Your ${requestData?.service || 'service'} request status: ${status}`,
        adminTitle: 'Status Updated',
        adminMessage: `${requestData?.full_name || 'Customer'}'s request updated to: ${status}`,
        employeeTitle: requestData?.assigned_to ? 'Request Status Updated' : undefined,
        employeeMessage: requestData?.assigned_to ? `Request for ${requestData.full_name} updated to: ${status}` : undefined,
        priority: status === 'completed' ? 'high' : 'normal'
      });
    } catch (notificationError) {
      console.error('Notification failed:', notificationError);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Request status updated successfully',
      request: data
    });

  } catch (error) {
    console.error('Update request status API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

