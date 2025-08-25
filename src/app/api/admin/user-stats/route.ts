import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get total unique users
    const { data: allContacts } = await supabaseAdmin
      .from('contacts')
      .select('email, created_at');

    const uniqueEmails = [...new Set(allContacts?.map(c => c.email) || [])];
    const totalUsers = uniqueEmails.length;

    // Get active users (users with requests)
    const activeUsers = totalUsers; // All users in contacts table are active

    // Get new users this month
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const { data: newUsers } = await supabaseAdmin
      .from('contacts')
      .select('email')
      .gte('created_at', thisMonth.toISOString());

    const uniqueNewEmails = [...new Set(newUsers?.map(c => c.email) || [])];
    const newUsersThisMonth = uniqueNewEmails.length;

    // Get total requests
    const { data: totalRequestsData } = await supabaseAdmin
      .from('contacts')
      .select('id');

    const totalRequests = totalRequestsData?.length || 0;

    const stats = {
      totalUsers,
      activeUsers,
      newUsersThisMonth,
      totalRequests
    };

    return NextResponse.json({ stats });

  } catch (error) {
    console.error('Error in user-stats API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}