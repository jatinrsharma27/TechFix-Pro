import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    // Get all requests
    const { data: requests, error } = await supabase
      .from('contacts')
      .select('status, created_at, service, email');

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }

    // Calculate stats
    const totalRequests = requests?.length || 0;
    const pendingRequests = requests?.filter(r => r.status === 'pending').length || 0;
    const completedRequests = requests?.filter(r => r.status === 'completed').length || 0;
    const inProgressRequests = requests?.filter(r => r.status === 'in-progress').length || 0;

    // Get unique users from contacts
    const uniqueEmails = [...new Set(requests?.map(r => r.email).filter(Boolean) || [])];
    const totalUsers = uniqueEmails.length;
    
    // Get employees with their current status
    const { data: employees } = await supabase.from('employees').select('id, status');
    const totalEmployees = employees?.length || 0;
    const availableEmployees = employees?.filter(emp => emp.status === 'available').length || 0;
    const busyEmployees = employees?.filter(emp => emp.status === 'busy').length || 0;
    
    // Get employees with active work (in-progress or pending requests)
    const { data: activeWork } = await supabase
      .from('contacts')
      .select('assigned_employee_id')
      .in('status', ['in-progress', 'pending'])
      .not('assigned_employee_id', 'is', null);
    
    const busyEmployeeIds = new Set(activeWork?.map(w => w.assigned_employee_id) || []);
    const actualBusyEmployees = busyEmployeeIds.size;
    const actualAvailableEmployees = totalEmployees - actualBusyEmployees;
    
    // Get revenue from work completion payments table
    const { data: payments } = await supabase
      .from('work_completion_payments')
      .select('company_revenue, employee_income, completed_at, total_payment_amount');
    
    const totalRevenue = payments?.reduce((sum, payment) => {
      return sum + parseFloat(payment.company_revenue);
    }, 0) || 0;

    // Get period parameter
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'monthly';

    // Calculate trend based on period
    const monthlyTrend = [];
    let periods = 6;
    
    switch (period) {
      case 'weekly':
        periods = 7;
        for (let i = periods - 1; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
          const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
          
          const dayRevenue = payments?.filter(payment => {
            const paymentDate = new Date(payment.completed_at);
            return paymentDate >= dayStart && paymentDate < dayEnd;
          }).reduce((sum, payment) => sum + parseFloat(payment.company_revenue), 0) || 0;
          
          monthlyTrend.push({
            month: date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
            revenue: dayRevenue
          });
        }
        break;
      case 'yearly':
        periods = 5;
        for (let i = periods - 1; i >= 0; i--) {
          const date = new Date();
          date.setFullYear(date.getFullYear() - i);
          const yearStart = new Date(date.getFullYear(), 0, 1);
          const yearEnd = new Date(date.getFullYear() + 1, 0, 1);
          
          const yearRevenue = payments?.filter(payment => {
            const paymentDate = new Date(payment.completed_at);
            return paymentDate >= yearStart && paymentDate < yearEnd;
          }).reduce((sum, payment) => sum + parseFloat(payment.company_revenue), 0) || 0;
          
          monthlyTrend.push({
            month: date.getFullYear().toString(),
            revenue: yearRevenue
          });
        }
        break;
      default: // monthly
        for (let i = 5; i >= 0; i--) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
          const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
          
          const monthRevenue = payments?.filter(payment => {
            const paymentDate = new Date(payment.completed_at);
            return paymentDate >= monthStart && paymentDate <= monthEnd;
          }).reduce((sum, payment) => sum + parseFloat(payment.company_revenue), 0) || 0;
          
          monthlyTrend.push({
            month: date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
            revenue: monthRevenue
          });
        }
    }

    // Get service breakdown from payments with request details
    const { data: paymentsWithService } = await supabase
      .from('work_completion_payments')
      .select(`
        company_revenue,
        contacts!request_id(
          service
        )
      `);

    const serviceRevenue: Record<string, number> = {};
    paymentsWithService?.forEach(payment => {
      const service = (payment.contacts as any)?.service || 'unknown';
      serviceRevenue[service] = (serviceRevenue[service] || 0) + parseFloat(payment.company_revenue || 0);
    });

    const serviceBreakdown = Object.entries(serviceRevenue).map(([service, revenue]) => ({
      service,
      revenue: revenue as number
    }));

    // Calculate employee payouts
    const totalEmployeePayouts = payments?.reduce((sum, payment) => {
      return sum + parseFloat(payment.employee_income || 0);
    }, 0) || 0;

    return NextResponse.json({
      totalUsers,
      totalRequests,
      pendingRequests,
      completedRequests,
      inProgressRequests,
      activeEngineers: totalEmployees,
      availableEmployees: actualAvailableEmployees,
      busyEmployees: actualBusyEmployees,
      totalRevenue,
      totalEmployeePayouts,
      monthlyTrend,
      serviceBreakdown,
      thisMonthUsers: 0,
      thisMonthRequests: 0,
      services: {
        laptop: requests?.filter(r => r.service === 'laptop').length || 0,
        computer: requests?.filter(r => r.service === 'computer').length || 0,
        mobile: requests?.filter(r => r.service === 'mobile').length || 0,
        tv: requests?.filter(r => r.service === 'tv').length || 0,
        camera: requests?.filter(r => r.service === 'camera').length || 0,
        tablet: requests?.filter(r => r.service === 'tablet').length || 0
      }
    });

  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}