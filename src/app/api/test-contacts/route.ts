import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || 'da73420f';
    
    // Test exact ID match
    const { data: exactMatch, error: exactError } = await supabaseAdmin
      .from('contacts')
      .select('*')
      .eq('id', 'da73420f-1234-5678-9abc-def012345678')
      .single();

    // Test partial ID search
    const { data: partialMatch, error: partialError } = await supabaseAdmin
      .from('contacts')
      .select('*')
      .ilike('id', `%${query}%`);

    // Test name search
    const { data: nameMatch, error: nameError } = await supabaseAdmin
      .from('contacts')
      .select('*')
      .ilike('full_name', '%JATIN%');

    // Get all contacts to see what exists
    const { data: allContacts, error: allError } = await supabaseAdmin
      .from('contacts')
      .select('id, full_name, email, service')
      .limit(5);

    return NextResponse.json({
      query,
      exactMatch,
      exactError,
      partialMatch,
      partialError,
      nameMatch,
      nameError,
      allContacts,
      allError
    });

  } catch (error) {
    return NextResponse.json({ error: 'Test failed' }, { status: 500 });
  }
}