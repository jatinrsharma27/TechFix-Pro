import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: NextRequest) {
  try {
    // Find expired assignments
    const { data: expiredAssignments, error: expiredError } = await supabaseAdmin
      .from('employee_requests')
      .select('request_id, employee_id')
      .eq('status', 'pending-confirmation')
      .lt('expires_at', new Date().toISOString());

    if (expiredError) {
      console.error('Error finding expired assignments:', expiredError);
      return NextResponse.json({ error: 'Failed to find expired assignments' }, { status: 500 });
    }

    if (!expiredAssignments || expiredAssignments.length === 0) {
      return NextResponse.json({ message: 'No expired assignments found' });
    }

    for (const assignment of expiredAssignments) {
      // Remove expired assignment
      await supabaseAdmin
        .from('employee_requests')
        .delete()
        .eq('request_id', assignment.request_id)
        .eq('employee_id', assignment.employee_id);

      // Find next available employee (not busy)
      const { data: availableEmployees, error: employeeError } = await supabaseAdmin
        .from('employees')
        .select('id')
        .neq('status', 'busy')
        .limit(1);

      if (employeeError || !availableEmployees || availableEmployees.length === 0) {
        // Reset to pending if no employees available
        await supabaseAdmin
          .from('contacts')
          .update({ 
            assigned_to: null,
            status: 'pending'
          })
          .eq('id', assignment.request_id);
        continue;
      }

      const nextEmployeeId = availableEmployees[0].id;
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

      // Assign to next employee
      await supabaseAdmin
        .from('contacts')
        .update({ 
          assigned_to: nextEmployeeId,
          status: 'pending-confirmation'
        })
        .eq('id', assignment.request_id);

      // Create new employee_requests record
      await supabaseAdmin
        .from('employee_requests')
        .insert({
          employee_id: nextEmployeeId,
          request_id: assignment.request_id,
          status: 'pending-confirmation',
          assigned_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString()
        });

      // Notify new employee
      await supabaseAdmin.from('employee_notifications').insert({
        employee_id: nextEmployeeId,
        request_id: assignment.request_id,
        type: 'request_assigned',
        title: 'New Request Assigned',
        message: 'You have been assigned a new repair request (auto-reassigned)',
        priority: 'high'
      });
    }

    return NextResponse.json({ 
      success: true, 
      reassigned: expiredAssignments.length,
      message: `Reassigned ${expiredAssignments.length} expired requests`
    });

  } catch (error) {
    console.error('Auto-reassign error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}