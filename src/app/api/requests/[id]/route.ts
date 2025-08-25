import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    // Get request details
    const { data: requestData, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !requestData) {
      return NextResponse.json({ 
        redirect: true,
        userRedirect: '/',
        adminRedirect: '/admin/dashboard', 
        employeeRedirect: '/employee/dashboard'
      }, { status: 404 });
    }

    // Get work completion details if exists
    const { data: completion } = await supabase
      .from('work_completion_payments')
      .select(`
        *,
        employees!employee_id(
          full_name,
          email
        )
      `)
      .eq('request_id', id)
      .single();

    // Get employee status forms
    const { data: statusForms } = await supabase
      .from('employee_status_forms')
      .select(`
        *,
        employees!employee_id(
          full_name,
          email
        )
      `)
      .eq('request_id', id)
      .order('created_at', { ascending: false });

    // Get admin cancellation forms
    const { data: cancellationForms } = await supabase
      .from('admin_request_cancellations')
      .select(`
        *,
        admins!admin_id(
          full_name,
          email
        )
      `)
      .eq('request_id', id)
      .order('created_at', { ascending: false });

    return NextResponse.json({ 
      request: requestData,
      completion: completion || null,
      statusForms: statusForms || [],
      cancellationForms: cancellationForms || [],
      hasWorkCompletion: !!completion,
      hasStatusForms: (statusForms?.length || 0) > 0,
      hasCancellationForms: (cancellationForms?.length || 0) > 0
    });

  } catch (error) {
    console.error('Error fetching request details:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}