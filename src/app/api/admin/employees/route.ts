import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all employees
    const { data: employees, error } = await supabaseAdmin
      .from('employees')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching employees:', error);
      return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 });
    }

    // Get assignment counts for each employee
    const employeesWithStats = await Promise.all(
      (employees || []).map(async (employee) => {
        // Get assignments from employee_requests with contact status
        const { data: assignments } = await supabaseAdmin
          .from('employee_requests')
          .select(`
            status,
            contacts!request_id(
              status
            )
          `)
          .eq('employee_id', employee.id);

        const totalRequests = assignments?.length || 0;
        const completedRequests = assignments?.filter(r => 
          ((r.contacts as any)?.status || r.status) === 'completed'
        ).length || 0;
        const activeRequests = assignments?.filter(r => {
          const status = (r.contacts as any)?.status || r.status;
          return ['assigned', 'in-progress', 'pending'].includes(status);
        }).length || 0;

        // Check if employee has active work
        const { data: activeWork } = await supabaseAdmin
          .from('contacts')
          .select('id')
          .eq('assigned_employee_id', employee.id)
          .in('status', ['in-progress', 'pending'])
          .limit(1);

        const currentStatus = (activeWork?.length || 0) > 0 ? 'busy' : 'available';

        return {
          ...employee,
          total_requests: totalRequests,
          completed_requests: completedRequests,
          active_requests: activeRequests,
          current_status: currentStatus
        };
      })
    );

    return NextResponse.json({ employees: employeesWithStats });

  } catch (error) {
    console.error('Error in employees API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}