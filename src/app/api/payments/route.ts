import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');

    if (!employeeId || employeeId === 'null') {
      return NextResponse.json({ payments: [] });
    }

    const { data: payments, error } = await supabase
      .from('work_completion_payments')
      .select('*')
      .eq('employee_id', employeeId)
      .order('completed_at', { ascending: false });

    return NextResponse.json({ payments: payments || [] });
  } catch (error) {
    return NextResponse.json({ payments: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Payment request body:', body);
    
    const { 
      requestId, 
      title, 
      workDetails, 
      customerName, 
      customerEmail, 
      totalAmount, 
      paymentMethod = 'cash',
      notes 
    } = body;

    // For now, use a default employee ID - will be replaced with proper auth later
    const employeeId = body.employeeId || 'temp-employee-id';

    console.log('Extracted values:', { requestId, totalAmount, employeeId });

    if (!requestId || !totalAmount) {
      console.log('Missing required fields:', { requestId, totalAmount });
      return NextResponse.json({ 
        error: 'Missing required fields',
        received: { requestId, totalAmount }
      }, { status: 400 });
    }

    // Check if payment already exists for this request
    const { data: existingPayments, error: checkError } = await supabase
      .from('work_completion_payments')
      .select('id')
      .eq('request_id', requestId);

    if (existingPayments && existingPayments.length > 0) {
      return NextResponse.json({ 
        success: true,
        message: 'Payment already processed',
        paymentId: existingPayments[0].id,
        redirect: '/employee/dashboard'
      }, { status: 200 });
    }

    // Store work completion with payment
    const insertData = {
      request_id: requestId,
      employee_id: employeeId,
      title: title || 'Work Completed',
      work_details: workDetails || 'Service completed successfully',
      customer_name: customerName || 'Customer',
      customer_email: customerEmail || '',
      total_payment_amount: parseFloat(totalAmount),
      payment_method: paymentMethod || 'cash',
      payment_status: 'completed',
      notes: notes || '',
      submitted_by: employeeId
    };
    
    console.log('Inserting payment data:', insertData);
    
    const { data: completionData, error: completionError } = await supabase
      .from('work_completion_payments')
      .insert(insertData)
      .select()
      .single();

    if (completionError) {
      console.error('Payment storage error:', completionError);
      return NextResponse.json({ 
        error: 'Failed to store payment data',
        details: completionError,
        insertData: insertData
      }, { status: 500 });
    }

    // Update request status to completed
    const { error: updateError } = await supabase
      .from('contacts')
      .update({ 
        status: 'completed'
      })
      .eq('id', requestId);

    console.log('Status update result:', { requestId, updateError });

    if (updateError) {
      console.error('Status update error:', updateError);
      return NextResponse.json({ error: 'Failed to update request status' }, { status: 500 });
    }

    // Also update employee_requests table status
    const { error: empUpdateError } = await supabase
      .from('employee_requests')
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('request_id', requestId);

    console.log('Employee request status update:', { requestId, empUpdateError });

    return NextResponse.json({ 
      success: true, 
      paymentId: completionData.id,
      payment: {
        totalAmount: completionData.total_payment_amount,
        employeeIncome: completionData.employee_income,
        companyRevenue: completionData.company_revenue
      },
      redirect: '/employee/dashboard',
      statusUpdated: true
    });

  } catch (error) {
    console.error('Error processing payment:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}