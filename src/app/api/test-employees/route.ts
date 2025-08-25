import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET() {
  try {
    const { data: employees, error } = await supabaseAdmin
      .from('employees')
      .select('*')
      .limit(10);

    return NextResponse.json({
      count: employees?.length || 0,
      employees: employees || [],
      error
    });

  } catch (error) {
    return NextResponse.json({ error: 'Test failed' }, { status: 500 });
  }
}