import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const status = url.searchParams.get('status');

    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from('email_notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('delivery_status', status);
    }

    const { data: emails, error } = await query;

    if (error) {
      console.error('Error fetching email notifications:', error);
      return NextResponse.json({ error: 'Failed to fetch email notifications' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      emails: emails || []
    });

  } catch (error) {
    console.error('Email notifications API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}