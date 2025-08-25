import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: employeeId } = await params;
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get employee details
    const { data: employee, error: employeeError } = await supabaseAdmin
      .from('employees')
      .select('*')
      .eq('id', employeeId)
      .single();

    if (employeeError || !employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    // Get all assignments for this employee with request details
    const { data: assignments, error: assignmentsError } = await supabaseAdmin
      .from('employee_requests')
      .select(`
        *,
        contacts!inner(
          id,
          full_name,
          service,
          brand_name,
          model_name,
          status
        )
      `)
      .eq('employee_id', employeeId)
      .order('assigned_at', { ascending: false });

    // Get income data from work_completion_payments
    const { data: payments, error: paymentsError } = await supabaseAdmin
      .from('work_completion_payments')
      .select('employee_income, total_payment_amount, completed_at, title')
      .eq('employee_id', employeeId)
      .order('completed_at', { ascending: false });

    if (assignmentsError) {
      console.error('Error fetching employee assignments:', assignmentsError);
      return NextResponse.json({ error: 'Failed to fetch employee assignments' }, { status: 500 });
    }

    // Calculate income stats
    const totalEarnings = payments?.reduce((sum, payment) => sum + parseFloat(payment.employee_income || '0'), 0) || 0;
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    const thisMonthEarnings = payments?.filter(payment => {
      if (!payment.completed_at) return false;
      const paymentDate = new Date(payment.completed_at);
      return paymentDate.getMonth() === thisMonth && paymentDate.getFullYear() === thisYear;
    }).reduce((sum, payment) => sum + parseFloat(payment.employee_income || '0'), 0) || 0;

    // Format the assignments data
    const formattedRequests = (assignments || []).map(assignment => ({
      id: assignment.request_id,
      customer_name: assignment.contacts.full_name,
      service: assignment.contacts.service,
      brand_name: assignment.contacts.brand_name,
      model_name: assignment.contacts.model_name,
      status: assignment.contacts.status || assignment.status,
      assigned_at: assignment.assigned_at,
      completed_at: assignment.completed_at
    }));

    const employeeWithRequests = {
      ...employee,
      requests: formattedRequests,
      income: {
        totalEarnings,
        thisMonthEarnings,
        completedJobs: payments?.length || 0,
        recentPayments: payments?.slice(0, 5) || []
      }
    };

    return NextResponse.json({ employee: employeeWithRequests });

  } catch (error) {
    console.error('Error in employee details API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}