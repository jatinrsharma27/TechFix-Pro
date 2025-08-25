import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ 
        stats: {
          assignedRequests: 0,
          completedRequests: 0,
          pendingRequests: 0,
          totalEarnings: 0,
          thisMonthEarnings: 0,
          services: { laptop: 0, computer: 0, mobile: 0, tv: 0, camera: 0, tablet: 0 }
        }
      });
    }

    // Extract employee ID from token format: employee_<uuid>_<timestamp>
    if (!token.startsWith('employee_')) {
      return NextResponse.json({ 
        stats: {
          assignedRequests: 0,
          completedRequests: 0,
          pendingRequests: 0,
          totalEarnings: 0,
          thisMonthEarnings: 0,
          services: { laptop: 0, computer: 0, mobile: 0, tv: 0, camera: 0, tablet: 0 }
        }
      });
    }
    
    const employeeId = token.replace('employee_', '').split('_')[0];

    // Get assigned requests count from employee_requests table
    const { data: assignedReqs, error: assignedError } = await supabase
      .from('employee_requests')
      .select('id, status')
      .eq('employee_id', employeeId)
      .in('status', ['assigned', 'pending-confirmation', 'in-progress']);

    // Get completed requests count from work_completion_payments table
    const { data: completedPayments, error: completedError } = await supabase
      .from('work_completion_payments')
      .select('id, completed_at')
      .eq('employee_id', employeeId);

    // Get earnings from work_completion_payments
    const { data: payments, error: paymentError } = await supabase
      .from('work_completion_payments')
      .select('employee_income, completed_at')
      .eq('employee_id', employeeId);

    // Calculate earnings
    const totalEarnings = payments?.reduce((sum, payment) => sum + parseFloat(payment.employee_income || '0'), 0) || 0;
    
    // Calculate this month's earnings
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    const thisMonthEarnings = payments?.filter(payment => {
      if (!payment.completed_at) return false;
      const paymentDate = new Date(payment.completed_at);
      return paymentDate.getMonth() === thisMonth && paymentDate.getFullYear() === thisYear;
    }).reduce((sum, payment) => sum + parseFloat(payment.employee_income || '0'), 0) || 0;

    // Get service breakdown from employee_requests with contacts
    const { data: serviceRequests, error: serviceError } = await supabase
      .from('employee_requests')
      .select(`
        id,
        contacts!request_id(
          service
        )
      `)
      .eq('employee_id', employeeId);

    // Calculate service breakdown
    const services = {
      laptop: serviceRequests?.filter(r => (r.contacts as any)?.service === 'laptop').length || 0,
      computer: serviceRequests?.filter(r => (r.contacts as any)?.service === 'computer').length || 0,
      mobile: serviceRequests?.filter(r => (r.contacts as any)?.service === 'mobile').length || 0,
      tv: serviceRequests?.filter(r => (r.contacts as any)?.service === 'tv').length || 0,
      camera: serviceRequests?.filter(r => (r.contacts as any)?.service === 'camera').length || 0,
      tablet: serviceRequests?.filter(r => (r.contacts as any)?.service === 'tablet').length || 0
    };

    // Final stats calculation
    const stats = {
      assignedRequests: assignedReqs?.length || 0,
      completedRequests: completedPayments?.length || 0,
      pendingRequests: assignedReqs?.filter(r => ['pending-confirmation', 'in-progress'].includes(r.status)).length || 0,
      totalEarnings,
      thisMonthEarnings,
      services
    };

    return NextResponse.json({ stats });

  } catch (error) {
    console.error('Error fetching employee dashboard stats:', error);
    return NextResponse.json({ 
      stats: {
        assignedRequests: 0,
        completedRequests: 0,
        pendingRequests: 0,
        totalEarnings: 0,
        thisMonthEarnings: 0,
        services: { laptop: 0, computer: 0, mobile: 0, tv: 0, camera: 0, tablet: 0 }
      }
    });
  }
}