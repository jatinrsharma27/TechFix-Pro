import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST() {
  try {
    const { data, error } = await supabaseAdmin
      .from('employees')
      .insert({
        full_name: 'John Smith',
        email: 'john.smith@techfix.com',
        phone: '9876543210',
        is_active: true
      })
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      employee: data[0]
    });

  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}