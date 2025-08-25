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

    // Get employee profile
    const { data: employee, error } = await supabase
      .from('employees')
      .select('id, email, full_name, role, is_active, created_at, last_login')
      .eq('id', employeeId)
      .eq('is_active', true)
      .single();

    if (error || !employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    return NextResponse.json({ employee });

  } catch (error) {
    console.error('Error fetching employee profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}