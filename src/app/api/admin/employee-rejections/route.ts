import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: NextRequest) {
  try {
    const { requestId, employeeId } = await request.json();

    await supabaseAdmin
      .from('notifications')
      .insert({
        id: `rejection_${requestId}_${employeeId}`,
        type: 'employee_rejection',
        title: 'Employee Rejection Record',
        message: `Employee ${employeeId} rejected request ${requestId}`,
        request_id: requestId,
        employee_id: employeeId,
        timestamp: new Date().toISOString(),
        read: true
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}