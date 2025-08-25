import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    // Get all payments for company revenue
    const { data: payments, error } = await supabase
      .from('work_completion_payments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch revenue' }, { status: 500 });
    }

    // Calculate totals
    const totalRevenue = payments?.reduce((sum, payment) => sum + parseFloat(payment.company_revenue), 0) || 0;
    const totalPayments = payments?.reduce((sum, payment) => sum + parseFloat(payment.total_payment_amount), 0) || 0;
    const totalEmployeePayouts = payments?.reduce((sum, payment) => sum + parseFloat(payment.employee_income), 0) || 0;
    const totalTransactions = payments?.length || 0;

    // Group by employee
    const employeeBreakdown = payments?.reduce((acc: any, payment) => {
      const empId = payment.employee_id;
      if (!acc[empId]) {
        acc[empId] = {
          employeeName: payment.employee_name,
          totalJobs: 0,
          totalRevenue: 0,
          totalEmployeePayout: 0
        };
      }
      acc[empId].totalJobs += 1;
      acc[empId].totalRevenue += parseFloat(payment.company_revenue);
      acc[empId].totalEmployeePayout += parseFloat(payment.employee_income);
      return acc;
    }, {}) || {};

    return NextResponse.json({
      totalRevenue,
      totalPayments,
      totalEmployeePayouts,
      totalTransactions,
      employeeBreakdown: Object.values(employeeBreakdown),
      recentPayments: payments?.slice(0, 10) || []
    });

  } catch (error) {
    console.error('Error fetching company revenue:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}