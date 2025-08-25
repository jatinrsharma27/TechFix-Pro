import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'monthly';
    
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    // Get employee from token
    const { data: employeeData, error: employeeError } = await supabase
      .from('employees')
      .select('id')
      .eq('session_token', token)
      .single();

    if (employeeError || !employeeData) {
      return NextResponse.json({ error: 'Invalid token or not an employee' }, { status: 401 });
    }

    // Get chart data based on period
    let dateFilter = '';
    const now = new Date();
    
    if (period === 'weekly') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateFilter = weekAgo.toISOString();
    } else if (period === 'monthly') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      dateFilter = monthAgo.toISOString();
    } else {
      const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      dateFilter = yearAgo.toISOString();
    }

    // Get requests assigned to this employee
    const { data: requests, error } = await supabase
      .from('contacts')
      .select('status, created_at, updated_at')
      .eq('assigned_employee_id', employeeData.id)
      .gte('created_at', dateFilter);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch chart data' }, { status: 500 });
    }

    // Process data for charts
    const statusCounts = {
      pending: 0,
      assigned: 0,
      accepted: 0,
      in_progress: 0,
      completed: 0,
      cancelled: 0,
      rejected: 0
    };

    requests?.forEach(request => {
      if (statusCounts.hasOwnProperty(request.status)) {
        statusCounts[request.status as keyof typeof statusCounts]++;
      }
    });

    // Generate time series data
    const timeSeriesData = [];
    const days = period === 'weekly' ? 7 : period === 'monthly' ? 30 : 365;
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayRequests = requests?.filter(r => 
        r.created_at.split('T')[0] === dateStr
      ).length || 0;
      
      timeSeriesData.push({
        date: dateStr,
        requests: dayRequests
      });
    }

    return NextResponse.json({
      statusCounts,
      timeSeriesData,
      totalRequests: requests?.length || 0
    });

  } catch (error) {
    console.error('Error fetching chart data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}