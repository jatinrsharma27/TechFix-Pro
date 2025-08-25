import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { sessionManager } from '@/lib/sessionManager';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    // Extract employee ID from token format: employee_<uuid>_<timestamp>
    if (!token.startsWith('employee_')) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    const employeeId = token.replace('employee_', '').split('_')[0];

    // Get employee payments
    const { data: payments, error } = await supabase
      .from('work_completion_payments')
      .select('*')
      .eq('employee_id', employeeId)
      .order('completed_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch income' }, { status: 500 });
    }

    // Calculate time-based income stats
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const todaysIncome = payments?.filter(payment => {
      const paymentDate = new Date(payment.completed_at);
      return paymentDate >= today;
    }).reduce((sum, payment) => sum + parseFloat(payment.employee_income), 0) || 0;

    const weeklyIncome = payments?.filter(payment => {
      const paymentDate = new Date(payment.completed_at);
      return paymentDate >= weekStart;
    }).reduce((sum, payment) => sum + parseFloat(payment.employee_income), 0) || 0;

    const monthlyIncome = payments?.filter(payment => {
      const paymentDate = new Date(payment.completed_at);
      return paymentDate >= monthStart;
    }).reduce((sum, payment) => sum + parseFloat(payment.employee_income), 0) || 0;

    return NextResponse.json({
      todaysIncome,
      weeklyIncome,
      monthlyIncome,
      payments: payments || []
    });

  } catch (error) {
    console.error('Error fetching employee income:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}