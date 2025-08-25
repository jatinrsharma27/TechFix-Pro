// /api/employee/confirm-request/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { createNotificationWithEmail, getAllAdmins } from '@/lib/notificationEmailHelper';

function getEmployeeIdFromToken(authHeader: string): string | null {
  try {
    const token = authHeader.replace('Bearer ', '');
    const parts = token.split('_');
    if (parts.length >= 2 && parts[0] === 'employee') {
      return parts[1];
    }
    return null;
  } catch (error) {
    console.error('Error parsing token:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get employee ID from token
    const employeeId = getEmployeeIdFromToken(authHeader);
    if (!employeeId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { requestId, action } = await request.json();

    // Validate required fields
    if (!requestId || !action) {
      return NextResponse.json({ error: 'Request ID and action are required' }, { status: 400 });
    }

    // Validate action
    if (!['confirm', 'cancel'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action. Must be "confirm" or "cancel"' }, { status: 400 });
    }

    // Check if the employee_request exists and belongs to this employee
    const { data: employeeRequest, error: fetchError } = await supabaseAdmin
      .from('employee_requests')
      .select('*')
      .eq('request_id', requestId)
      .eq('employee_id', employeeId)
      .single();

    if (fetchError || !employeeRequest) {
      return NextResponse.json({ 
        error: 'Request not found or not assigned to this employee' 
      }, { status: 404 });
    }

    let newStatus: string;
    let contactStatus: string;
    let updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (action === 'confirm') {
      newStatus = 'assigned';
      contactStatus = 'assigned';
      updateData.started_at = new Date().toISOString();
    } else {
      newStatus = 'cancelled';
      contactStatus = 'pending';
      updateData.completed_at = new Date().toISOString();
    }

    // Update employee_requests table
    const { data: updatedEmployeeRequest, error: updateEmployeeError } = await supabaseAdmin
      .from('employee_requests')
      .update({
        status: newStatus,
        ...updateData
      })
      .eq('id', employeeRequest.id)
      .select('*')
      .single();

    if (updateEmployeeError) {
      console.error('Error updating employee request:', updateEmployeeError);
      return NextResponse.json({ error: 'Failed to update employee request' }, { status: 500 });
    }

    // Update contacts table
    const contactUpdateData: any = {
      status: contactStatus,
      updated_at: new Date().toISOString()
    };

    // If employee cancelled, remove assignment
    if (action === 'cancel') {
      contactUpdateData.assigned_to = null;
    }

    const { data: updatedContact, error: updateContactError } = await supabaseAdmin
      .from('contacts')
      .update(contactUpdateData)
      .eq('id', requestId)
      .select('*')
      .single();

    if (updateContactError) {
      console.error('Error updating contact:', updateContactError);
      return NextResponse.json({ error: 'Failed to update request status' }, { status: 500 });
    }

    // Send notifications and emails to all parties
    try {
      const admins = await getAllAdmins();
      const { data: employee } = await supabaseAdmin
        .from('employees')
        .select('full_name')
        .eq('id', employeeId)
        .single();

      const notificationType = action === 'confirm' ? 'request_accepted' : 'request_rejected';
      
      await createNotificationWithEmail(
        notificationType,
        {
          requestId,
          customerName: updatedContact.full_name,
          employeeName: employee?.full_name,
          serviceType: updatedContact.service,
          status: contactStatus,
          message: action === 'cancel' ? 'The assigned technician is not available. We will assign another technician soon.' : undefined
        },
        {
          users: [requestId],
          admins: admins
        }
      );
    } catch (notificationError) {
      console.error('Notification/Email failed (non-critical):', notificationError);
    }

    return NextResponse.json({
      success: true,
      message: `Request ${action}ed successfully`,
      employeeRequest: updatedEmployeeRequest,
      request: updatedContact
    });
  } catch (error) {
    console.error('Employee confirm/cancel request error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function sendAdminNotification(employeeRequest: any, request: any, action: string) {
  try {
    // Get employee details
    const { data: employeeData, error: employeeError } = await supabaseAdmin
      .from('employees')
      .select('full_name, email')
      .eq('id', employeeRequest.employee_id)
      .single();

    if (employeeError) {
      console.error('Error fetching employee details:', employeeError);
      return;
    }

    // Create notification for admin
    const notification = {
      title: `Request Assignment ${action === 'confirm' ? 'Confirmed' : 'Declined'}`,
      message: `${employeeData.full_name} has ${action}ed the assignment for request from ${request.full_name}`,
      type: 'assignment_response',
      priority: action === 'cancel' ? 'high' : 'normal',
      read: false,
      created_at: new Date().toISOString(),
      // Add admin_id or other identifier as needed
    };

    // Insert admin notification - adjust table name as needed
    const { error: notificationError } = await supabaseAdmin
      .from('admin_notifications')
      .insert([notification]);

    if (notificationError) {
      console.error('Error creating admin notification:', notificationError);
    } else {
      console.log(`Admin notification sent for ${action}ed assignment`);
    }
  } catch (error) {
    console.error('Error sending admin notification:', error);
  }
}