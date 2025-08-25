import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"TechFix Pro" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Test Email - TechFix Pro',
      html: `
        <h2>Test Email</h2>
        <p>This is a test email from TechFix Pro.</p>
        <p>Sent at: ${new Date().toLocaleString()}</p>
      `,
    });

    return NextResponse.json({ success: true, message: `Test email sent to ${email}` });

  } catch (error) {
    console.error('Email test error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}