import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Await params before using its properties
    const { id } = await params;

    // First, get the request details from contacts table
    console.log('Fetching request with ID:', id);
    const { data: requestDetails, error } = await supabaseAdmin
      .from('contacts')
      .select(`
        id,
        full_name,
        service,
        brand_name,
        model_name,
        description,
        status,
        created_at,
        contact_no,
        email,
        address,
        assigned_to
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Request fetch error:', error);
      console.error('Request ID:', id);
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    // If request is assigned, get the assigned employee details
    let assignedEmployee = undefined;
    if (requestDetails.assigned_to) {
      console.log('Fetching employee with ID:', requestDetails.assigned_to);
      const { data: employeeData, error: employeeError } = await supabaseAdmin
        .from('employees')
        .select('id, full_name, email')
        .eq('id', requestDetails.assigned_to)
        .single();
        
      if (employeeError) {
        console.error('Employee fetch error:', employeeError);
      }
      
      if (!employeeError && employeeData) {
        assignedEmployee = {
          id: employeeData.id,
          full_name: employeeData.full_name,
          email: employeeData.email
        };
      }
    }

    // Fetch work completion and payment details
    const { data: workCompletion, error: workError } = await supabaseAdmin
      .from('work_completion_payments')
      .select('*')
      .eq('request_id', id)
      .single();

    // Transform the data to match the expected format in the frontend
    const requestFormatted = {
      id: requestDetails.id,
      customer_name: requestDetails.full_name,
      device_type: requestDetails.service,
      brand_name: requestDetails.brand_name,
      model_name: requestDetails.model_name,
      issue_description: requestDetails.description || 'Service request',
      status: requestDetails.status,
      created_at: requestDetails.created_at,
      priority: 'medium', // Default priority
      contact_no: requestDetails.contact_no,
      email: requestDetails.email,
      address: requestDetails.address,
      assigned_employee: assignedEmployee,
      work_completion: workCompletion || null
    };

    return NextResponse.json({ request: requestFormatted });
  } catch (error) {
    console.error('Request fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}