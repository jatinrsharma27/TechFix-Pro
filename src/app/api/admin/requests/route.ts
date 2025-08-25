import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters for pagination and filtering
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const status = url.searchParams.get('status');
    
    const offset = (page - 1) * limit;

    // Build query
    let query = supabaseAdmin
      .from('contacts')
      .select(`
        id,
        full_name,
        contact_no,
        email,
        address,
        service,
        description,
        brand_name,
        model_name,
        status,
        created_at,
        assigned_to,
        assigned_employee:employees!assigned_to(
          id,
          full_name,
          email
        )
      `, { count: 'exact' });

    // Apply status filter if provided
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    // Apply pagination and ordering
    const { data: requestsData, error: requestsError, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (requestsError) {
      console.error('Error fetching requests:', requestsError);
      return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 });
    }

    // Transform the data to match frontend expectations
    const transformedRequests = requestsData?.map(req => ({
      id: req.id,
      customer_name: req.full_name,
      device_type: req.service,
      brand_name: req.brand_name,
      model_name: req.model_name,
      issue_description: req.description,
      status: req.status,
      created_at: req.created_at,
      priority: 'medium' as const, // Default since not in schema
      contact_no: req.contact_no,
      email: req.email,
      address: req.address,
      assigned_to: req.assigned_to,
      assigned_employee: req.assigned_employee?.[0] || null
    })) || [];

    return NextResponse.json({
      success: true,
      requests: transformedRequests,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Requests API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}