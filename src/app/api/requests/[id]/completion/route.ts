import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    // Get work completion details
    const { data: completion, error } = await supabase
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

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching completion details:', error);
      return NextResponse.json({ error: 'Failed to fetch completion details' }, { status: 500 });
    }

    // Also check for status forms
    const { data: statusForms, error: statusError } = await supabase
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

    return NextResponse.json({ 
      completion: completion || null,
      statusForms: statusForms || []
    });

  } catch (error) {
    console.error('Error fetching request completion:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}