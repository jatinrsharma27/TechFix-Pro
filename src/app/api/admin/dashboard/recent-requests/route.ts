import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    // Get recent requests with assigned employee info
    const { data: requests, error } = await supabase
      .from('contacts')
      .select(`
        *,
        assigned_employee:employees!assigned_to(
          id,
          full_name,
          email
        )
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch recent requests' }, { status: 500 });
    }

    return NextResponse.json({ requests: requests || [] });

  } catch (error) {
    console.error('Error fetching recent requests:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}