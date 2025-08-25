import { NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabaseAdmin";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('Admin auth request:', body);
    
    const { action, email, password, otp } = body;

    if (action === 'send-otp') {
      // Verify admin credentials and send OTP
      const { data: admin, error: adminError } = await supabase
        .from('admin')
        .select('*')
        .eq('email', email)
        .single();

      if (adminError || !admin) {
        return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
      }

      const isValidPassword = await bcrypt.compare(password, admin.password_hash);
      if (!isValidPassword) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }

      // Generate OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

      // Save OTP to admin table
      await supabase.from("admin").update({
        otp: otpCode,
        otp_purpose: 'signin',
        otp_expires_at: otpExpiresAt,
      }).eq('email', email);

      // Send OTP email
      try {
        const { sendAdminOTPEmail } = await import('@/lib/adminMailer');
        await sendAdminOTPEmail(email, otpCode, admin.full_name);
      } catch (emailError) {
        console.error('Email error:', emailError);
        return NextResponse.json({ error: 'Failed to send OTP email' }, { status: 500 });
      }

      return NextResponse.json({ message: "OTP sent successfully" });
    }

    if (action === 'verify-otp') {
      const { data: admin, error } = await supabase
        .from('admin')
        .select('*')
        .eq('email', email)
        .eq('otp', otp)
        .eq('otp_purpose', 'signin')
        .gt('otp_expires_at', new Date().toISOString())
        .single();

      if (error || !admin) {
        return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 });
      }

      // Clear OTP and update last login
      await supabase.from('admin').update({
        otp: null,
        otp_purpose: null,
        otp_expires_at: null,
        last_login: new Date().toISOString()
      }).eq('email', email);

      return NextResponse.json({
        message: "Signed in successfully!",
        user: {
          id: admin.id,
          full_name: admin.full_name,
          email: admin.email,
          role: admin.role || 'admin'
        }
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  } catch (error) {
    console.error('Admin auth error:', error);
    return NextResponse.json({ error: "Internal server error: " + (error instanceof Error ? error.message : 'Unknown error') }, { status: 500 });
  }
}