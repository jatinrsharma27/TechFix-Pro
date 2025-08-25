import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { notifyAllParties } from '@/lib/notifyAllParties';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { requestId, employeeId } = await request.json();
    console.log('Assignment request:', { requestId, employeeId });

    // Validate required fields
    if (!requestId || !employeeId) {
      return NextResponse.json({ error: 'Request ID and Employee ID are required' }, { status: 400 });
    }

    // Validate that the employee exists
    const { data: employeeExists, error: employeeCheckError } = await supabaseAdmin
      .from('employees')
      .select('id, full_name, email')
      .eq('id', employeeId)
      .single();

    if (employeeCheckError || !employeeExists) {
      console.error('Employee validation error:', employeeCheckError);
      return NextResponse.json({ error: 'Invalid employee ID' }, { status: 400 });
    }

    // Validate that the request exists
    const { data: requestExists, error: requestCheckError } = await supabaseAdmin
      .from('contacts')
      .select('id, full_name, service, user_id')
      .eq('id', requestId)
      .single();
      
    console.log('Request validation:', { requestExists, requestCheckError });

    if (requestCheckError || !requestExists) {
      console.error('Request validation error:', requestCheckError);
      return NextResponse.json({ error: 'Invalid request ID' }, { status: 400 });
    }

    // Remove any existing employee_requests for this request (for reassignment)
    await supabaseAdmin
      .from('employee_requests')
      .delete()
      .eq('request_id', requestId);

    // Create new employee_requests record
    const { data: employeeRequestData, error: employeeRequestError } = await supabaseAdmin
      .from('employee_requests')
      .insert({
        employee_id: employeeId,
        request_id: requestId,
        status: 'assigned'
      })
      .select('*')
      .single();

    if (employeeRequestError) {
      console.error('Employee request operation error:', employeeRequestError);
      return NextResponse.json({ 
        error: 'Failed to create/update employee request assignment', 
        details: employeeRequestError.message 
      }, { status: 500 });
    }

    // Update the contact/request with the assigned employee
    const { data: requestData, error: contactError } = await supabaseAdmin
      .from('contacts')
      .update({
        assigned_to: employeeId,
        status: 'assigned'
      })
      .eq('id', requestId)
      .select(`
        *,
        assigned_employee:employees!assigned_to(
          id,
          full_name,
          email
        )
      `)
      .single();
      
    console.log('Contact update result:', { requestData, contactError });

    if (contactError) {
      console.error('Contact update error:', contactError);
      // Rollback the employee_requests entry if contact update fails
      if (employeeRequestData?.id) {
        await supabaseAdmin
          .from('employee_requests')
          .delete()
          .eq('id', employeeRequestData.id);
      }
      
      return NextResponse.json({ 
        error: 'Failed to update request assignment', 
        details: contactError.message 
      }, { status: 500 });
    }

    // Send notifications to all parties
    try {
      // Notify all parties about assignment
      await notifyAllParties({
        requestId,
        employeeId,
        type: 'engineer_assigned',
        userTitle: 'Technician Assigned',
        userMessage: `${employeeExists.full_name} has been assigned to your ${requestExists.service || 'service'} request`,
        adminTitle: 'Employee Assigned',
        adminMessage: `${employeeExists.full_name} assigned to ${requestExists.full_name}'s ${requestExists.service || 'service'} request`,
        employeeTitle: 'New Assignment',
        employeeMessage: `You have been assigned a ${requestExists.service || 'service'} request from ${requestExists.full_name}`,
        priority: 'high'
      });
    } catch (notificationError) {
      console.error('Notification failed:', notificationError);
    }

    return NextResponse.json({
      success: true,
      message: 'Request assigned successfully',
      request: requestData,
      employeeRequest: employeeRequestData
    });
  } catch (error) {
    console.error('Assign request error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

async function sendAssignmentNotification(employeeId: string, request: any) {
  try {
    // Get employee details
    const { data: employeeData, error: employeeError } = await supabaseAdmin
      .from('employees')
      .select('email, full_name')
      .eq('id', employeeId)
      .single();

    if (employeeError) {
      console.error('Error fetching employee details:', employeeError);
      return;
    }

    // Create notification for employee
    const notification = {
      employee_id: employeeId,
      title: 'New Request - Confirmation Required',
      message: `You have a new ${request.service || 'service'} request from ${request.full_name}. Please accept or reject this assignment.`,
      type: 'assignment',
      priority: 'high',
      read: false,
      created_at: new Date().toISOString()
    };

    const { error: notificationError } = await supabaseAdmin
      .from('employee_notifications')
      .insert([notification]);

    if (notificationError) {
      console.error('Error creating notification:', notificationError);
    } else {
      console.log('Assignment notification sent to employee:', employeeData.email);
    }
  } catch (error) {
    console.error('Error sending assignment notification:', error);
  }
}