import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all users with their request counts
    const { data: users, error } = await supabaseAdmin
      .from('contacts')
      .select(`
        id,
        full_name,
        email,
        contact_no,
        created_at
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    // Get request counts for each user
    const usersWithStats = await Promise.all(
      (users || []).map(async (user) => {
        const { data: requestStats } = await supabaseAdmin
          .from('contacts')
          .select('status')
          .eq('full_name', user.full_name)
          .eq('email', user.email);

        const totalRequests = requestStats?.length || 0;
        const completedRequests = requestStats?.filter(r => r.status === 'completed').length || 0;
        const pendingRequests = requestStats?.filter(r => ['pending', 'assigned', 'in-progress'].includes(r.status)).length || 0;

        return {
          ...user,
          total_requests: totalRequests,
          completed_requests: completedRequests,
          pending_requests: pendingRequests
        };
      })
    );

    // Remove duplicates based on email
    const uniqueUsers = usersWithStats.filter((user, index, self) => 
      index === self.findIndex(u => u.email === user.email)
    );

    return NextResponse.json({ users: uniqueUsers });

  } catch (error) {
    console.error('Error in users API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}