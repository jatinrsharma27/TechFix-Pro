import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const { email, type = 'test' } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    // Direct insert without notification IDs
    const emailData = {
      recipient_email: email,
      recipient_type: 'user',
      recipient_id: '00000000-0000-0000-0000-000000000000',
      email_type: type,
      subject: 'Test Email - TechFix Pro',
      email_content: '<h2>Test Email</h2><p>This is a test email from TechFix Pro.</p>',
      delivery_status: 'pending'
    };

    console.log('Inserting email record:', emailData);

    const { data: emailRecord, error: dbError } = await supabaseAdmin
      .from('email_notifications')
      .insert(emailData)
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    console.log('Email record created:', emailRecord.id);

    // Send email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: { rejectUnauthorized: false }
    });

    await transporter.sendMail({
      from: `"TechFix Pro" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Test Email - TechFix Pro',
      html: '<h2>Test Email</h2><p>This is a test email from TechFix Pro.</p>',
    });

    // Update status
    await supabaseAdmin
      .from('email_notifications')
      .update({ 
        delivery_status: 'sent',
        sent_at: new Date().toISOString()
      })
      .eq('id', emailRecord.id);

    return NextResponse.json({ 
      success: true, 
      message: `Email sent to ${email}`,
      recordId: emailRecord.id
    });

  } catch (error) {
    console.error('Direct email error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}