import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get recent transactions (last 10)
    const { data: completionForms, error } = await supabaseAdmin
      .from('work_completion_payments')
      .select(`
        id,
        request_id,
        total_payment_amount,
        completed_at,
        submitted_by,
        employee_id,
        customer_name,
        contacts!request_id(
          service
        ),
        employees!employee_id(
          full_name
        )
      `)
      .order('completed_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching transactions:', error);
      return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
    }

    const transactions = (completionForms || []).map(form => ({
      id: form.id,
      request_id: form.request_id,
      customer_name: form.customer_name || 'Unknown Customer',
      service: (form.contacts as any)?.service || 'unknown',
      amount: parseFloat(form.total_payment_amount) || 0,
      payment_date: form.completed_at,
      employee_name: (form.employees as any)?.full_name || form.submitted_by || 'Unknown Employee'
    }));

    return NextResponse.json({ transactions });

  } catch (error) {
    console.error('Error in revenue transactions API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}