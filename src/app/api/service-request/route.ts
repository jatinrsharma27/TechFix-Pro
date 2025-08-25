import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createNotification } from '@/lib/createNotification';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const requestData = await request.json();
    
    // Insert the service request into contacts table
    const { data: serviceRequest, error } = await supabase
      .from('contacts')
      .insert(requestData)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Send notifications and emails to all parties
    try {
      console.log('=== SERVICE REQUEST EMAIL NOTIFICATION ===');
      console.log('Request data:', requestData);
      console.log('Service request:', serviceRequest);
      
      // Create user notification
      if (serviceRequest.id) {
        await createNotification({
          recipient_type: 'user',
          recipient_id: serviceRequest.id,
          request_id: serviceRequest.id,
          type: 'request_created',
          title: 'Service Request Created',
          message: `Your ${requestData.service || requestData.device_type || 'device'} repair request has been submitted`,
          priority: 'normal'
        });
      }

      // Create admin notification
      await createNotification({
        recipient_type: 'admin',
        recipient_id: '00000000-0000-0000-0000-000000000001',
        request_id: serviceRequest.id,
        type: 'new_request',
        title: 'New Service Request',
        message: `New ${requestData.service || requestData.device_type || 'device'} repair request requires assignment`,
        priority: 'high'
      });
      
      // Send email to user
      if (requestData.email) {
        console.log('Sending email to:', requestData.email);
        
        const { data: emailRecord, error: emailError } = await supabase.from('email_notifications').insert({
          recipient_email: requestData.email,
          recipient_type: 'user',
          recipient_id: serviceRequest.id,
          email_type: 'request_created',
          subject: 'Request Created - TechFix Pro',
          email_content: `Your ${requestData.service || 'device'} repair request has been created`,
          delivery_status: 'sent'
        }).select().single();
        
        if (emailError) {
          console.error('Email record error:', emailError);
        } else {
          console.log('Email record created:', emailRecord);
        }
      } else {
        console.log('No email provided in request data');
      }
      
      console.log(`Notifications processed for request ${serviceRequest.id}`);
    } catch (notificationError) {
      console.error('Notification/Email failed:', notificationError);
    }

    return NextResponse.json({ 
      success: true, 
      request: serviceRequest 
    });
  } catch (error) {
    console.error('Service request creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}