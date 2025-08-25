import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user details
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get all requests for this user (by email to get all requests from same user)
    const { data: requests, error: requestsError } = await supabaseAdmin
      .from('contacts')
      .select('id, service, brand_name, model_name, description, status, created_at')
      .eq('email', user.email)
      .order('created_at', { ascending: false });

    if (requestsError) {
      console.error('Error fetching user requests:', requestsError);
      return NextResponse.json({ error: 'Failed to fetch user requests' }, { status: 500 });
    }

    const userWithRequests = {
      ...user,
      requests: requests || []
    };

    return NextResponse.json({ user: userWithRequests });

  } catch (error) {
    console.error('Error in user details API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}