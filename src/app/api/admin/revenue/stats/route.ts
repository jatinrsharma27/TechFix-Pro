import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all work completion payments
    const { data: payments, error } = await supabaseAdmin
      .from('work_completion_payments')
      .select(`
        company_revenue,
        completed_at,
        contacts!request_id(service)
      `);

    if (error) {
      console.error('Error fetching payments:', error);
      return NextResponse.json({ error: 'Failed to fetch revenue data' }, { status: 500 });
    }

    const forms = payments || [];
    
    // Calculate total revenue
    const totalRevenue = forms.reduce((sum, form) => sum + (parseFloat(form.company_revenue) || 0), 0);

    // Calculate this month's revenue
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);
    
    const thisMonthRevenue = forms
      .filter(form => new Date(form.completed_at) >= thisMonth)
      .reduce((sum, form) => sum + (parseFloat(form.company_revenue) || 0), 0);

    // Calculate this week's revenue
    const thisWeek = new Date();
    thisWeek.setDate(thisWeek.getDate() - 7);
    
    const thisWeekRevenue = forms
      .filter(form => new Date(form.completed_at) >= thisWeek)
      .reduce((sum, form) => sum + (parseFloat(form.company_revenue) || 0), 0);

    // Get period parameter
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'monthly';

    // Calculate trend based on period
    const monthlyTrend = [];
    
    switch (period) {
      case 'weekly':
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
          const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
          
          const dayRevenue = forms
            .filter(form => {
              const formDate = new Date(form.completed_at);
              return formDate >= dayStart && formDate < dayEnd;
            })
            .reduce((sum, form) => sum + (parseFloat(form.company_revenue) || 0), 0);
          
          monthlyTrend.push({
            month: date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
            revenue: dayRevenue
          });
        }
        break;
      case 'yearly':
        for (let i = 4; i >= 0; i--) {
          const date = new Date();
          date.setFullYear(date.getFullYear() - i);
          const yearStart = new Date(date.getFullYear(), 0, 1);
          const yearEnd = new Date(date.getFullYear() + 1, 0, 1);
          
          const yearRevenue = forms
            .filter(form => {
              const formDate = new Date(form.completed_at);
              return formDate >= yearStart && formDate < yearEnd;
            })
            .reduce((sum, form) => sum + (parseFloat(form.company_revenue) || 0), 0);
          
          monthlyTrend.push({
            month: date.getFullYear().toString(),
            revenue: yearRevenue
          });
        }
        break;
      case '10years':
        for (let i = 9; i >= 0; i--) {
          const date = new Date();
          date.setFullYear(date.getFullYear() - i);
          const yearStart = new Date(date.getFullYear(), 0, 1);
          const yearEnd = new Date(date.getFullYear() + 1, 0, 1);
          
          const yearRevenue = forms
            .filter(form => {
              const formDate = new Date(form.completed_at);
              return formDate >= yearStart && formDate < yearEnd;
            })
            .reduce((sum, form) => sum + (parseFloat(form.company_revenue) || 0), 0);
          
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
          
          const monthRevenue = forms
            .filter(form => {
              const formDate = new Date(form.completed_at);
              return formDate >= monthStart && formDate <= monthEnd;
            })
            .reduce((sum, form) => sum + (parseFloat(form.company_revenue) || 0), 0);
          
          monthlyTrend.push({
            month: date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
            revenue: monthRevenue
          });
        }
    }

    // Calculate service breakdown
    const serviceRevenue: Record<string, number> = {};
    forms.forEach(form => {
      const service = (form.contacts as any)?.service || 'unknown';
      const payment = parseFloat(form.company_revenue) || 0;
      serviceRevenue[service] = (serviceRevenue[service] || 0) + payment;
    });

    const serviceBreakdown = Object.entries(serviceRevenue).map(([service, revenue]) => ({
      service,
      revenue: revenue as number
    }));

    const stats = {
      totalRevenue,
      thisMonthRevenue,
      thisWeekRevenue,
      monthlyTrend,
      serviceBreakdown
    };

    return NextResponse.json({ stats });

  } catch (error) {
    console.error('Error in revenue stats API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}