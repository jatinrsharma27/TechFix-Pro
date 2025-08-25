import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

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
    const { requestId, title, reason, details } = await request.json();

    // Get contact and employee data
    const { data: contactData } = await supabaseAdmin
      .from('contacts')
      .select('service, full_name')
      .eq('id', requestId)
      .single();

    const { data: employeeData } = await supabaseAdmin
      .from('employees')
      .select('full_name')
      .eq('id', employeeId)
      .single();

    // Update request status based on reason
    if (reason === 'cancelled') {
      // Cancel request - remove assignment, admin needs to reassign
      await supabaseAdmin
        .from('contacts')
        .update({ status: 'pending', assigned_to: null })
        .eq('id', requestId);
      
      // Delete employee_requests entry
      await supabaseAdmin
        .from('employee_requests')
        .delete()
        .eq('request_id', requestId)
        .eq('employee_id', employeeId);
    } else if (reason === 'on_hold') {
      // On Hold - keep employee assigned but set status to on_hold
      await supabaseAdmin
        .from('contacts')
        .update({ status: 'on_hold' })
        .eq('id', requestId);
      
      // Keep employee_requests entry but update status
      await supabaseAdmin
        .from('employee_requests')
        .update({ status: 'on_hold' })
        .eq('request_id', requestId)
        .eq('employee_id', employeeId);
    }

    // Store report form data in proper table
    const { error: reportError } = await supabaseAdmin
      .from('request_completion_forms')
      .insert({
        request_id: requestId,
        employee_id: employeeId,
        title: title,
        reason: reason,
        details: details
      });
      
    if (reportError) {
      console.error('Error storing report form:', reportError);
      throw reportError;
    }

    // Send notifications directly to all tables
    try {
      const statusText = reason === 'cancelled' ? 'cancelled' : 'on hold';
      
      // Admin notification
      await supabaseAdmin.from('admin_notifications').insert({
        admin_id: (await supabaseAdmin.from('admin').select('id').limit(1).single()).data?.id,
        type: 'system',
        title: 'Issue Reported',
        message: `${employeeData?.full_name || 'Employee'} reported issue: ${title} - Status changed to ${statusText}`,
        priority: 'high'
      });

      // User notification
      await supabaseAdmin.from('user_notifications').insert({
        user_id: requestId,
        type: 'status_update',
        title: 'Request Update',
        message: `Issue reported for your ${contactData?.service || 'device'} repair: ${title}`,
        priority: 'high'
      });

      // Employee notification
      await supabaseAdmin.from('employee_notifications').insert({
        employee_id: employeeId,
        type: 'status_update',
        title: 'Issue Reported',
        message: `You reported an issue: ${title} - Status changed to ${statusText}`,
        priority: 'normal'
      });
    } catch (notificationError) {
      console.error('Failed to send notifications:', notificationError);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Issue reported successfully'
    });
  } catch (error) {
    console.error('Error reporting issue:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}