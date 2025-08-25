import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { requestId, title, reason, details } = await request.json();

    // Store cancellation form data
    const { error: cancellationError } = await supabaseAdmin
      .from('admin_cancellation_forms')
      .insert({
        request_id: requestId,
        admin_id: '00000000-0000-0000-0000-000000000000',
        title: title,
        reason: reason,
        details: details
      });
      
    if (cancellationError) {
      console.error('Error storing cancellation form:', cancellationError);
      throw cancellationError;
    }

    // Update request status to cancelled
    await supabaseAdmin
      .from('contacts')
      .update({ status: 'cancelled', assigned_to: null })
      .eq('id', requestId);

    // Delete employee_requests entry if exists
    await supabaseAdmin
      .from('employee_requests')
      .delete()
      .eq('request_id', requestId);

    // Get contact data for notifications
    const { data: contactData } = await supabaseAdmin
      .from('contacts')
      .select('service, full_name')
      .eq('id', requestId)
      .single();

    // Send notifications directly to all tables
    try {
      // Admin notification
      const { data: adminData } = await supabaseAdmin.from('admin').select('id').limit(1).single();
      if (adminData) {
        await supabaseAdmin.from('admin_notifications').insert({
          admin_id: adminData.id,
          type: 'system',
          title: 'Request Cancelled',
          message: `${contactData?.service || 'Service'} request cancelled: ${title}`,
          priority: 'normal'
        });
      }

      // User notification - use the contact's ID as user_id
      const { data: contactUser } = await supabaseAdmin
        .from('contacts')
        .select('id')
        .eq('id', requestId)
        .single();
      
      if (contactUser) {
        await supabaseAdmin.from('user_notifications').insert({
          user_id: contactUser.id,
          request_id: requestId,
          type: 'status_update',
          title: 'Request Cancelled',
          message: `Your ${contactData?.service || 'device'} repair request has been cancelled: ${title}`,
          priority: 'high'
        });
      }

      // Employee notification (if there was an assigned employee)
      const { data: employeeData } = await supabaseAdmin
        .from('employee_requests')
        .select('employee_id')
        .eq('request_id', requestId)
        .single();
      
      if (employeeData) {
        await supabaseAdmin.from('employee_notifications').insert({
          employee_id: employeeData.employee_id,
          type: 'status_update',
          title: 'Request Cancelled',
          message: `Request cancelled by admin: ${title}`,
          priority: 'normal'
        });
      }
    } catch (notificationError) {
      console.error('Failed to send notifications:', notificationError);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Request cancelled successfully'
    });
  } catch (error) {
    console.error('Error cancelling request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}