import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import nodemailer from 'nodemailer';

export async function GET() {
  try {
    const debugInfo: any = {
      emailConfig: {
        emailUser: process.env.EMAIL_USER ? 'Set' : 'Missing',
        emailPass: process.env.EMAIL_PASS ? 'Set' : 'Missing',
        transporterStatus: 'Unknown'
      },
      database: {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
        supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Missing',
        connection: 'Unknown'
      },
      emailStats: {},
      recipients: {}
    };

    // Test database connection
    try {
      const { data: testQuery, error } = await supabase
        .from('email_notifications')
        .select('count')
        .limit(1);
      
      debugInfo.database.connection = error ? `Error: ${error.message}` : 'Connected';
    } catch (dbError) {
      debugInfo.database.connection = `Error: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`;
    }

    // Test email transporter
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

        await new Promise((resolve, reject) => {
          transporter.verify((error: any, success: any) => {
            if (error) {
              debugInfo.emailConfig.transporterStatus = `Error: ${error.message}`;
              reject(error);
            } else {
              debugInfo.emailConfig.transporterStatus = 'Ready';
              resolve(success);
            }
          });
        });
      } catch (emailError) {
        debugInfo.emailConfig.transporterStatus = `Error: ${emailError instanceof Error ? emailError.message : 'Unknown error'}`;
      }
    } else {
      debugInfo.emailConfig.transporterStatus = 'Missing credentials';
    }

    // Get recent email statistics
    try {
      const { data: recentEmails, error } = await supabase
        .from('email_notifications')
        .select('delivery_status, created_at')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(50);

      if (!error && recentEmails) {
        const stats: Record<string, number> = recentEmails.reduce((acc: Record<string, number>, email: any) => {
          acc[email.delivery_status] = (acc[email.delivery_status] || 0) + 1;
          return acc;
        }, {});

        debugInfo.emailStats = {
          total: recentEmails.length,
          ...stats,
          lastEmail: recentEmails[0]?.created_at || 'None'
        };
      }
    } catch (statsError) {
      debugInfo.emailStats = { error: statsError instanceof Error ? statsError.message : 'Unknown error' };
    }

    // Check for users, admins, and employees with emails
    try {
      const [usersResult, adminsResult, employeesResult] = await Promise.all([
        supabase.from('contacts').select('id, email').not('email', 'is', null).limit(5),
        supabase.from('admin').select('id, email').not('email', 'is', null).limit(5),
        supabase.from('employees').select('id, email').not('email', 'is', null).limit(5)
      ]);

      debugInfo.recipients = {
        users: usersResult.data?.length || 0,
        admins: adminsResult.data?.length || 0,
        employees: employeesResult.data?.length || 0,
        sampleUsers: usersResult.data?.map(u => ({ id: u.id, email: u.email })) || [],
        sampleAdmins: adminsResult.data?.map(a => ({ id: a.id, email: a.email })) || [],
        sampleEmployees: employeesResult.data?.map(e => ({ id: e.id, email: e.email })) || []
      };
    } catch (recipientError) {
      debugInfo.recipients = { error: recipientError instanceof Error ? recipientError.message : 'Unknown error' };
    }

    return NextResponse.json(debugInfo);

  } catch (error) {
    console.error('Debug email error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, email } = await request.json();

    if (action === 'test-send' && email) {
      // Send a test email
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const testEmailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">🔧 TechFix Pro - Email Test</h2>
          <p>This is a test email to verify that your email configuration is working correctly.</p>
          <div style="background: #f0f8ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <strong>Test Details:</strong><br>
            Sent at: ${new Date().toLocaleString()}<br>
            From: TechFix Pro System<br>
            To: ${email}
          </div>
          <p>If you received this email, your email system is working properly!</p>
        </div>
      `;

      await transporter.sendMail({
        from: `"TechFix Pro Test" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: '🔧 TechFix Pro - Email Configuration Test',
        html: testEmailHtml,
      });

      return NextResponse.json({ 
        success: true, 
        message: `Test email sent to ${email}` 
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Debug email POST error:', error);
    return NextResponse.json({ 
      error: 'Failed to process request',
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}