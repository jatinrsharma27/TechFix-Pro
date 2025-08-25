import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get detailed transaction information
    const { data: completionForm, error } = await supabaseAdmin
      .from('work_completion_payments')
      .select(`
        id,
        request_id,
        total_payment_amount,
        completed_at,
        submitted_by,
        employee_id,
        customer_name,
        customer_email,
        contacts!request_id(
          contact_no,
          address,
          service,
          brand_name,
          model_name,
          description
        ),
        employees!employee_id(
          full_name
        )
      `)
      .eq('id', id)
      .single();

    if (error || !completionForm) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    const detail = {
      id: completionForm.id,
      request_id: completionForm.request_id,
      customer_name: completionForm.customer_name || 'Unknown Customer',
      contact_no: (completionForm.contacts as any)?.contact_no || 'N/A',
      email: completionForm.customer_email || 'N/A',
      address: (completionForm.contacts as any)?.address || 'N/A',
      service: (completionForm.contacts as any)?.service || 'unknown',
      brand_name: (completionForm.contacts as any)?.brand_name || 'N/A',
      model_name: (completionForm.contacts as any)?.model_name || 'N/A',
      description: (completionForm.contacts as any)?.description || 'N/A',
      amount: parseFloat(completionForm.total_payment_amount) || 0,
      payment_date: completionForm.completed_at,
      employee_name: (completionForm.employees as any)?.full_name || completionForm.submitted_by || 'Unknown Employee',
      employee_id: completionForm.employee_id
    };

    return NextResponse.json({ detail });

  } catch (error) {
    console.error('Error in revenue detail API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}