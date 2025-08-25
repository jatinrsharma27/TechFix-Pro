import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const requestId = searchParams.get('requestId');
    const employeeId = searchParams.get('employeeId');

    if (!requestId || !employeeId) {
      return NextResponse.json({ error: 'requestId and employeeId required' }, { status: 400 });
    }

    // Check request exists
    const { data: requestData, error: requestError } = await supabaseAdmin
      .from('contacts')
      .select('*')
      .eq('id', requestId)
      .single();

    // Check employee exists
    const { data: employeeData, error: employeeError } = await supabaseAdmin
      .from('employees')
      .select('*')
      .eq('id', employeeId)
      .single();

    return NextResponse.json({
      request: {
        exists: !requestError,
        data: requestData,
        error: requestError?.message
      },
      employee: {
        exists: !employeeError,
        data: employeeData,
        error: employeeError?.message
      }
    });

  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { requestId, employeeId } = await request.json();

    // Simple assignment
    const { data, error } = await supabaseAdmin
      .from('contacts')
      .update({ 
        assigned_to: employeeId,
        status: 'assigned'
      })
      .eq('id', requestId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });

  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}