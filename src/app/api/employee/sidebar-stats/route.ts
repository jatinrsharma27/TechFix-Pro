import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ 
        assignedRequests: 0,
        completedRequests: 0,
        pendingRequests: 0,
        inProgressRequests: 0
      });
    }

    // Extract employee ID from token or use session management
    let employeeId = null;
    
    // Try to extract from token format: emp_<timestamp>_<random>
    if (token.startsWith('emp_')) {
      // For now, we'll need to get employee ID differently
      // Let's try to get it from the employees table using the token
      const { data: employee, error: empError } = await supabase
        .from('employees')
        .select('id')
        .eq('session_token', token)
        .single();
        
      if (!empError && employee) {
        employeeId = employee.id;
      }
    }

    if (!employeeId) {
      return NextResponse.json({ 
        assignedRequests: 0,
        completedRequests: 0,
        pendingRequests: 0,
        inProgressRequests: 0
      });
    }

    // Get requests assigned to this employee
    const { data: requests, error } = await supabase
      .from('contacts')
      .select('status')
      .eq('assigned_employee_id', employeeId);

    if (error) {
      return NextResponse.json({ 
        assignedRequests: 0,
        completedRequests: 0,
        pendingRequests: 0,
        inProgressRequests: 0
      });
    }

    const assignedRequests = requests?.length || 0;
    const completedRequests = requests?.filter(r => r.status === 'completed').length || 0;
    const pendingRequests = requests?.filter(r => r.status === 'pending').length || 0;
    const inProgressRequests = requests?.filter(r => r.status === 'in_progress').length || 0;

    return NextResponse.json({
      assignedRequests,
      completedRequests,
      pendingRequests,
      inProgressRequests
    });

  } catch (error) {
    return NextResponse.json({ 
      assignedRequests: 0,
      completedRequests: 0,
      pendingRequests: 0,
      inProgressRequests: 0
    });
  }
}