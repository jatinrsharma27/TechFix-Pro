import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get total employees with error handling
    const { data: allEmployees, error: employeeError } = await supabaseAdmin
      .from('employees')
      .select('id, is_active');

    if (employeeError) {
      console.error('Error fetching employees:', employeeError);
    }

    const totalEmployees = allEmployees?.length || 0;

    // Get active employees (is_active = true)
    const activeEmployees = allEmployees?.filter(e => e.is_active === true).length || 0;

    // Get busy employees (those with active assignments from contacts table)
    const { data: activeRequests } = await supabaseAdmin
      .from('contacts')
      .select('assigned_employee_id')
      .in('status', ['in-progress', 'pending'])
      .not('assigned_employee_id', 'is', null);

    const uniqueBusyEmployees = [...new Set(activeRequests?.map(r => r.assigned_employee_id) || [])];
    const busyEmployees = uniqueBusyEmployees.length;

    // Get total assignments with error handling
    const { data: totalAssignmentsData, error: assignmentError } = await supabaseAdmin
      .from('employee_requests')
      .select('id');

    if (assignmentError) {
      console.error('Error fetching assignments:', assignmentError);
    }

    console.log('Total assignments data:', totalAssignmentsData?.length);

    const totalAssignments = totalAssignmentsData?.length || 0;

    const stats = {
      totalEmployees,
      activeEmployees,
      busyEmployees,
      totalAssignments
    };

    console.log('Final employee stats:', stats);

    return NextResponse.json({ stats });

  } catch (error) {
    console.error('Error in employee-stats API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}