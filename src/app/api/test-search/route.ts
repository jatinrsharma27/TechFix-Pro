import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || 'da73420f';
    
    console.log('Testing search for:', query);
    
    // Test contacts search
    const { data: contacts, error: contactsError } = await supabaseAdmin
      .from('contacts')
      .select('id, full_name, email, contact_no, service, brand_name, model_name, description')
      .or(`full_name.ilike.%${query}%,email.ilike.%${query}%,contact_no.ilike.%${query}%,service.ilike.%${query}%,brand_name.ilike.%${query}%,model_name.ilike.%${query}%,description.ilike.%${query}%,id.ilike.%${query}%`)
      .limit(10);

    console.log('Contacts found:', contacts?.length || 0);
    
    // Test employees search  
    const { data: employees, error: employeesError } = await supabaseAdmin
      .from('employees')
      .select('id, full_name, email, phone')
      .or(`full_name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`)
      .limit(10);

    console.log('Employees found:', employees?.length || 0);

    return NextResponse.json({
      query,
      contacts: contacts || [],
      employees: employees || [],
      contactsError,
      employeesError
    });

  } catch (error) {
    console.error('Test search error:', error);
    return NextResponse.json({ error: 'Test failed' }, { status: 500 });
  }
}