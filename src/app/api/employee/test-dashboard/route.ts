import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    // Test data for employee dashboard
    const testEmployeeId = 'test-employee-id';
    
    // Check if tables exist and have data
    const { data: employeeRequests, error: reqError } = await supabase
      .from('employee_requests')
      .select('*')
      .limit(5);

    const { data: payments, error: payError } = await supabase
      .from('work_completion_payments')
      .select('*')
      .limit(5);

    return NextResponse.json({
      message: 'Dashboard test endpoint',
      employeeRequests: employeeRequests || [],
      payments: payments || [],
      errors: {
        reqError: reqError?.message,
        payError: payError?.message
      }
    });

  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json({ error: 'Test failed' }, { status: 500 });
  }
}