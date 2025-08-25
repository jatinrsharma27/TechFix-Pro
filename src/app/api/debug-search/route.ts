import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || 'da73420f';
    
    // Test simple name search
    const { data: nameTest, error: nameError } = await supabaseAdmin
      .from('contacts')
      .select('*')
      .ilike('full_name', '%JATIN%');

    // Test ID search
    const { data: idTest, error: idError } = await supabaseAdmin
      .from('contacts')
      .select('*')
      .ilike('id', `%${query}%`);

    // Test service search
    const { data: serviceTest, error: serviceError } = await supabaseAdmin
      .from('contacts')
      .select('*')
      .ilike('service', '%speakers%');

    return NextResponse.json({
      query,
      nameTest: { data: nameTest, error: nameError },
      idTest: { data: idTest, error: idError },
      serviceTest: { data: serviceTest, error: serviceError }
    });

  } catch (error) {
    return NextResponse.json({ error: 'Debug failed' }, { status: 500 });
  }
}