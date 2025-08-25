import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';

export async function POST(request: NextRequest) {
  try {
    // Get first employee and first few contacts
    const { data: employees } = await supabase
      .from('employees')
      .select('id')
      .limit(1);

    const { data: contacts } = await supabase
      .from('contacts')
      .select('id')
      .limit(5);

    if (!employees?.length || !contacts?.length) {
      return NextResponse.json({ 
        error: 'No employees or contacts found. Please create some first.' 
      }, { status: 400 });
    }

    const employeeId = employees[0].id;
    
    // Create employee_requests entries
    const employeeRequests = contacts.map((contact, index) => ({
      employee_id: employeeId,
      request_id: contact.id,
      status: ['assigned', 'in-progress', 'completed', 'pending-confirmation'][index % 4],
      assigned_at: new Date().toISOString(),
      started_at: index % 2 === 0 ? new Date().toISOString() : null,
      completed_at: index === 2 ? new Date().toISOString() : null
    }));

    const { data, error } = await supabase
      .from('employee_requests')
      .insert(employeeRequests)
      .select();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Test data created successfully',
      created: data?.length || 0
    });

  } catch (error) {
    console.error('Error creating test data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}