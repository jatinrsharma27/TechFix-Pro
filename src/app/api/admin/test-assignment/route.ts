import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: NextRequest) {
  try {
    const { requestId, employeeId } = await request.json();

    console.log('Test assignment:', { requestId, employeeId });

    // Simple assignment without complex logic
    const { data: result, error } = await supabaseAdmin
      .from('contacts')
      .update({ 
        assigned_to: employeeId,
        status: 'assigned'
      })
      .eq('id', requestId)
      .select()
      .single();

    if (error) {
      console.error('Assignment error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Assignment successful',
      data: result 
    });

  } catch (error) {
    console.error('Test assignment error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}