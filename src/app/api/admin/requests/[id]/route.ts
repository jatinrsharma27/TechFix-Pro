import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const requestId = id;

    // Fetch the request with employee details if assigned
    const { data: requestData, error: requestError } = await supabaseAdmin
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
      `)
      .eq('id', requestId)
      .single();

    // Fetch work completion and payment details
    const { data: workCompletion, error: workError } = await supabaseAdmin
      .from('work_completion_payments')
      .select('*')
      .eq('request_id', requestId)
      .single();

    if (requestError) {
      console.error('Error fetching request:', requestError);
      if (requestError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Request not found' }, { status: 404 });
      }
      return NextResponse.json({ error: 'Failed to fetch request' }, { status: 500 });
    }

    // Transform the data to match the frontend expectations
    const transformedRequest = {
      id: requestData.id,
      customer_name: requestData.full_name,
      device_type: requestData.service,
      brand_name: requestData.brand_name,
      model_name: requestData.model_name,
      issue_description: requestData.description,
      status: requestData.status,
      created_at: requestData.created_at,
      priority: 'medium' as const, // Default priority since it's not in your schema
      contact_no: requestData.contact_no,
      email: requestData.email,
      address: requestData.address,
      assigned_to: requestData.assigned_to,
      assigned_employee: requestData.assigned_employee?.[0] || null,
      work_completion: workCompletion || null
    };

    return NextResponse.json({
      success: true,
      request: transformedRequest
    });
  } catch (error) {
    console.error('Request detail API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}