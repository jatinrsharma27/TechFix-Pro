import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    // Extract employee ID from token format: employee_<uuid>_<timestamp>
    const employeeId = token.replace('employee_', '').split('_')[0];

    // Get requests from employee_requests table with contact details
    const { data: employeeRequests, error } = await supabase
      .from('employee_requests')
      .select(`
        *,
        contacts!request_id(
          id,
          full_name,
          contact_no,
          email,
          service,
          brand_name,
          model_name,
          description,
          created_at,
          status
        )
      `)
      .eq('employee_id', employeeId)
      .order('created_at', { ascending: false });

    console.log('Employee requests found:', employeeRequests?.length || 0);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ requests: [] });
    }

    // Format requests for frontend
    const formattedRequests = (employeeRequests || []).map(req => ({
      id: req.request_id,
      customer_name: req.contacts?.full_name || 'Unknown',
      device_type: req.contacts?.service || 'unknown',
      brand_name: req.contacts?.brand_name || '',
      model_name: req.contacts?.model_name || '',
      issue_description: req.contacts?.description || '',
      status: req.contacts?.status || req.status,
      created_at: req.contacts?.created_at || req.created_at,
      contact_no: req.contacts?.contact_no || '',
      email: req.contacts?.email || ''
    }));

    return NextResponse.json({ requests: formattedRequests });

  } catch (error) {
    console.error('Error fetching employee requests:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}