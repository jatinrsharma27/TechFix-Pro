import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const requestId = searchParams.get('requestId');

    if (!requestId) {
      return NextResponse.json({ error: 'Request ID is required' }, { status: 400 });
    }

    // Get all employees
    const { data: employees, error: employeesError } = await supabaseAdmin
      .from('employees')
      .select('id, full_name, email');

    if (employeesError) {
      throw employeesError;
    }

    // Get employee statuses for this request and current workload
    const employeesWithStatus = await Promise.all(
      employees.map(async (employee) => {
        // Check if employee is currently busy (has active requests)
        const { data: busyRequests } = await supabaseAdmin
          .from('employee_requests')
          .select('request_id')
          .eq('employee_id', employee.id)
          .in('status', ['pending-confirmation', 'assigned', 'in-progress']);

        // Check if employee rejected this specific request
        const { data: rejectionRecord } = await supabaseAdmin
          .from('notifications')
          .select('id')
          .eq('type', 'employee_rejection')
          .eq('employee_id', employee.id)
          .eq('request_id', requestId);

        let status = 'free';
        
        const hasRejected = rejectionRecord && rejectionRecord.length > 0;
        
        if (hasRejected) {
          status = 'rejected';
        } else if (busyRequests && busyRequests.length > 0) {
          status = 'busy';
        }

        return {
          ...employee,
          status,
          canAssign: status === 'free'
        };
      })
    );

    return NextResponse.json({ employees: employeesWithStatus });
  } catch (error) {
    console.error('Employees status API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}