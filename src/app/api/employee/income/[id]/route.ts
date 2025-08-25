import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    console.log('Looking for payment ID:', id);

    if (!id) {
      return NextResponse.json({ error: 'Payment ID is required' }, { status: 400 });
    }

    // Get payment details
    const { data: payment, error } = await supabase
      .from('work_completion_payments')
      .select(`
        *,
        contacts!request_id(
          full_name,
          contact_no,
          email,
          service,
          brand_name,
          model_name,
          description
        )
      `)
      .eq('id', id)
      .single();

    console.log('Payment query result:', { payment, error });

    if (error || !payment) {
      console.error('Payment not found:', error);
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    return NextResponse.json({ payment });

  } catch (error) {
    console.error('Error fetching payment details:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}